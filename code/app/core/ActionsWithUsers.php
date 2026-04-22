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

    // метод проверки email при регистрации и nickname в профиле
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

    // метод создания контакта
    public function createContact()
    {
        DB::dbconnect();
        // создаем контакт у себя
        $values = [
            'user_id' => $this->data['user_id'],
            'contact_user_id' => $this->data['contact_user_id'],
        ];
        DB::create('contacts', $values);
        // создаем контакт у добавленного пользователя
        $values = [
            'user_id' => $this->data['contact_user_id'],
            'contact_user_id' => $this->data['user_id'],
        ];
        DB::create('contacts', $values);
        // записываем в БД сообщение
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в БД
        $values = [
            'send_user_id' => $this->data['user_id'],
            'accept_user_id' => $this->data['contact_user_id'],
            'text_message' => htmlspecialchars($this->data['text_message']),
            'created' => $created
        ];
        // записываем в БД сообщение
        DB::create('messages', $values);
    }

    // метод получения всех сообщений с контактом
    public function getUserMessages()
    {
        DB::dbconnect();
        $result = DB::getUserMessages('messages', $this->data['send_user_id'], $this->data['accept_user_id']);
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
        $values = [
            'group_name' => htmlspecialchars($this->data['group_name']),
        ];
        $result = DB::create('groupchats', $values);
        echo $result;
    }
}

new ActionsWithUsers();