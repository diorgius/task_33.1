<?php

namespace App\models;
use App\core\Model;
use App\data\DB;

require_once CORE . 'config.php';

class Model_Main extends Model
{
    public function getUser(int $id)
    {
        if ($id !== 0) {
            DB::dbconnect();
            // получаем из БД данные пользователя
            $user = DB::getByProp('users', 'id', $id);
            // получаем из БД контакты пользователя
            $contacts = DB::getContacts('contacts', 'user_id', 'contact_user_id', $id);
            // получаем из БД группы пользователя
            $groups = DB::getGroups('contacts', 'user_id', $id);
            if ($user) {
                $data = [
                    'user' => $user,
                    'contacts' => $contacts,
                    'groups' => $groups
                ];
                return $data;
            } else {
                return false;
            }
        }
    }
}