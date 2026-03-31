<?php

namespace App\core;
use App\data\DB;

require_once 'config.php';
require_once DATA . 'DB.php';

class CheckEmail
{
    public function __construct()
    {
        if (isset($_POST)) {
            $data = file_get_contents("php://input");
            $userEmail = json_decode($data, true);
            $email = htmlspecialchars(trim($userEmail['userEmail']));
            // var_dump($userEmail['userEmail']);

            // $pdo = new PDO('sqlite:' . DATA . 'db.sqlite');
            // $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :value");
            // $stmt->execute(['value' => $email]);
            // $result = $stmt->fetch(PDO::FETCH_ASSOC);

            // почему-то не находит класс, наверно потому-что при вызове из js не работает автолоадер
            DB::dbconnect();
            $result = DB::getByProp('users', 'email', $email);

               if ($result) {
                echo $error = 'Пользователь с таким email уже существует';
            }
        }
    }
}

new CheckEmail();