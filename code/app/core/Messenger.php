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
            case 'groupMessage';
                // метод отправки групповых сообщений
                $this->sendGroupMessage($from, $data);
                break;
            case 'addedToGroup';
                // метод добавления пользователей в группу
                $this->addedToGroup($from, $data);
                break;
            case 'leaveGroup';
                // метод выхода выхода из группу
                $this->leaveGroup($from, $data);
                break;
            case 'deleteGroupUser';
                // метод удаления пользователей из группы
                $this->deleteGroupUser($from, $data);
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
        DB::dbconnect();
        // создаем контакт у себя
        $values = [
            'user_id' => $data['send_user_id'],
            'contact_user_id' => $data['accept_user_id'],
        ];
        DB::create('contacts', $values);
        // создаем контакт у добавленного пользователя
        $values = [
            'user_id' => $data['accept_user_id'],
            'contact_user_id' => $data['send_user_id'],
        ];
        DB::create('contacts', $values);
        // записываем сообщение о создании контакта с пользователем в БД 
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в БД
        $values = [
            'send_user_id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'text_message' => "Вас добавил(а) в свои контакты пользователь {$data['send_nickname']}",
            'created' => $created
        ];
        // записываем в БД сообщение
        DB::create('messages', $values);

        // если пользователь активен, то отправляем ему сообщение для добавления
        // добавившего пользователя в его контакты
        if (isset($data['to'])) {
            // делаем запрос в БД для получения сведений о добавившем пользователе
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

            $data['message_id'] = $result;
            $data['from'] = (string) $from->resourceId;
            $data['created'] = $created;
        }
        // формируем ответ отправителю сообщения для вывода сообщения у него
        $replay = [
            'command' => 'replay',
            'message_id' => $result,
            'send_user_id' => $data['send_user_id'],
            'accept_user_id' => $data['accept_user_id'],
            'accept_nickname' => $data['accept_nickname'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];
        $message = json_encode($data);
        $replay = json_encode($replay);
        foreach ($this->clients as $client) {
            // если пользователь в чате, то отправляем ему сообщение, если нет записываем в БД, потом прочитает
            if (isset($data['to'])) {
                if ($client->resourceId === intval($data['to'])) {
                    $client->send($message);
                }
            }
            // отправляем сообщение отправителю для вывода сообщения у него (message_id, datetime)
            if ($client->resourceId === intval($data['from'])) {
                $client->send($replay);
            }
        }
    }

    protected function deleteContact(ConnectionInterface $from, $data)
    {
        DB::dbconnect();
        // удаляем контакты в БД
        DB::deleteContact('contacts', 'contact_user_id', $data['user_id'], $data['send_user_id']);
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
            $to = array_search($data['usersToForward'][$contact], $this->connectedUsers);
            // если есть подключеные пользователи из тех кому пересылается сообщение
            // то отправляем его им
            if ($to) {
                // дополняем сообщение для отправки пользователю
                if ($result) {
                    // ставим ему статус privateMessage для того что бы на стороне
                    // клиента отрабатывались те же условиями как и у обычного сообщения
                    $data['command'] = 'privateMessage';
                    $data['accept_user_id'] = $data['usersToForward'][$contact];
                    $data['message_id'] = $result;
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

    protected function sendGroupMessage(ConnectionInterface $from, $data)
    {
        // отправляем групповое сообщение
        DB::dbconnect();
        // записываем сообщение в БД
        // формируем метку времени
        $date = new DateTime();
        $date->setTimezone(new DateTimeZone('Europe/Moscow'));
        $created = $date->format('Y-m-d H:i:s');
        // формируем массив для записи в БД
        $values = [
            'send_user_id' => $data['send_user_id'],
            'accept_group_id' => $data['group_id'],
            'text_message' => $data['text_message'],
            'created' => $created
        ];
        // записываем в БД сообщение
        $message_id = DB::create('messages', $values);
        // получаем пользователей группы
        $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
        // ищем активных пользователей
        foreach ($result as $contact) {
            $to = array_search($contact['user_id'], $this->connectedUsers);
            if ($to) {
                // формируем сообщение пользователям группы
                $data['message_id'] = $message_id;
                $data['created'] = $created;
                $message = json_encode($data);
                // отправляем сообщение пользователям группы
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
        $result = DB::getByProp('groupchats', 'id', $data['group_id']);
        if ($result['creator'] !== intval($data['send_user_id'])) {
            // отправляем сообщение пользователю
            $data['alert'] = 'В группу может добавлять только администратор группы';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
            // проверяем есть ли уже пользователь в этой группе
        } else {
            $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
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
                    'contact_group_id' => $data['group_id']
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
                // записываем сообщение о добавлении пользователя в группу в БД
                // формируем метку времени
                $date = new DateTime();
                $date->setTimezone(new DateTimeZone('Europe/Moscow'));
                $created = $date->format('Y-m-d H:i:s');
                // формируем сообщение
                $text_message = "Администратор группы {$data['group_name']} {$data['send_nickname']} добавил пользователя {$data['accept_nickname']}";
                // формируем массив для записи в БД
                $values = [
                    'send_user_id' => $data['send_user_id'],
                    'accept_group_id' => $data['group_id'],
                    'text_message' => $text_message,
                    'created' => $created
                ];
                // записываем в БД сообщение
                $message_id = DB::create('messages', $values);
                // отправляем сообщение пользователю для создания элемента группы у него
                $data['forUser'] = true;
                unset($data['alert']);
                // проверяем активен ли пользователь
                if (isset($data['to'])) {
                    $message = json_encode($data);
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === intval($data['to'])) {
                            $client->send($message);
                            break;
                        }
                    }
                }
                // получаем пользователей группы
                $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
                // ищем активных пользователей
                foreach ($result as $contact) {
                    $to = array_search($contact['user_id'], $this->connectedUsers);
                    if ($to) {
                        // если это отправитель сообщения о выходе из группы
                        // дополняем сообщение для отправки пользователям
                        // ставим ему статус groupMessage для того что бы на стороне
                        // клиента отрабатывались те же условиями как и у обычного сообщения
                        $data['command'] = 'groupMessage';
                        $data['message_id'] = $message_id;
                        $data['text_message'] = $text_message;
                        $data['created'] = $created;
                        $message = json_encode($data);
                        // отправляем сообщение пользователям группы
                        foreach ($this->clients as $client) {
                            if ($client->resourceId === intval($to)) {
                                $client->send($message);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    protected function leaveGroup(ConnectionInterface $from, $data)
    {
        // покидаем группу
        DB::dbconnect();
        // проверяем создателя группы (создатель группы не может ее покинуть)
        $result = DB::getByProp('groupchats', 'id', $data['group_id']);
        if ($result['creator'] === intval($data['send_user_id'])) {
            $data['alert'] = 'Создатель группы не может ее покинуть';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
        } else {
            // создаем сообщение, что пользователь покинул группу
            // формируем метку времени
            $date = new DateTime();
            $date->setTimezone(new DateTimeZone('Europe/Moscow'));
            $created = $date->format('Y-m-d H:i:s');
            // формируем сообщение
            $text_message = "Пользователь {$data['send_nickname']} покинул группу";
            // формируем массив для записи в БД
            $values = [
                'send_user_id' => $data['send_user_id'],
                'accept_group_id' => $data['group_id'],
                'text_message' => $text_message,
                'created' => $created
            ];
            // записываем в БД сообщение
            $message_id = DB::create('messages', $values);
            // получаем пользователей группы
            $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
            // ищем активных пользователей
            foreach ($result as $contact) {
                if ($contact['user_id'] === intval($data['send_user_id'])) {
                    $data['command'] = 'leaveGroup';
                    $data['leaveGroup'] = true;
                    $data['alert'] = "Вы покинули группу {$data['group_name']}";
                    $message = json_encode($data);
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === $from->resourceId) {
                            $client->send($message);
                            break;
                        }
                    }
                    continue;
                }
                $to = array_search($contact['user_id'], $this->connectedUsers);
                if ($to) {
                    // если это отправитель сообщения о выходе из группы
                    // дополняем сообщение для отправки пользователям
                    // ставим ему статус groupMessage для того что бы на стороне
                    // клиента отрабатывались те же условиями как и у обычного сообщения
                    unset($data['alert']);
                    unset($data['leaveGroup']);
                    $data['command'] = 'groupMessage';
                    $data['message_id'] = $message_id;
                    $data['text_message'] = $text_message;
                    $data['created'] = $created;
                    $message = json_encode($data);
                    // отправляем сообщение пользователям группы
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === intval($to)) {
                            $client->send($message);
                            break;
                        }
                    }
                }
            }
            // удаляем контакт из группы в БД
            DB::deleteContact('contacts', 'contact_group_id', $data['send_user_id'], $data['group_id']);
        }
    }
    
    protected function deleteGroupUser(ConnectionInterface $from, $data)
    {
        // покидаем группу
        DB::dbconnect();
        // проверяем создателя группы (только создатель группы может удалять из нее пользователей)
        $result = DB::getByProp('groupchats', 'id', $data['group_id']);
        if ($result['creator'] !== intval($data['send_user_id'])) {
            $data['alert'] = 'Только администратор группы может удалять пользователей';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
        } else {
            // создаем сообщение, что пользователь был удален
            // формируем метку времени
            $date = new DateTime();
            $date->setTimezone(new DateTimeZone('Europe/Moscow'));
            $created = $date->format('Y-m-d H:i:s');
            // формируем сообщение
            $text_message = "Пользователь {$data['user_nickname']} был удален администратором группы";
            // формируем массив для записи в БД
            $values = [
                'send_user_id' => $data['send_user_id'],
                'accept_group_id' => $data['group_id'],
                'text_message' => $text_message,
                'created' => $created
            ];
            // записываем в БД сообщение
            $message_id = DB::create('messages', $values);
            // получаем пользователей группы
            $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
            // ищем активных пользователей
            $data['forAdmin'] = true;
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
            foreach ($result as $contact) {
                $to = array_search($contact['user_id'], $this->connectedUsers);
                if ($to) {
                    if ($contact['user_id'] === intval($data['user_id'])) {
                        $data['command'] = 'deleteGroupUser';
                        $data['deleteGroupUser'] = true;
                        $data['alert'] = "Вы были удалены из группы {$data['group_name']} администратором";
                        $message = json_encode($data);
                        foreach ($this->clients as $client) {
                            if ($client->resourceId === intval($to)) {
                                $client->send($message);
                                break;
                            }
                        }
                        continue;
                    }
                    // если это отправитель сообщения о выходе из группы
                    // дополняем сообщение для отправки пользователям
                    // ставим ему статус groupMessage для того что бы на стороне
                    // клиента отрабатывались те же условиями как и у обычного сообщения
                    unset($data['alert']);
                    unset($data['forAdmin']);
                    unset($data['deleteGroupUser']);
                    $data['command'] = 'groupMessage';
                    $data['message_id'] = $message_id;
                    $data['text_message'] = $text_message;
                    $data['created'] = $created;
                    $message = json_encode($data);
                    // отправляем сообщение пользователям группы
                    foreach ($this->clients as $client) {
                        if ($client->resourceId === intval($to)) {
                            $client->send($message);
                            break;
                        }
                    }
                }
            }
            // удаляем контакт из группы в БД
            DB::delete('contacts', $data['contact_id']);
        }
    }

    protected function deleteGroup(ConnectionInterface $from, $data)
    {
        // удаляем группу
        DB::dbconnect();
        // проверяем создателя группы (группу удаляет только ее создатель)
        $result = DB::getByProp('groupchats', 'id', $data['group_id']);
        if ($result['creator'] !== intval($data['send_user_id'])) {
            $data['alert'] = 'Группу может удалить только администратор';
            $message = json_encode($data);
            foreach ($this->clients as $client) {
                if ($client->resourceId === $from->resourceId) {
                    $client->send($message);
                    break;
                }
            }
        } else {
            // получаем пользователей группы
            $result = DB::getByPropAll('contacts', 'contact_group_id', $data['group_id']);
            // ищем активных пользователей
            foreach ($result as $contact) {
                $to = array_search($contact['user_id'], $this->connectedUsers);
                if ($to) {
                    // дополняем сообщение для отправки пользователям
                    $data['deleted'] = true;
                    $data['alert'] = "Группа {$data['group_name']} удалена администратором {$data['send_nickname']}";
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
            DB::delete('groupchats', $data['group_id']);
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
