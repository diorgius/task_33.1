<?php
namespace App\core;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class Messenger implements MessageComponentInterface {
    protected $clients;
    protected $rooms;
    protected $clientInfo;

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->rooms = [];
        $this->clientInfo = [];
        echo "WebSocket Server started\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        // Store the new connection
        $this->clients->offsetSet($conn);

        // Generate unique client ID
        $clientId = uniqid('client_', true);
        $this->clientInfo[$conn->resourceId] = [
            'id' => $clientId,
            'connection' => $conn,
            'rooms' => [],
            'metadata' => []
        ];

        // Send welcome message
        $conn->send(json_encode([
            'type' => 'welcome',
            'client_id' => $clientId,
            'timestamp' => time()
        ]));

        echo "New connection: {$clientId} ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        try {
            $data = json_decode($msg, true);

            if (!$data || !isset($data['type'])) {
                $this->sendError($from, 'Invalid message format');
                return;
            }

            $this->handleMessage($from, $data);

        } catch (\Exception $e) {
            $this->sendError($from, 'Error processing message: ' . $e->getMessage());
            echo "Error: {$e->getMessage()}\n";
        }
    }

    protected function handleMessage(ConnectionInterface $from, array $data) {
        $clientInfo = $this->clientInfo[$from->resourceId];

        switch ($data['type']) {
            case 'broadcast':
                $this->broadcastMessage($from, $data['message'] ?? '');
                break;

            case 'join_room':
                $this->joinRoom($from, $data['room'] ?? '');
                break;

            case 'leave_room':
                $this->leaveRoom($from, $data['room'] ?? '');
                break;

            case 'room_message':
                $this->sendToRoom($from, $data['room'] ?? '', $data['message'] ?? '');
                break;

            case 'private_message':
                $this->sendPrivateMessage($from, $data['to'] ?? '', $data['message'] ?? '');
                break;

            case 'set_metadata':
                $this->setClientMetadata($from, $data['metadata'] ?? []);
                break;

            default:
                $this->sendError($from, 'Unknown message type: ' . $data['type']);
        }
    }

    protected function broadcastMessage(ConnectionInterface $from, string $message) {
        $clientInfo = $this->clientInfo[$from->resourceId];
        $payload = json_encode([
            'type' => 'broadcast',
            'from' => $clientInfo['id'],
            'message' => $message,
            'timestamp' => time()
        ]);

        foreach ($this->clients as $client) {
            if ($from !== $client) {
                $client->send($payload);
            }
        }

        echo "Broadcast from {$clientInfo['id']}: {$message}\n";
    }

    protected function joinRoom(ConnectionInterface $conn, string $room) {
        if (empty($room)) {
            $this->sendError($conn, 'Room name required');
            return;
        }

        $clientInfo = &$this->clientInfo[$conn->resourceId];

        // Create room if it doesn't exist
        if (!isset($this->rooms[$room])) {
            $this->rooms[$room] = [];
        }

        // Add client to room
        if (!in_array($conn->resourceId, $this->rooms[$room])) {
            $this->rooms[$room][] = $conn->resourceId;
            $clientInfo['rooms'][] = $room;

            // Notify client
            $conn->send(json_encode([
                'type' => 'room_joined',
                'room' => $room,
                'members' => count($this->rooms[$room])
            ]));

            // Notify room members
            $this->notifyRoom($room, [
                'type' => 'member_joined',
                'room' => $room,
                'client_id' => $clientInfo['id'],
                'total_members' => count($this->rooms[$room])
            ], $conn);

            echo "Client {$clientInfo['id']} joined room: {$room}\n";
        }
    }

    protected function leaveRoom(ConnectionInterface $conn, string $room) {
        $clientInfo = &$this->clientInfo[$conn->resourceId];

        if (isset($this->rooms[$room])) {
            $key = array_search($conn->resourceId, $this->rooms[$room]);
            if ($key !== false) {
                unset($this->rooms[$room][$key]);
                $this->rooms[$room] = array_values($this->rooms[$room]);

                // Remove room from client's room list
                $roomKey = array_search($room, $clientInfo['rooms']);
                if ($roomKey !== false) {
                    unset($clientInfo['rooms'][$roomKey]);
                    $clientInfo['rooms'] = array_values($clientInfo['rooms']);
                }

                // Clean up empty rooms
                if (empty($this->rooms[$room])) {
                    unset($this->rooms[$room]);
                }

                // Notify room members
                if (isset($this->rooms[$room])) {
                    $this->notifyRoom($room, [
                        'type' => 'member_left',
                        'room' => $room,
                        'client_id' => $clientInfo['id'],
                        'total_members' => count($this->rooms[$room])
                    ]);
                }

                echo "Client {$clientInfo['id']} left room: {$room}\n";
            }
        }
    }

    protected function sendToRoom(ConnectionInterface $from, string $room, string $message) {
        if (!isset($this->rooms[$room])) {
            $this->sendError($from, 'Room does not exist');
            return;
        }

        $clientInfo = $this->clientInfo[$from->resourceId];

        if (!in_array($from->resourceId, $this->rooms[$room])) {
            $this->sendError($from, 'You are not in this room');
            return;
        }

        $payload = json_encode([
            'type' => 'room_message',
            'room' => $room,
            'from' => $clientInfo['id'],
            'message' => $message,
            'timestamp' => time()
        ]);

        foreach ($this->rooms[$room] as $resourceId) {
            if ($resourceId !== $from->resourceId && isset($this->clientInfo[$resourceId])) {
                $this->clientInfo[$resourceId]['connection']->send($payload);
            }
        }

        echo "Room message in {$room} from {$clientInfo['id']}\n";
    }

    protected function sendPrivateMessage(ConnectionInterface $from, string $toClientId, string $message) {
        $fromInfo = $this->clientInfo[$from->resourceId];
        $toConn = null;

        // Find recipient connection
        foreach ($this->clientInfo as $info) {
            if ($info['id'] === $toClientId) {
                $toConn = $info['connection'];
                break;
            }
        }

        if (!$toConn) {
            $this->sendError($from, 'Recipient not found');
            return;
        }

        $toConn->send(json_encode([
            'type' => 'private_message',
            'from' => $fromInfo['id'],
            'message' => $message,
            'timestamp' => time()
        ]));

        echo "Private message from {$fromInfo['id']} to {$toClientId}\n";
    }

    protected function setClientMetadata(ConnectionInterface $conn, array $metadata) {
        $this->clientInfo[$conn->resourceId]['metadata'] = array_merge(
            $this->clientInfo[$conn->resourceId]['metadata'],
            $metadata
        );

        $conn->send(json_encode([
            'type' => 'metadata_updated',
            'metadata' => $this->clientInfo[$conn->resourceId]['metadata']
        ]));
    }

    protected function notifyRoom(string $room, array $message, ConnectionInterface $exclude = null) {
        if (!isset($this->rooms[$room])) {
            return;
        }

        $payload = json_encode($message);

        foreach ($this->rooms[$room] as $resourceId) {
            if (isset($this->clientInfo[$resourceId])) {
                $conn = $this->clientInfo[$resourceId]['connection'];
                if ($exclude === null || $conn !== $exclude) {
                    $conn->send($payload);
                }
            }
        }
    }

    protected function sendError(ConnectionInterface $conn, string $error) {
        $conn->send(json_encode([
            'type' => 'error',
            'message' => $error,
            'timestamp' => time()
        ]));
    }

    public function onClose(ConnectionInterface $conn) {
        $clientInfo = $this->clientInfo[$conn->resourceId] ?? null;

        if ($clientInfo) {
            // Remove from all rooms
            foreach ($clientInfo['rooms'] as $room) {
                $this->leaveRoom($conn, $room);
            }

            // Remove client info
            unset($this->clientInfo[$conn->resourceId]);

            echo "Connection closed: {$clientInfo['id']}\n";
        }

        // Remove from clients storage
        $this->clients->detach($conn);
    }

    public function onError(ConnectionInterface $conn, \Throwable $e) {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

// Create and run the server
$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Messenger()
        )
    ),
    8888,
    '0.0.0.0'
);

echo "WebSocket server running on port 8888\n";
$server->run();