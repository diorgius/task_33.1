<?php

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
    $port
);

echo "WebSocket server running on port {$port}\n";
echo "Press Ctrl+C to stop\n";

$server->run();