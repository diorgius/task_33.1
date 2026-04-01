<?php

namespace App\models;
use App\core\Model;
use App\data\DB;

class Model_Profile extends Model
{

    public function editUser(int $id)
    {
        DB::dbconnect();
        $user = DB::getByProp('users', 'id', $id);

        if ($user) {
            return $user;
        } else {
            return false;
        }
    }

    public function updateUser(array $data)
    {
        $id = $_SESSION['userId'];
        $email = htmlspecialchars(trim($data['email']));
        $password = htmlspecialchars(trim($data['password']));
        $nickname = htmlspecialchars(trim($data['nickname']));

        // надо делать проверки на соответствие введенных данных как при регистрации 

        // проверяем, если пароль не менялся, то оставляем старый
        DB::dbconnect();
        $user = DB::getByProp('users', 'id', $id);

        if ($password === $user['password']) {
            $password = $user['password'];
        } else {
            $password = password_hash($password, PASSWORD_DEFAULT);
        }

        $credentials = [
            'id' => $id,
            'email' => $email,
            'password' => $password,
            'nickname' => $nickname,
        ];

        $user = DB::update('users', $credentials);

        if ($user) {
            return true;
        } else {
            return false;
        }
    }

    public function deleteUser(int $id): void
    {
        DB::dbconnect();
        DB::delete('users', $id);
    }
}