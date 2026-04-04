<?php

namespace App\core;
use App\data\DB;

require_once 'config.php';
require_once DATA . 'DB.php';

class CheckData
{
    public function __construct()
    {
        if (isset($_POST)) {
            $data = json_decode(file_get_contents("php://input"), true);
            $prop = array_keys($data);
            $value = htmlspecialchars(trim($data[$prop[0]]));

            DB::dbconnect();
            $result = DB::getByProp('users', $prop[0], $value);

            if ($result) {
                echo $error = "Пользователь с таким {$prop[0]} уже существует";
            }
        }
    }
}

new CheckData();