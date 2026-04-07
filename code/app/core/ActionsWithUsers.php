<?php

namespace App\core;
use App\data\DB;

// если принудительно не подключать эти файлы, то при отправке запроса в этот
// файл из js возникает ошибка (не находит класс DB и метод), возможно, 
// что в таком случае не срабатыват autoload, как подругому решить эту проблемму пока не знаю
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
        echo json_encode($result);
    }

    public function createContact()
    {
        DB::dbconnect();
        $value = [
            'user_id' => $this->data['userId'],
            'contact_user_id' => $this->data['contactUserId'],
        ];
        DB::create('user_contacts', $value);
    }

    public function deleteContact()
    {
        DB::dbconnect();
        DB::deleteContact('user_contacts', $this->data['userId'], $this->data['contactUserId']);
    }
}

new ActionsWithUsers();