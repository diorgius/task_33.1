<?php

namespace App\controllers;
use App\core\Controller;
use App\models\Model_Login;
use App\models\Model_Registration;
use Random\Randomizer;

require_once CORE . 'logger.php';
require_once CORE . 'mailer.php';

class Controller_Registration extends Controller
{
    protected $model;
    
    // хотел сделать передачу значений через свойства класса, но не работает, 
    // вероятно потому что сначала отрабатывается один метод, 
    // потом обновляеется страница и вызывается другой метод

    // protected $credentials; 
    // protected $code;

    public function index()
    {
        $this->view->generate('view_registration.php', 'view_template.php');
    }

    public function signup()
    {
        if (isset($_POST) && $_SERVER['REQUEST_METHOD'] === 'POST') {
            if (
                !isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) ||
                !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
            ) {
                // если убрать проверку на бэке, то массив не нужен
                $data[] = 'CSRF токен не валидный'; 
                $error = 'Registration: CSRF токен не валидный';
                logging('warning', $error);
                $this->view->generate('view_registration.php', 'view_template.php', $data);
            } else {
                
                // попробуем реализовать отправку 6-ти значного КОДА подтверждения на почту 
                // (НЕ ССЫЛКУ для активании, потому что как потом перенапралять ссылку из письма на localhost???)

                // такой вариант работает, но после обновления страницы и вызова другого метода данных в свойтве уже не остается,
                // поэтому (пока) буду писать в сессию
                // $this->credentials = $_POST; 
                // $email = trim($this->credentials['email']);
                $credentials = $_POST; 
                $_SESSION['credentials'] = $credentials;
                $email = trim($credentials['email']);
                $rand = new Randomizer();
                // $this->code = $rand->getInt(100000, 999999);
                $code = $rand->getInt(100000, 999999);
                $_SESSION['code'] = $code;

                // var_dump($this->code);
                // var_dump($this->credentials);
                echo $code;

                // $send = mailsend($email, $this->code);
                // $send = mailsend($email, $code);
                
                // заглушка для проверки
                $send = true; 
                
                if ($send) {
                    $this->view->generate('view_codeverification.php', 'view_template.php');
                } else {
                    $data = 'Ошибка отправки кода, проверте email';
                    $error = "Registration: Error sending verification code, email - {$credentials['email']}, password - {$credentials['password']}";
                    logging('info', $error);
                    $this->view->generate('view_registration.php', 'view_template.php', $data);
                }

                // если использовать проверочный код, то проверки вводимых данных придется убирать, а чаcть кода с регистрацией переносить в codeverification()

                // $this->model = new Model_Registration();
                // $result = $this->model->registration($credentials);
                // if (is_array($result)) {
                //     $data = $result;
                //     foreach ($data as $error) {
                //         $error = 'Registration: ' . $error . ", email - {$credentials['email']}, password - {$credentials['password']}";
                //         logging('info', $error);
                //     }
                //     $this->view->generate('view_registration.php', 'view_template.php', $data);
                // } else {
                //     $data = 'Успешная регистрация, пожалуйста авторизуйтесь';
                //     $this->view->generate('view_login.php', 'view_template.php', $data);
                // }
            }
        }
    }

    public function codeverification() 
    {
        if (isset($_POST) && $_SERVER['REQUEST_METHOD'] === 'POST') {

            // var_dump($_POST['code']);
            // var_dump($this->code);
            // var_dump($this->credentials);
            var_dump($_SESSION['code']);
            var_dump($_SESSION['credentials']);

            // if (intval(trim($_POST['code'])) === $this->code) {
            if (intval(trim($_POST['code'])) === $_SESSION['code']) {

                $this->model = new Model_Registration();
                $result = $this->model->registration($_SESSION['credentials']);

                unset($_SESSION['code']);
                unset($_SESSION['credentials']);

                $data = 'Успешная регистрация, пожалуйста авторизуйтесь';
                $this->view->generate('view_login.php', 'view_template.php', $data);
            } else {
                // $error = "Registration: Verification code is wrong, code - {$this->code}, email - {$this->credentials['email']}, password - {$this->credentials['password']}";
                $error = "Registration: Verification code is wrong, sendcode - {$_SESSION['code']}, receivedcode - {$_POST['code']}, email - {$_SESSION['credentials']['email']}, password - {$_SESSION['credentials']['password']}";
                logging('info', $error);

                unset($_SESSION['code']);
                unset($_SESSION['credentials']);

                // если убрать проверку на бэке, то массив не нужен
                $data[] = 'Код подтверждения не верный, повторите регистрацию'; 
                $this->view->generate('view_registration.php', 'view_template.php', $data);
            }

        }
    }
}