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
        DB::create('contacts', $value);
    }

    public function deleteContact()
    {
        DB::dbconnect();
        DB::deleteContact('contacts', $this->data['userId'], $this->data['contactUserId']);
    }

    public function deleteUserMessages()
    {
        DB::dbconnect();
        DB::deleteUserMessages('messages', $this->data['send_user_id'], $this->data['accept_user_id']);
    }

    public function getUserMessages()
    {
        // $conditions = [
        //     'value_1' => $this->data['sendUserId'],
        //     'value_2' => $this->data['acceptUserId'],
        //     'sort' => 'ORDER BY created'
        // ];

        DB::dbconnect();
        $result = DB::getUserMessages('messages', $this->data['sendUserId'], $this->data['acceptUserId']);
        // $result = DB::getUserMessages('messages', 'send_user_id', 'accept_user_id', $conditions);
        echo json_encode($result);
    }  
}

new ActionsWithUsers();