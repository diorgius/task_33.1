<?php

namespace App\core;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

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
        // var_dump($from);
        // var_dump($data);
        // var_dump($this->clients);
        
        // echo $data['to'];
        // echo $data['textMessage'];
        $data['from'] = (string) $from->resourceId;
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            var_dump($client);
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
            }
        }


        // делаем запись в базу


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
