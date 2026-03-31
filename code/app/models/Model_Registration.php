<?php

namespace App\models;
use App\core\Model;
use App\data\DB;

class Model_Registration extends Model
{

    public function registration(array $credentials)
    {
        DB::dbconnect();
        $email = htmlspecialchars(trim($credentials['email']));
        $password = htmlspecialchars(trim($credentials['password']));
        $passwordagain = htmlspecialchars(trim($credentials['passwordagain']));
        $role = 'user';

        // дополнительные проверки на валидность данных, если вдруг js не сработал

        $result = [];

        if (!preg_match("/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/", $email)) {
            $result[] = "Логин может состоять только из букв английскго алфавита и цифр";
        }

        if ((strlen($password) < 8 || strlen($password) > 20)) {
            $result[] = "Пароль должен быть не меньше 8-ми символов и не больше 20";
        }

        if ($password !== $passwordagain) {
            $result[] = "Пароли не совпадают";
        }

        $user = DB::getByProp('users', 'email', $email);

        if ($user) {
            $result[] = "Такой пользователь уже существует";
        }

        if (count($result) == 0) {
            $credentials = [
                'email' => $email,
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'nickname' => substr($email, 0, strpos($email, '@')),
                'role' => $role
            ];
            $user = DB::create('users', $credentials);
            return $user;
        } else {
            return $result;
        }
    }
}