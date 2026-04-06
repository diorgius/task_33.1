<?php

namespace App\core;
use App\data\DB;

require_once 'config.php';
require_once DATA . 'DB.php';

class ActionsWithUsers
{
 
    protected $data;
    public function __construct()
    {
        if (isset($_POST)) {
            $this->data = json_decode(file_get_contents("php://input"), true);
            $method = $this->data['action'];
            $this->$method();
        }
    }

    public function getAllUsers()
    {
        DB::dbconnect();
        $result = DB::getAll('users');
        if ($result) {
            echo json_encode($result);
        } else {
            echo json_encode('Что-то пошло не так');
        }
    }

    public function createContact()
    {
        DB::dbconnect();
        $result = DB::getByCondition('user_contacts', 'contact_user_id', $this->data['contactUserId'], 'user_id', $this->data['userId']);
        if ($result) {
            return false;
        } else {
            $value = [
                'user_id' => $this->data['userId'],
                'contact_user_id' => $this->data['contactUserId'],
            ];
            $result = DB::create('user_contacts', $value);
            if ($result) {
                return true;
            } else {
                echo 'Что-то пошло не так';
            }
        }
    }
}

new ActionsWithUsers();