<?php

namespace App\controllers;
use App\core\Controller;
use App\models\Model_Login;
use App\models\Model_Registration;

require_once CORE . 'logger.php';

class Controller_Registration extends Controller
{
    protected $model;

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
                $data[] = 'CSRF токен не валидный';
                $error = 'Registration: CSRF токен не валидный';
                logging('warning', $error);
                $this->view->generate('view_registration.php', 'view_template.php', $data);
            } else {
                $credentials = $_POST;
                $this->model = new Model_Registration();
                $result = $this->model->registration($credentials);
                if (is_array($result)) {
                    $data = $result;
                    foreach ($data as $error) {
                        $error = 'Registration: ' . $error . ", email - {$credentials['email']}, password - {$credentials['password']}";
                        logging('info', $error);
                    }
                    $this->view->generate('view_registration.php', 'view_template.php', $data);
                } else {
                    $data = 'Успешная регистрация, пожалуйста авторизуйтесь';
                    $this->view->generate('view_login.php', 'view_template.php', $data);
                }
            }
        }
    }
}