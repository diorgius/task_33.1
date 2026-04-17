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
            case 'connect':
                $this->clients->userId[$from->resourceId] = $data['userId'];
                $this->sendGreetingMessage($from, $data);
                break;
            case 'privateMessage':
                $this->sendPrivateMessage($from, $data);
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

        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');

        $value = [ 
            'send_user_Id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];

        $result = DB::create('messages', $value);

        if ($result) {
            $data['message_id'] = $result;
            $data['from'] = (string) $from->resourceId;
            $data['created'] = $created;
        }

        $replay = [
            'command' => 'replay',
            'message_id' => $result,
            'send_user_id'=> $data['send_user_id'],
            'accept_user_id'=> $data['accept_user_d'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];

        var_dump($data);

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
