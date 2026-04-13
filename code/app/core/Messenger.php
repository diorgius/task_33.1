<?php

namespace App\core;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Messenger implements MessageComponentInterface
{
    protected $clients;
    protected $userId;
    public function __construct()
    {
        $this->clients = new \SplObjectStorage();
        echo "WebSocket Server started\n";
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->clients->attach($conn);
        $message = json_encode(['connectId' => $conn->resourceId]);
        $conn->send($message);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $message)
    {
        $data = json_decode($message, true);
        $this->clients->userId[$from->resourceId] = $data['userId'];
        switch ($data['command']) {
            case 'connect':
                $this->sendGreetingMessage($from, $data);
                break;
            case 'message':
                echo $data['to'];
                echo $data['textMessage'];
                //$this->sendPrivateMessage($from, $data['to'] ?? '', $data['textMessage'] ?? '');
                break;
        }

        var_dump($from);
        var_dump($this->clients);
    }

    protected function sendGreetingMessage(ConnectionInterface $from, $data)
    {
        $connectedUsers = [];
        foreach ($this->clients as $client) {
            $connectedUsers[$client->resourceId] = $this->clients->userId[$client->resourceId];
            // var_dump($client);
        }
        $data['connectedUsers'] = $connectedUsers;
        $data['connectId'] = (string) $from->resourceId;
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            // if ($from !== $client) {
                $client->send($message);
            // }
        }
    }

    protected function sendPrivateMessage(ConnectionInterface $from, string $toClientId, string $message)
    {
        $fromInfo = $this->clientInfo[$from->resourceId];
        $toConn = null;

        // Find recipient connection
        foreach ($this->usersInfo as $info) {
            if ($info['id'] === $toClientId) {
                $toConn = $info['connection'];
                break;
            }
        }

        $toConn->send(json_encode([
            'type' => 'private_message',
            'from' => $fromInfo['id'],
            'message' => $message,
            'timestamp' => time()
        ]));

        echo "Private message from {$fromInfo['id']} to {$toClientId}\n";
    }

    public function onClose(ConnectionInterface $conn)
    {   
        
        $userId = $this->clients->userId[$conn->resourceId];
        $data = [
            'command' => 'disconnect',
            'userId' => $userId,
            'connectId' => (string) $conn->resourceId
        ];
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($conn->resourceId !== $client->resourceId) {
                $client->send($message);
            }
        }
        unset($this->clients->userId[$conn->resourceId]);
        unset($connectedUsers[$client->resourceId]);
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Throwable $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
