<?php

namespace App\models;
use App\core\Model;
use App\data\DB;

class Model_Admin extends Model
{

    public function getUsers()
    {
        DB::dbconnect();
        $users = DB::getAll('users');

        if ($users) {
            return $users;
        } else {
            return false;
        }
    }

    public function createUser(array $data)
    {
        $email = htmlspecialchars(trim($data['email']));
        $password = password_hash(htmlspecialchars(trim($data['password'])), PASSWORD_DEFAULT);
        $nickname = htmlspecialchars(trim($data['nickname']));
        $role = htmlspecialchars(trim($data['role']));

        // надо делать проверки на соответствие введенных данных как при регистрации

        $credentials = [
            'email' => $email,
            'password' => $password,
            'nickname' => $nickname,
            'role' => $role
        ];

        DB::dbconnect();
        $user = DB::create('users', $credentials);

        if ($user) {
            return true;
        } else {
            return false;
        }
    }

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
        $id = $data['id'];
        $email = htmlspecialchars(trim($data['email']));
        $password = htmlspecialchars(trim($data['password']));
        $nickname = htmlspecialchars(trim($data['nickname']));
        $role = htmlspecialchars(trim($data['role']));

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
            'role' => $role
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