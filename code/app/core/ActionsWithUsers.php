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

    // метод проверки email при регистрации и nickname в профиле
    public function checkUserData()
    {
        DB::dbconnect();
        $prop = array_keys($this->data)[1];
        $value = htmlspecialchars(trim($this->data[$prop]));
        $result = DB::getByProp('users', $prop, $value);

        if ($result) {
            echo "Пользователь с таким {$prop} уже существует";
        }
    }

    // метод получения всех пользователей
    public function getAllUsers()
    {
        DB::dbconnect();
        $result = DB::getAll('users');
        echo json_encode($result);
    }

    // метод создания контакта
    public function createContact()
    {
        DB::dbconnect();
        $value = [
            'user_id' => $this->data['userId'],
            'contact_user_id' => $this->data['contactUserId'],
        ];
        DB::create('contacts', $value);
    }

    // метод удаления контакта
    public function deleteContact()
    {
        DB::dbconnect();
        DB::deleteContact('contacts', $this->data['userId'], $this->data['contactUserId']);
    }

    // метод удаления всех сообщений с контактом
    public function deleteUserMessages()
    {
        DB::dbconnect();
        DB::deleteUserMessages('messages', $this->data['send_user_id'], $this->data['accept_user_id']);
    }

    // метод получения всех сообщений с контактом
    public function getUserMessages()
    {
        DB::dbconnect();
        $result = DB::getUserMessages('messages', $this->data['sendUserId'], $this->data['acceptUserId']);
        echo json_encode($result);
    }

    // метод получения всех контактов пользователя
    public function getUserContacts()
    {
        DB::dbconnect();
        $result = DB::getContacts('contacts', 'user_id', $this->data['user_id']);
        echo json_encode($result);
    }
}

new ActionsWithUsers();