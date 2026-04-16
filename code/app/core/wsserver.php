<?php

// запускать сервер надо в докер контейнере, что работала таже версия php
// и использовалось тоже подключение к базе, иначе не подключается к базе
// в docker compose у php отрыл порт 8080 на котором висит сервер, что бы 
// можно было клиентам подключаться к серверу
// пока запускаю сервер ками в контенере:
// коннестимся к контенеру и запускаем консоль - docker exec -it messenger-php bash
// далее перходим в app/core
// php wsserver.php
// при таком варианте сервер запускается в окружении докер контенеров и все вроде работает
// потом надо сделать автозагрузку сервера при старте контенера

namespace App\core;

use Ratchet\WebSocket\WsServer;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;

require_once 'config.php';
require_once VENDOR . 'autoload.php';

$port = 8080;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Messenger()
        )
    ),
    $port,
);

echo "WebSocket server running on port {$port}\n";
echo "Press Ctrl+C to stop\n";

$server->run();