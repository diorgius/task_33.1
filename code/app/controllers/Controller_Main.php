<?php

namespace App\controllers;
use App\core\Controller;
use App\models\Model_Main;
use App\data\DB;

class Controller_Main extends Controller
{
    protected $model;

    public function index()
    {
        $this->checkLogin();
        $this->model = new Model_Main();
        // $data = $this->model->getData();
        $this->view->generate('view_main.php', 'view_template.php', $data = null);
    }

    public function checkLogin()
    {
        if (isset($_COOKIE['id']) && isset($_COOKIE['hash'])) {

            DB::dbconnect();
            $user = DB::getByProp('users', 'id', intval($_COOKIE['id']));
        
            if(intval($_COOKIE['id']) === $user['id'] && $_COOKIE['hash'] === $user['cookiehash']) {
                $_SESSION['auth'] = true;
                $_SESSION['userId'] = $user['id'];
                $_SESSION['nickname'] = $user['nickname'];
            } else {
                setcookie("id", '', time() - 60 * 60 * 24, "/", "", false, true);
                setcookie("hash", '', time() - 60 * 60 * 24, "/", "", false, true);
            }
        }
    }
}