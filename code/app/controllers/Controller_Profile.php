<?php

namespace App\controllers;

use App\core\Controller;
use App\models\Model_Profile;

class Controller_Profile extends Controller
{

    protected $model;

    public function index()
    {
        if (isset($_SESSION['auth'])) {
            $this->model = new Model_Profile();
            $data = $this->model->editUser($_SESSION['userId']);
            $this->view->generate('view_profile.php', 'view_template.php', $data);
        } else {
            $this->view->generate('view_404.php', 'view_template.php');
        }
    }

    public function updateUser()
    {
        if (isset($_POST) && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $this->model = new Model_Profile();
            $user = $this->model->updateUser($_POST);
            if ($user) {
                header('location: /profile');
            }
        }
    }

    public function deleteUser()
    {
        $this->model = new Model_Profile();
        $this->model->deleteUser($_SESSION['userId']);
        header('location: /login/signout');
    }
}