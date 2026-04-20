<?php

namespace App\core;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use App\data\DB;
use DateTime;
use DateTimeZone;

class Messenger implements MessageComponentInterface
{
    protected $clients;
    protected $userId;
    protected $connectedUsers;

    public function __construct()
    {
        $this->clients = new \SplObjectStorage();
        echo "WebSocket Server started\n";
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->offsetSet($conn);
        $message = json_encode(['connectId' => $conn->resourceId]);
        $conn->send($message);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $message)
    {
        $data = json_decode($message, true);

        switch ($data['command']) {
            // проверяем пришедшее сообщение на действие которое надо произвести
            case 'connect':
                // записываем id пользователя
                $this->clients->userId[$from->resourceId] = $data['userId'];
                // метод отправки сообщения всем пользователям о своем присоединении к серверу
                $this->sendGreetingMessage($from, $data);
                break;
            case 'privateMessage':
                // метод отправки приватного сообщения
                $this->sendPrivateMessage($from, $data);
                break;
            case 'deleteMessage';
                // метод отправки сообщения об удалении сообщения
                $this->deleteMessage($from, $data);
                break;
            case 'editMessage';
                // метод отправки отредактированного сообщения
                $this->editMessage($from, $data);
                break;
            case 'forwardMessage';
                // метод отправки персланного сообщения
                $this->forwardMessage($from, $data);
                break;
        }
    }

    protected function sendGreetingMessage(ConnectionInterface $from, $data)
    {
        $this->connectedUsers = [];
        foreach ($this->clients as $client) {
            $this->connectedUsers[$client->resourceId] = $this->clients->userId[$client->resourceId];
        }
        $data['connectedUsers'] = $this->connectedUsers;
        $data['connectId'] = (string) $from->resourceId;
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            $client->send($message);
        }
    }

    protected function sendPrivateMessage(ConnectionInterface $from, $data)
    {
        // делаем запись сообщения в базу
        DB::dbconnect();
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в базу
        $value = [
            'send_user_Id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => htmlspecialchars($data['text_message']),
            // 'status_message' => '',
            'created' => $created
        ];
        // записываем в базу
        $result = DB::create('messages', $value);
        // дополняем сообщение для отправки пользователю
        if ($result) {
            $data['id'] = $result;
            $data['from'] = (string) $from->resourceId;
            $data['created'] = $created;
        } // возможно надо сделать проверку записи на ошибки и вывод ошибок
        // формируем ответ отправителю сообщения, для вывода сообщения у него
        $replay = [
            'command' => 'replay',
            'id' => $result,
            'send_user_id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_d'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];
        // var_dump($data);
        $message = json_encode($data);
        $replay = json_encode($replay);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
            }
            // добавлена отправка сообщения самому себе после отправки сообщения адресату
            // для того чтобы получить message_id из БД и дату и время сообщения
            // для присвоения div id для однозначной идентификации
            // сообщения и вывода даты и времени
            if ($client->resourceId === intval($data['from'])) {
                $client->send($replay);
            }
        }
        echo "Private message from {$from->resourceId} to {$data['to']}\n";
    }

    protected function deleteMessage(ConnectionInterface $from, $data)
    {
        // делаем удаление сообщения из базы
        DB::dbconnect();
        // удаляем сообщение в базе
        DB::delete('messages', $data['id']);
        // отправляем сообщение пользователю для удаления сообщения у него
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
                break;
            }
        }
    }

    protected function editMessage(ConnectionInterface $from, $data)
    {
        // делаем изменение сообщения в базе
        DB::dbconnect();
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в базу
        $value = [
            'id' => $data['id'],
            'send_user_Id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => htmlspecialchars($data['text_message']),
            'status_message' => 'edited',
            'created' => $created
        ];
        // записываем изменения в базу
        $result = DB::update('messages', $value);
        // отправляем сообщение пользователю для изменения сообщения у него
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
                break;
            }
        }
    }

    public function forwardMessage(ConnectionInterface $from, $data)
    {
        var_dump($data);

        // можно делать запись в базу и здесь, но тогда оно будет записано
        // только для тех пользователей, которые активны в настоящий момент,
        // а тем кому пересылали, но они не активны оно не запишитеся в БД
        // ??? надо подумать как передать данные через сокет что бы записывалось для всех адресатов
        // $date = new DateTime();
        // $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        // $created = $date->format('Y-m-d H:i:s');
        // $values = [
        //     'send_user_id' => $data['send_user_id'],
        //     'accept_user_id' => $data['usersId'],
        //     'text_message' => $data['text_message'],
        //     'status_message' => 'forwarded',
        //     'created' => $created
        // ];
        // // var_dump($values);
        // DB::create('messages', $values);

        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
                break;
            }
        }
    }

    public function onClose(ConnectionInterface $conn)
    {

        $userId = $this->clients->userId[$conn->resourceId];

        $data = [
            'command' => 'disconnect',
            'userId' => $userId,
            'connectId' => (string) $conn->resourceId,
        ];
        $message = json_encode($data);

        foreach ($this->clients as $client) {
            if ($conn->resourceId !== $client->resourceId) {
                $client->send($message);
            }
        }

        unset($this->clients->userId[$conn->resourceId]);
        unset($this->connectedUsers[$client->resourceId]);
        $this->clients->offsetUnset($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Throwable $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
