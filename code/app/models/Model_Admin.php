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

    public function createUser(array $data, array $file = []): bool
    {
        $email = htmlspecialchars(trim($data['email']));
        $password = password_hash(htmlspecialchars(trim($data['password'])), PASSWORD_DEFAULT);
        $avatarFileName=$file['fileavatar']['name'];
        $nickname = htmlspecialchars(trim($data['nickname']));
        $role = htmlspecialchars(trim($data['role']));

        // проверяем, есть ли новый аватар
        if ($avatarFileName) {
            $avatarFileName = md5($email . time());
            $newAvatar = true;
        } else {
            $avatarFileName = '';
        }

        $credentials = [
            'email' => $email,
            'password' => $password,
            'nickname' => $nickname,
            'avatar' => $avatarFileName,
            'role' => $role
        ];

        DB::dbconnect();
        $user = DB::create('users', $credentials);

        if ($user) {
            if (isset($newAvatar)) {
                $filePath = AVATARS . basename($avatarFileName);
                if (!move_uploaded_file($file['fileavatar']['tmp_name'], $filePath)) {
                    echo "Что-то пошло не так";
                    return false; // надо как-то обработать ошибки
                }
            }            
            return true;
        } else {
            echo "Что-то пошло не так";
            return false; // надо как-то обработать ошибки
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

    public function updateUser(array $data, array $file = []): bool
    {
        $id = $data['id'];
        $email = htmlspecialchars(trim($data['email']));
        $password = htmlspecialchars(trim($data['password']));
        $avatarFileName=$file['fileavatar']['name'];
        isset($_POST['hideemail']) ? $hideemail = 1 : $hideemail = 0;
        $nickname = htmlspecialchars(trim($data['nickname']));
        $role = htmlspecialchars(trim($data['role']));

        DB::dbconnect();
        $user = DB::getByProp('users', 'id', $id);
        
        // проверяем, если пароль не менялся, то оставляем старый
        $password === $user['password'] ? $password = $user['password'] : $password = password_hash($password, PASSWORD_DEFAULT);

        // проверяем, есть ли новый аватар
        if ($avatarFileName) {
            $avatarFileName = md5($email . time());
            $oldAvatarFileName = $user['avatar'];
            $newAvatar = true;
        } else {
            $avatarFileName = $user['avatar'];
        }
        
        $credentials = [
            'id' => $id,
            'email' => $email,
            'password' => $password,
            'nickname' => $nickname,
            'avatar' => $avatarFileName,
            'hideemail' => $hideemail,
            'role' => $role
        ];

        $user = DB::update('users', $credentials);

        if ($user) {
            if (isset($newAvatar)) {
                $filePath = AVATARS . basename($avatarFileName);
                if (!move_uploaded_file($file['fileavatar']['tmp_name'], $filePath)) {
                    echo "Что-то пошло не так";
                    return false; // надо как-то обработать ошибки
                }
                if ($oldAvatarFileName !='') unlink(AVATARS . $oldAvatarFileName);
            }
            return true;
        } else {
            echo "Что-то пошло не так";
            return false; // надо как-то обработать ошибки
        }
    }

    public function deleteUser(int $id): void
    {
        DB::dbconnect();
        DB::delete('users', $id);
    }
}