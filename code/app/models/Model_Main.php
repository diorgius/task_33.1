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

            if ($user) {
                return $user;
            } else {
                return false;
            }
        }
    }
}