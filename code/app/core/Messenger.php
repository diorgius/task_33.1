<?php

namespace App\core;

use stdClass;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class Messenger implements MessageComponentInterface
{
    protected $clients = [];
    protected $usersId;

    public function __construct()
    {
        // $this->users = new stdClass();
        // $this->clients = new \SplObjectStorage();
        echo "WebSocket Server started\n";
    }

    public function onOpen(ConnectionInterface $conn)
    {
        // $this->clients->attach($conn);
        $this->clients[$conn->resourceId] = $conn;
        $message = json_encode(['onconnection' => $conn->resourceId]);
        $conn->send($message);
        // $this->usersInfo[$conn->resourceId] = [
        //     'id' => $userId,
        //     'connection' => $conn,
        //     // 'rooms' => [],
        //     // 'metadata' => []
        // ];

        // Send welcome message
        // $conn->send(json_encode([
        //     'type' => 'welcome',
        //     'client_id' => $clientId,
        //     'timestamp' => time()
        // ]));
        var_dump($this->clients);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {

        $data = json_decode($msg, true);
        // $this->users->usersId;

        if ($data['command'] === 'register') {
            // добавлять еще и resourceId???
            $this->usersId['contactsId'][] = $data['userId'];
            // $conn->send( $message);
        } elseif ($data['command'] === 'message') {
            echo $data['to'];
            echo $data['textMessage'];
        }

        var_dump($from);
        var_dump($this->usersId);
        var_dump($this->clients);
        var_dump($data);


        // $this->sendPrivateMessage($from, $data['to'] ?? '', $data['textMessage'] ?? '');


        // рассылка всем подключенным клиентам
        // $this->clients->attach($from);
        // $numRecv = count($this->clients) - 1;
        // echo sprintf(
        //     'Connection %d sending message "%s" to %d other connection%s' . "\n"
        //     ,
        //     $from->resourceId,
        //     $msg,
        //     $numRecv,
        //     $numRecv == 1 ? '' : 's'
        // );

        // foreach ($this->clients as $client) {
        //     if ($from !== $client) {
        //         $client->send($msg);
        //     }
        // }
    }

    protected function sendPrivateMessage(ConnectionInterface $from, string $toClientId, string $message) {
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
        $this->clients->detach($conn);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Throwable $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}
