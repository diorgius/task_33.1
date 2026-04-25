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
            case 'addedToContacts':
                // метод добавления в контакты
                $this->addedToContacts($from, $data);
                break;
            case 'privateMessage':
                // метод отправки приватного сообщения
                $this->sendPrivateMessage($from, $data);
                break;
            case 'deleteContact';
                // метод удаления контакта
                $this->deleteContact($from, $data);
                break;
            case 'deleteAllMessages';
                // метод удаления всех сообщения с пользователем
                $this->deleteAllMessages($from, $data);
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
                // метод записи в БД и отправки пересылаемого сообщения
                $this->forwardMessage($from, $data);
                break;
            case 'addedToGroup';
                // метод добавления пользователей в группу
                $this->addedToGroup($from, $data);
                break;
            case 'deleteGroup';
                // метод удаления группы
                $this->deleteGroup($from, $data);
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

    protected function addedToContacts(ConnectionInterface $from, $data)
    {
        // делаем запрос в БД для получения сведений о добавившем пользователе
        DB::dbconnect();
        $user = DB::getByProp('users', 'id', $data['send_user_id']);
        // дополняем ответ
        if ($user) {
            $data['email'] = $user['email'];
            $data['nickname'] = $user['nickname'];
            $data['avatar'] = $user['avatar'];
            $data['hideemail'] = $user['hideemail'];
        }
        // отправляем данные
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
            }
        }
    }

    protected function sendPrivateMessage(ConnectionInterface $from, $data)
    {
        // делаем запись сообщения в БД
        DB::dbconnect();
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в БД
        $values = [
            'send_user_Id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => htmlspecialchars($data['text_message']),
            'created' => $created
        ];
        // записываем в БД
        $result = DB::create('messages', $values);
        // дополняем сообщение для отправки пользователю
        if ($result) {
            $data['id'] = $result;
            $data['from'] = (string) $from->resourceId;
            $data['created'] = $created;
        }
        // формируем ответ отправителю сообщения, для вывода сообщения у него
        $replay = [
            'command' => 'replay',
            'id' => $result,
            'send_user_id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_d'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];
        $message = json_encode($data);
        $replay = json_encode($replay);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
            }
            // добавлена отправка сообщения самому себе после отправки сообщения адресату
            // для того чтобы получить message_id из БД, дату и время сообщения
            // для присвоения div id для однозначной идентификации
            // сообщения и вывода даты и времени
            if ($client->resourceId === intval($data['from'])) {
                $client->send($replay);
            }
        }
        echo "Private message from {$from->resourceId} to {$data['to']}\n";
    }

    protected function deleteContact(ConnectionInterface $from, $data)
    {
        DB::dbconnect();
        // удаляем контакты в БД
        DB::deleteContact('contacts', $data['user_id'], $data['send_user_id']);
        // удаляем сообщения в БД
        DB::deleteUserMessages('messages', $data['user_id'], $data['send_user_id']);
        // если пользователь активен отправляем ему сообщение
        if (isset($data['to'])) {
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === intval($data['to'])) {
                    $client->send($message);
                    break;
                }
            }
        }
    }

    protected function deleteAllMessages(ConnectionInterface $from, $data)
    {
        var_dump($data);
        DB::dbconnect();
        // удаляем сообщения в БД
        DB::deleteUserMessages('messages', $data['user_id'], $data['send_user_id']);
        // если пользователь активен отправляем ему сообщение
        if (isset($data['to'])) {
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === intval($data['to'])) {
                    $client->send($message);
                    break;
                }
            }
        }
    }

    protected function deleteMessage(ConnectionInterface $from, $data)
    {
        // делаем удаление сообщения из БД
        DB::dbconnect();
        // удаляем сообщение в БД
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
        // делаем изменение сообщения в БД
        DB::dbconnect();
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в БД
        $values = [
            'id' => $data['id'],
            'send_user_Id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => htmlspecialchars($data['text_message']),
            'status_message' => 'edited',
            'created' => $created
        ];
        // записываем изменения в БД
        DB::update('messages', $values);
        // отправляем сообщение пользователю для изменения сообщения у него
        $message = json_encode($data);
        foreach ($this->clients as $client) {
            if ($client->resourceId === intval($data['to'])) {
                $client->send($message);
                break;
            }
        }
    }

    protected function forwardMessage(ConnectionInterface $from, $data)
    {
        // делаем запись в БД перенаправленного сообщения
        DB::dbconnect();
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // в цикле проходим по адресатам пересылки
        foreach ($data['usersToForward'] as $contact => $value) {
            // формируем массив для записи в БД
            $values = [
                'send_user_id' => intVal($data['send_user_id']),
                'accept_user_id' => intVal($data['usersToForward'][$contact]),
                'text_message' => $data['text_message'],
                'status_message' => $data['status_message'],
                'created' => $created
            ];
            // записываем в БД
            $result = DB::create('messages', $values);
            // ищем среди активных пользователей тех кому адресована пересылка
            // для отображения пересланного сообщения без перезагрузки страницы
            // получаем id подключения
            $to = array_search($data['usersToForward'][$contact], $this->connectedUsers);
            // если есть подключеные пользователи из тех кому пересылается сообщение
            // то отправляем его им
            if ($to) {
                // дополняем сообщение для отправки пользователю
                if ($result) {
                    // ставим ему статус privateMessage для того что бы на стороне
                    // клиента отрабатывались те же условиями как и у обычного сообщения
                    // что бы не дублировать код
                    $data['command'] = 'privateMessage';
                    $data['accept_user_id'] = $data['usersToForward'][$contact];
                    $data['id'] = $result;
                    $data['from'] = (string) $from->resourceId;
                    $data['created'] = $created;
                }
                $message = json_encode($data);
                // отправляем сообщение
                foreach ($this->clients as $client) {
                    if ($client->resourceId === intval($to)) {
                        $client->send($message);
                        break;
                    }
                }
            }
        }
    }

    protected function addedToGroup(ConnectionInterface $from, $data)
    {
        // добавляем пользователя в группу
        DB::dbconnect();
        // проверяем создателя группы (добавляет пользователей в группу только ее создатель)
        $result = DB::getByProp('groupchats', 'id', $data['id']);
        if ($result['creator'] !== intval($data['send_user_id'])) {
            // отправляем сообщение пользователю
            $data['alert'] = 'В группу может добавлять только пользователь ее создавший';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
            // проверяем есть ли уже пользователь в этой группе
        } else {
            $result = DB::getGroupContacts('contacts', 'contact_group_id', $data['id']);
            if (array_search($data['accept_user_id'], array_column($result, 'user_id')) !== false) {
                // отправляем сообщение пользователю
                $data['alert'] = "Пользователь {$data['accept_nickname']} уже в этой группе";
                $message = json_encode($data);
                foreach ($this->clients as $client) {
                    if ($client->resourceId === $from->resourceId) {
                        $client->send($message);
                        break;
                    }
                }
            } else {
                // делаем запись в БД
                $values = [
                    'user_id' => $data['accept_user_id'],
                    'contact_group_id' => $data['id']
                ];
                DB::create('contacts', $values);
                // отправляем сообщение себе о добавлении пользователя
                $data['alert'] = "Пользователь {$data['accept_nickname']} добавлен в группу";
                $message = json_encode($data);
                foreach ($this->clients as $client) {
                    if ($client->resourceId === $from->resourceId) {
                        $client->send($message);
                        break;
                    }
                }
                // отправляем сообщение пользователю для создания элемента группы у него
                $data['forUser'] = true;
                unset($data['alert']);
                // проверяем активенли ли пользователь
                if (isset($data['to'])) {
                    $message = json_encode($data);
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === intval($data['to'])) {
                            $client->send($message);
                            break;
                        }
                    }
                }

                // !!! ??? РАССЫЛКА В ГРУППУ

                // записываем сообщение о добавлении пользователя в группу в БД
                // формируем метку времени
                $date = new DateTime();
                $date->setTimezone(new DateTimeZone('Europe/Moscow'));
                $created = $date->format('Y-m-d H:i:s');
                // формируем массив для записи в БД
                $values = [
                    'send_user_id' => $data['send_user_id'],
                    'accept_user_id' => $data['accept_user_id'],
                    'accept_group_id' => $data['id'],
                    'text_message' => "Вас добавил(а) в группу {$data['group_name']} пользователь {$data['send_nickname']}",
                    'created' => $created
                ];
                // записываем в БД сообщение
                DB::create('messages', $values);

            }

        }
    }

    protected function deleteGroup(ConnectionInterface $from, $data)
    {
        // удаляем группу
        DB::dbconnect();
        // проверяем создателя группы (группу удаляет только ее создатель)
        $result = DB::getByProp('groupchats', 'id', $data['id']);
        if ($result['creator'] !== intval($data['send_user_id'])) {
            $data['alert'] = 'Группу может удалить только пользователь ее создавший';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
        } else {
            // получаем пользователей группы
            $result = DB::getGroupContacts('contacts', 'contact_group_id', $data['id']);
            // ищем активных пользователей
            foreach ($result as $contact) {
                $to = array_search($contact['user_id'], $this->connectedUsers);
                if ($to) {
                    // дополняем сообщение для отправки пользователям
                    $data['deleted'] = true;
                    $data['alert'] = "Группа {$data['group_name']} удалена пользователем {$data['send_nickname']}";
                    $message = json_encode($data);
                    // отправляем сообщение пользователям группы об ее удалении
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === intval($to)) {
                            $client->send($message);
                            break;
                        }
                    }
                }
            }
            // удаляем группу в БД
            DB::delete('groupchats', $data['id']);
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
