<?php

namespace App\controllers;

use App\core\Controller;

class Controller_404 extends Controller
{
    public function index()
    {
        $this->view->generate('view_404.php', 'view_template.php');
    }
}