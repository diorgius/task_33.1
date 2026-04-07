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
        if ($result) {
            echo json_encode($result);
        } else {
            // надо как-то обработать ошибки
            echo json_encode('Что-то пошло не так');
        }
    }

    public function createContact()
    {
        DB::dbconnect();
        // $result = DB::getByCondition('user_contacts', 'contact_user_id', $this->data['contactUserId'], 'user_id', $this->data['userId']);
        // if ($result) {
        //     return false;
        // } else {
            $value = [
                'user_id' => $this->data['userId'],
                'contact_user_id' => $this->data['contactUserId'],
            ];
            $result = DB::create('user_contacts', $value);
            
            // надо здесь подумать над возвратом данных, такое условие не работает, потому-что в result, все равно возвращается что-то и это условие не работает
            if ($result) {
                echo $result;
            } else {
                // надо как-то обработать ошибки
                echo 'Что-то пошло не так';
                return false;
            }
        // }
    }

    public function deleteContact()
    {
        // echo $this->data['userId'];
        // echo $this->data['contactUserId'];
        // exit();
        DB::dbconnect();
        DB::deleteContact('user_contacts', $this->data['userId'], $this->data['contactUserId']);
    }
}

new ActionsWithUsers();