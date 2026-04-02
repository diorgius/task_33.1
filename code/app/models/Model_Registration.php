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
        $role = 'user';

        $credentials = [
            'email' => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'nickname' => substr($email, 0, strpos($email, '@')),
            'role' => $role
        ];
        $user = DB::create('users', $credentials);
        if ($user) {
            return $user;
        } else {
            return false;
        }

    }
}