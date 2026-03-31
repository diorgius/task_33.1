<?php

namespace App\controllers;
use App\core\Controller;
use App\models\Model_Login;

require_once CORE . 'logger.php';

class Controller_Login extends Controller
{
    protected $model;

    public function index()
    {
        $this->view->generate('view_login.php', 'view_template.php');
    }

    public function signup()
    {
        if (isset($_POST) && $_SERVER['REQUEST_METHOD'] === 'POST') {
            if (
                !isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) ||
                !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
            ) {
                $data = 'Login: CSRF токен не валидный';
                logging('warning', $data);
                $this->view->generate('view_login.php', 'view_template.php', $data);
            } else {
                $credentials = $_POST;
                if (isset($_POST['remember'])) {
                    $remember = $_POST['remember'];
                }
                $this->model = new Model_Login();
                $user = $this->model->login($credentials);

                if ($user) {
                    $_SESSION['auth'] = true;
                    $_SESSION['userId'] = $user['id'];
                    $_SESSION['nickname'] = $user['nickname'];
                    $_SESSION['role'] = $user['role'];
                    if(isset($remember)) $this->model->setcookie($user['id']);
                    header('location: /');
                    exit();
                } else {
                    $data = "Wrong login or password: email - {$credentials['emaillogin']}, password - {$credentials['passwordlogin']}";
                    logging('info', $data);
                    $data = 'Неверное имя пользователя или пароль';
                    $this->view->generate('view_login.php', 'view_template.php', $data);
                }
            }
        }
    }

    public function signout()
    {
        unset($_SESSION['auth']);
        unset($_SESSION['userId']);
        unset($_SESSION['nickname']);
        unset($_SESSION['csrf_token']);
        setcookie("id", '', time() - 60 * 60 * 24, "/", "", false, true);
        setcookie("hash", '', time() - 60 * 60 * 24, "/", "", false, true);
        session_destroy();
        header('location: /');
        exit();
    }
}