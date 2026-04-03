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
        $id = $_SESSION['userId'];
        $email = htmlspecialchars(trim($data['email']));
        $password = htmlspecialchars(trim($data['password']));
        $avatarFileName=$file['fileavatar']['name'];
        isset($_POST['hideemail']) ? $hideemail = 1 : $hideemail = 0;
        $nickname = htmlspecialchars(trim($data['nickname']));

        // с загрузкой изображений в базу до конца не разобрался, в базу данные загружаются,
        // но почему-то, при извлечении картинка не востанавливается, либо при загрузке двоичных данных в blob, 
        // либо при извлечении что-то не так (разобраться интересно, но пока не хочу тратить время), поэтому в базу
        // будем загружать название картинки, которое будем изменять на уникально-сгенерированное и присваивать 
        // расширение на основании типа изображение (или писать без расширения, а браузер сам разберется (если, что тип файла проверен)), 
        // сами файлы загружать в директорию avatars, проверять есть ли старый аватар и удалять его
        // $image=addslashes(file_get_contents($file['fileavatar']['tmp_name']));

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
            'avatar' => $avatarFileName,
            'hideemail' => $hideemail,
            'nickname' => $nickname,
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