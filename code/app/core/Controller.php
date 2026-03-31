<?php

    namespace App\core;
    
    class Controller
    {
        protected $view;
        
        public function __construct() {
            $this->view = new View();
        }

        public function index() {

        }

    }