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
                `email` VARCHAR(64) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                `password` VARCHAR(128) NOT NULL COLLATE 'utf8mb4_0900_ai_ci', 
                `nickname` VARCHAR(64) NULL COLLATE 'utf8mb4_0900_ai_ci', 
                `avatar` VARCHAR(64) NULL COLLATE 'utf8mb4_0900_ai_ci',
                `hideemail` tinyint(1) NULL,
                `role` VARCHAR(20) NULL COLLATE 'utf8mb4_0900_ai_ci', 
                `cookiehash` VARCHAR(128) NULL COLLATE 'utf8mb4_0900_ai_ci', 
                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`) USING BTREE, INDEX `email` (`email`) USING BTREE, 
                INDEX `nickname` (`nickname`) USING BTREE)";

            self::$pdo->exec($sql);

            $sql = "CREATE TABLE IF NOT EXISTS `groupchats` (
	                `id` INT NOT NULL AUTO_INCREMENT,
	                `group_name` VARCHAR(128) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                    `creator` INT NOT NULL,
	                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	                PRIMARY KEY (`id`) USING BTREE,
                    INDEX `FK_groupchats_users` (`creator`) USING BTREE,
	                CONSTRAINT `FK_groupchats_users_id` FOREIGN KEY (`creator`) 
                    REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE)";

            self::$pdo->exec($sql);

            $sql = 
                "CREATE TABLE IF NOT EXISTS `messenger`.`contacts` (
	            `id` INT NOT NULL AUTO_INCREMENT,
	            `user_id` INT NOT NULL,
	            `contact_user_id` INT NULL,
	            `contact_group_id` INT NULL,
	            `created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	            PRIMARY KEY (`id`) USING BTREE,
	            INDEX `FK_contacts_users_id` (`user_id`) USING BTREE,
	            INDEX `FK_contacts_contact_group_id` (`contact_group_id`) USING BTREE,
	            CONSTRAINT `FK_contacts_users_id` FOREIGN KEY (`user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
	            CONSTRAINT `FK_contacts_contact_group_id` FOREIGN KEY (`contact_group_id`) 
                REFERENCES `groupchats` (`id`) ON UPDATE CASCADE ON DELETE CASCADE)";

            self::$pdo->exec($sql);

             $sql = "CREATE TABLE IF NOT EXISTS `messenger`.`messages` (
                `id` INT NOT NULL AUTO_INCREMENT,
                `send_user_id` INT NOT NULL,
                `accept_user_id` INT NOT NULL,
                `accept_group_id` INT NULL,
                `text_message` TEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
                `status_message` VARCHAR(60) NULL COLLATE 'utf8mb4_0900_ai_ci',
                `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (`id`) USING BTREE,
                INDEX `FK_messages_send_users_id` (`send_user_id`) USING BTREE,
                INDEX `FK_messages_accept_users_id` (`accept_user_id`) USING BTREE,
                INDEX `FK_messages_accept_group_id` (`accept_group_id`) USING BTREE,
                CONSTRAINT `FK_messages_send_users_id` FOREIGN KEY (`send_user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
                CONSTRAINT `FK_messages_accept_users_id` FOREIGN KEY (`accept_user_id`) 
                REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE,
                CONSTRAINT `FK_messages_accept_group_id` FOREIGN KEY (`accept_group_id`) 
                REFERENCES `groupchats` (`id`) ON UPDATE CASCADE ON DELETE CASCADE)";

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
            "SELECT c.id, contact_user_id, email, nickname, avatar, hideemail
            FROM $table AS c LEFT JOIN users AS u ON 
            u.id = c.contact_user_id
            WHERE $prop = :value
            AND contact_user_id IS NOT NULL");
        $stmt->execute([
            'value' => $value
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getGroups(string $table, string $prop, string $value)
    {
        $stmt = self::$pdo->prepare(
            "SELECT g.id, c.user_id, c.contact_group_id, g.group_name  
            FROM $table AS c LEFT JOIN groupchats AS g ON 
            g.id = c.contact_group_id
            WHERE $prop = :value
            AND contact_group_id IS NOT NULL");
        $stmt->execute([
            'value' => $value
        ]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function deleteContact(string $table, string $userId, string $contactUserId): void
    {
        // удаляем контакт у себя и себя у него
        $stmt = self::$pdo->prepare(
        "DELETE FROM $table WHERE 
        (user_id = :value_1 
        AND 
        contact_user_id = :value_2)
        OR
        (user_id = :value_4
        AND 
        contact_user_id = :value_3)");
        $stmt->execute([
            'value_1' => $userId,
            'value_2' => $contactUserId,
            'value_3' => $userId,
            'value_4' => $contactUserId
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