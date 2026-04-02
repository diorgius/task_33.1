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

    public function updateUser(array $data, array $file = []): bool
    {
        
        // var_dump($_POST);
        // var_dump($_FILES);

        $id = $_SESSION['userId'];
        $email = htmlspecialchars(trim($data['email']));
        $password = htmlspecialchars(trim($data['password']));
        $avatarFileName=$file['fileavatar']['name'];
        $nickname = htmlspecialchars(trim($data['nickname']));

        // с загрузкой изображений в базу до конца не разобрался, в базу данные загружаются,
        // но почему-то, при извлечении картинка не востанавливается, либо при загрузке двоичных данных в blob, 
        // либо при извлечении что-то не так (разобраться интересно, но пока не хочу тратить время), поэтому в базу
        // будем загружать название картинки, которое будем изменять на уникально-сгенерированное и присваивать 
        // расширение на основании типа изображение (или писать без расширения, а браузер сам разберется (если, что тип файла проверен)), 
        // сами файлы загружать в директорию avatars, проверять есть ли старый аватар и удалять его
        // $image=addslashes(file_get_contents($file['fileavatar']['tmp_name']));

        // $avatarFileType = $file['fileavatar']['type'];

        // проверяем, если пароль не менялся, то оставляем старый
        DB::dbconnect();
        $user = DB::getByProp('users', 'id', $id);

        if ($password === $user['password']) {
            $password = $user['password'];
        } else {
            $password = password_hash($password, PASSWORD_DEFAULT);
        }

        if ($user['avatar']) $oldAvatarFileName = $user['avatar'];
        if ($avatarFileName) $avatarFileName = md5($email . time());

        $credentials = [
            'id' => $id,
            'email' => $email,
            'password' => $password,
            'avatar' => $avatarFileName,
            // 'avatar' => $image,
            'nickname' => $nickname,
        ];

        $user = DB::update('users', $credentials);

        if ($user) {
            if ($avatarFileName) {
                $filePath = AVATARS . basename($avatarFileName);
                if (!move_uploaded_file($file['fileavatar']['tmp_name'], $filePath)) {
                    return false; // надо как-то обработать ошибки
                }
                if (isset($oldAvatarFileName)) unlink(AVATARS . $oldAvatarFileName);
            }
            return true;
        } else {
            return false; // надо как-то обработать ошибки
        }
    }

    public function deleteUser(int $id): void
    {
        DB::dbconnect();
        DB::delete('users', $id);
    }
}