<?php

namespace App\core;
use App\data\DB;

require_once 'config.php';
require_once DATA . 'DB.php';

class ActionsWithUsers
{
 
    // protected $action;
    public function __construct()
    {
        if (isset($_POST)) {
            $data = json_decode(file_get_contents("php://input"), true);
            $action = array_keys($data);
            $method = $data[$action[0]];
            $this->$method();
        }
    }

    public function getAllUsers()
    {
            DB::dbconnect();
            $result = DB::getAll('users');

            if ($result) {
                echo json_encode($result);
            } else {
                echo json_encode('Что-то пошло не так');
            }
    }
}


new ActionsWithUsers();