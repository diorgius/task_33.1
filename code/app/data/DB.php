<?php

namespace App\data;
use PDO;
use PDOException;

class DB
{
    protected static $pdo;
    public static function dbconnect(): void
    {
        $host = 'messenger-mysql';
        $user = 'root';
        $pass = 'root';
        $db = 'messenger';
        $port = '3306';
        $charset = 'utf8mb4';
        $dsnCreateDB = "mysql:host=$host;port=$port;charset=$charset";
        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ];

        try {
            self::$pdo = new PDO($dsnCreateDB, $user, $pass, $options);

            $sql = "CREATE DATABASE IF NOT EXISTS `messenger` COLLATE 'utf8mb4_0900_ai_ci'";

            self::$pdo->exec($sql);

        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int) $e->getCode());
        } 

        try {
            self::$pdo = new PDO($dsn, $user, $pass, $options);

            $sql =
                "CREATE TABLE IF NOT EXISTS `messenger`.`users` 
                (`id` INT NOT NULL AUTO_INCREMENT , 
                `email` VARCHAR(64) NOT NULL ,
                `password` VARCHAR(128) NOT NULL , 
                `nickname` VARCHAR(64) NULL , 
                `avatar` VARCHAR(64) NULL ,
                `hideemail` tinyint(1) NULL,
                `role` VARCHAR(20) NULL , 
                `cookiehash` VARCHAR(128) NULL , 
                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`) USING BTREE, INDEX `email` (`email`) USING BTREE)";

            self::$pdo->exec($sql);

            $sql = 
                "CREATE TABLE IF NOT EXISTS `messenger`.`contacts` (
	            `id` INT NOT NULL AUTO_INCREMENT,
	            `user_id` INT NOT NULL,
	            `contact_user_id` INT NOT NULL,
	            `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	            PRIMARY KEY (`contact_id`) USING BTREE,
	            INDEX `FK_contacts_users` (`user_id`) USING BTREE,
	            CONSTRAINT `FK_user_contacts_users` FOREIGN KEY (`user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE)";

            self::$pdo->exec($sql);

             $sql = "CREATE TABLE IF NOT EXISTS `messenger`.`messages` (
                `id` INT NOT NULL AUTO_INCREMENT,
                `send_user_id` INT NOT NULL,
                `accept_user_id` INT NOT NULL,
                `text_message` TEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                `status_message` VARCHAR(10) NULL COLLATE 'utf8mb4_0900_ai_ci',
                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`message_id`) USING BTREE,
                INDEX `FK_messages_users` (`send_user_id`) USING BTREE,
                INDEX `FK_messages_users_2` (`accept_user_id`) USING BTREE,
                CONSTRAINT `FK_messages_users` FOREIGN KEY (`send_user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
                CONSTRAINT `FK_messages_users_2` FOREIGN KEY (`accept_user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE)";

            self::$pdo->exec($sql);

        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int) $e->getCode());
        }
    }

    public static function create(string $table, array $values)
    {
        $colums = implode(', ', array_keys($values));
        $placeholders = ':' . implode(', :', array_keys($values));
        $stmt = self::$pdo->prepare("INSERT INTO $table ($colums) VALUES ($placeholders)");
        $stmt->execute($values);
        return self::$pdo->lastInsertId();
    }

    public static function update(string $table, array $values)
    {
        $id = $values['id'];
        unset($values['id']);
        $set = '';
        foreach ($values as $key => $value) {
            $set .= "$key = :$key, ";
        }
        $set = rtrim($set, ', ');
        $stmt = self::$pdo->prepare("UPDATE $table SET $set WHERE id = :id");
        $values['id'] = $id;
        $stmt->execute($values);
        return $id;
    }

    public static function delete(string $table, string $id): void
    {
        $stmt = self::$pdo->prepare("DELETE FROM $table WHERE id = :id");
        $stmt->execute(['id' => $id]);
    }

    public static function getAll(string $table)
    {
        $stmt = self::$pdo->query("SELECT * FROM $table");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getByProp(string $table, string $prop, string $value)
    {
        $stmt = self::$pdo->prepare("SELECT * FROM $table WHERE $prop = :value");
        $stmt->execute(['value' => $value]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getContacts(string $table, string $prop, string $value)
    {
        $stmt = self::$pdo->prepare(
            "SELECT contact_user_id, email, nickname, avatar 
            FROM $table AS c LEFT JOIN users AS u ON 
            u.id = (SELECT contact_user_id FROM contacts 
            WHERE 
            contact_user_id = c.contact_user_id AND $prop = :value_2)
            WHERE $prop = :value_1");
        $stmt->execute([
            'value_1' => $value,
            'value_2' => $value
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function deleteContact(string $table, string $userId, string $contactUserId): void
    {
        $stmt = self::$pdo->prepare("DELETE FROM $table WHERE user_id = :userId AND contact_user_id = :contactUserId");
        $stmt->execute([
            'userId' => $userId,
            'contactUserId' => $contactUserId
        ]);
    }

    public static function getUserMessages(string $table, string $send_user_id, string $accept_user_id): array
    {
        $stmt = self::$pdo->prepare(
        "SELECT * FROM $table WHERE 
        (send_user_id = :value_1 
        AND 
        accept_user_id = :value_2)
        OR
        (send_user_id = :value_4 
        AND 
        accept_user_id = :value_3)
        ORDER BY created");
        $stmt->execute([
            'value_1' => $send_user_id,
            'value_2' => $accept_user_id,
            'value_3' => $send_user_id,
            'value_4' => $accept_user_id
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function deleteUserMessages(string $table, string $send_user_id, string $accept_user_id): void
    {
        $stmt = self::$pdo->prepare(
        "DELETE FROM $table WHERE 
        (send_user_id = :value_1 
        AND 
        accept_user_id = :value_2)
        OR
        (send_user_id = :value_4 
        AND 
        accept_user_id = :value_3)");
        $stmt->execute([
            'value_1' => $send_user_id,
            'value_2' => $accept_user_id,
            'value_3' => $send_user_id,
            'value_4' => $accept_user_id
        ]);
    }

}