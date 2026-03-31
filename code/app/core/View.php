<?php

    namespace App\core;

    class View
    {
        public function generate($view_content, $view_template = null, $data = null) {
            if($view_template){
                include_once VIEW . $view_template;
            }
        }
    }