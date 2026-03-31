<?php

    namespace App\core;
    use App\controllers;
    define('CONTROLLERS_NAMESPACE', 'App\\controllers\\');

    require_once 'config.php';

    class Route
    {
        public static function start() {

            $controllerClassName = 'Main';
            $actionName = 'index';
            $data= [];          
            $routes = explode('/', $_SERVER['REQUEST_URI']);
            
            if (!empty($routes[1])) {
                $controllerClassName = $routes[1];
            }
                    
            if(!empty($routes[2])) {
                $actionName = $routes[2];
            }

            if(!empty($routes[3])){
                $data = array_slice($routes, 3);
            }
                    
            $controllerName = CONTROLLERS_NAMESPACE . 'Controller_' . ucfirst($controllerClassName);
            $controllerFile = 'Controller_' . ucfirst($controllerClassName) . '.php';
            $controllerPath = CONTROLLER . $controllerFile;

            if(file_exists($controllerPath)) {
                include_once $controllerPath;
            } else {
                Route::ErrorPage404();
            }
            
            $controller = new $controllerName();
            
            if(method_exists($controller, $actionName)) {
                $controller->$actionName($data);
            } else {
                Route::ErrorPage404();
            }
        }

        public static function ErrorPage404() {
            header('HTTP/1.1 404 Not Found');
            header("Status: 404 Not Found");
            header('Location:' . URL . '404');
        }
    }