<?php

namespace App\core;
use App\data\DB;
use DateTime;
use DateTimeZone;

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

    // метод проверки email при регистрации, nickname в профиле и названия группы
    public function checkUserData()
    {
        DB::dbconnect();
        $prop = array_keys($this->data)[1];
        $value = htmlspecialchars(trim($this->data[$prop]));
        $table = $this->data['table'];
        $result = DB::getByProp($table, $prop, $value);
        $message = $table === 'users' ? "Пользователь с таким {$prop} уже существует" : "Такая группа уже существует";
        if ($result) {
            echo $message;
        }
    }

    // метод получения всех пользователей
    public function getAllUsers()
    {
        DB::dbconnect();
        $result = DB::getAll('users');
        echo json_encode($result);
    }

    // метод получения всех сообщений с контактом
    public function getUserMessages()
    {
        DB::dbconnect();
        if ($this->data['chat_type'] === 'private')  {
            $result = DB::getUserMessages('messages', $this->data['send_user_id'], $this->data['accept_user_id']);
        } elseif ($this->data['chat_type'] === 'group') {
            $result = DB::getByPropAll('messages', 'accept_group_id', $this->data['accept_group_id']);
        }
        
        echo json_encode($result);
    }

    // метод получения всех контактов пользователя
    public function getUserContacts()
    {
        DB::dbconnect();
        $result = DB::getContacts('contacts', 'user_id', $this->data['user_id']);
        echo json_encode($result);
    }

    // метод создания группы
    public function createGroup()
    {
        DB::dbconnect();
        // создаем группу
        $values = [
            'group_name' => htmlspecialchars($this->data['group_name']),
            'creator' => $this->data['creator']
        ];
        $result = DB::create('groupchats', $values);
        // создаем контакт группы у создавшего группу пользователя
        $values = [
            'user_id' => $this->data['creator'],
            'contact_group_id' => $result
        ];
        DB::create('contacts', $values);
        echo $result;
    }
}

new ActionsWithUsers();