<?php

namespace App\core;
use App\data\DB;

// если принудительно не подключать эти файлы, то при отправке запроса в этот
// файл из js возникает ошибка (не находит класс DB и метод), возможно, 
// что в таком случае не срабатыват autoload, как подругому решить эту проблемму пока не знаю
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