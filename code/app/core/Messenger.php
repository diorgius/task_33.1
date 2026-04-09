<?php

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\WebSocket\WsServer;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;

// require dirname(__DIR__) . '/vendor/autoload.php';

class Messenger implements MessageComponentInterface {
    protected $clients;

    public function __construct() {
        $this->clients = new SplObjectStorage();
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->offsetSet($conn);
        echo "Новое соединение ({$conn->resourceId})";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($msg);
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        echo "Соединение {$conn->resourceId} закрыто";
    }

    public function onError(ConnectionInterface $conn, \Throwable $e) {
        echo "Ошибка: {$e->getMessage()}";
        $conn->close();
    }
}

$server = IoServer::factory(
  new HttpServer(
    new WsServer(
      new Messenger()
    )
  ),
  8888
  
);

// Запускаем сервер
echo "WebSocket server started\n";
$server->run();