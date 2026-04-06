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
            $user = DB::getByProp('users', 'id', $id);
            $contacts = DB::getContacts('user_contacts', 'user_id', $id);
            if ($user) {
                $data = [
                    'user' => $user,
                    'contacts' => $contacts
                ];
                return $data;
            } else {
                return false;
            }
        }
    }
}