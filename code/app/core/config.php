<?php

    namespace App\core;

    define('URL', 'http://' . $_SERVER['HTTP_HOST'] . '/');
    // define('URL', $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . DIRECTORY_SEPARATOR);
    define('ROOT', dirname(__DIR__, 2) . DIRECTORY_SEPARATOR);
    define('APP', ROOT . 'app' . DIRECTORY_SEPARATOR);
    define('CONTROLLER', APP . 'controllers' . DIRECTORY_SEPARATOR);
    define('CORE', APP . 'core' . DIRECTORY_SEPARATOR);
    define('MODEL', APP . 'models' . DIRECTORY_SEPARATOR);
    define('VIEW', APP . 'views' . DIRECTORY_SEPARATOR);
    define('DATA', APP . 'data' . DIRECTORY_SEPARATOR);
    define('IMG', ROOT . 'img' . DIRECTORY_SEPARATOR);
    define('CSS', ROOT . 'css' . DIRECTORY_SEPARATOR);
    define('JS', ROOT . 'js' . DIRECTORY_SEPARATOR);
    define('VENDOR', ROOT . 'vendor' . DIRECTORY_SEPARATOR);
    define('LOG', ROOT . 'logs' . DIRECTORY_SEPARATOR);