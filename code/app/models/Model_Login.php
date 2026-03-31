<?php

namespace App\models;
use App\core\Model;
use App\data\DB;

class Model_Login extends Model
{

    public function login(array $credentials)
    {
        DB::dbconnect();
        $email = htmlspecialchars(trim($credentials['emaillogin']));
        $password = htmlspecialchars(trim($credentials['passwordlogin']));

        $user = DB::getByProp('users', 'email', $email);

        if ($user) {
            if (password_verify($password, $user['password'])) {
                return $user;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    public function setcookie($id): void
    {
        $cookiehash = hash('gost-crypto', random_int(0, 9999));
        setcookie("id", $id, time() + 60 * 60 * 24, "/", "", false, true);
        setcookie("hash", $cookiehash, time() + 60 * 60 * 24, "/", "", false, true);
        DB::update('users', $values = ['id' => $id, 'cookiehash' => $cookiehash]);
    }
}