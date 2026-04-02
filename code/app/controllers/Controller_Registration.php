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

    // хотел сделать передачу значений между методами signup() и codeverification() типа 
    // $this->credentials = $_POST и $email = trim($this->credentials['email'])
    // через свойства класса, но не работает (работает внутри метода signup(), а в метод codeverification() приходят пустые данные), 
    // вероятно потому что сначала отрабатывается один метод, 
    // потом обновляеется страница и вызывается другой метод, поэтому буду использовать сесси

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
                $data = 'CSRF токен не валидный';
                $error = 'Registration: CSRF токен не валидный';
                logging('warning', $error);
                $this->view->generate('view_registration.php', 'view_template.php', $data);
            } else {

                // реализуем отправку 6-ти значного КОДА подтверждения на почту 
                // (НЕ ССЫЛКУ для активании, потому что как потом перенапралять ссылку из письма на localhost???)

                $credentials = $_POST;
                $_SESSION['credentials'] = $credentials;
                $email = trim($credentials['email']);
                $rand = new Randomizer();
                $code = $rand->getInt(100000, 999999);
                $_SESSION['code'] = $code;

                $send = true; // заглушка для проверки валидности кода
                // $send = mailsend($email, $code);

                if ($send) {
                    $data = 'На указанную почту отправлено письмо с кодом для подтверждения регистрации ' . $code; // $code временно, для проверки
                    $this->view->generate('view_codeverification.php', 'view_template.php', $data);
                } else {
                    $data = 'Ошибка отправки кода, проверте email';
                    $error = "Registration: Error sending verification code, email - {$credentials['email']}, password - {$credentials['password']}";
                    logging('info', $error);
                    $this->view->generate('view_registration.php', 'view_template.php', $data);
                }

            }
        }
    }

    public function codeverification()
    {
        if (isset($_POST) && $_SERVER['REQUEST_METHOD'] === 'POST') {

            if (intval(trim($_POST['code'])) === $_SESSION['code']) {
                $this->model = new Model_Registration();
                $result = $this->model->registration($_SESSION['credentials']);
                if ($result) {
                    unset($_SESSION['code']);
                    unset($_SESSION['credentials']);
                    $data = 'Успешная регистрация, пожалуйста авторизуйтесь';
                    $this->view->generate('view_login.php', 'view_template.php', $data);
                } else {
                    $error = "Registration: Something went wrong, email - {$_SESSION['credentials']['email']}, password - {$_SESSION['credentials']['password']}";
                    logging('info', $error);
                    $data = 'Что-то пошло не так, пожалуйста повторите';
                    $this->view->generate('view_registration.php', 'view_template.php', $data);
                }
            } else {
                $error = "Registration: Verification code is wrong, sendcode - {$_SESSION['code']}, receivedcode - {$_POST['code']}, email - {$_SESSION['credentials']['email']}, password - {$_SESSION['credentials']['password']}";
                logging('info', $error);
                unset($_SESSION['code']);
                unset($_SESSION['credentials']);
                $data = 'Код подтверждения не верный, повторите регистрацию';
                $this->view->generate('view_registration.php', 'view_template.php', $data);
            }
        }
    }
}