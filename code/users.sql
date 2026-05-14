-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               9.6.0 - MySQL Community Server - GPL
-- Операционная система:         Linux
-- HeidiSQL Версия:              12.16.0.7229
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Дамп данных таблицы messenger.users: ~1 rows (приблизительно)
INSERT INTO `users` (`email`, `password`, `nickname`, `avatar`, `hideemail`, `role`, `cookiehash`, `created`) VALUES
	('admin@messenger.local', '$2y$12$esflPrWHQp3i9Equ7gwMauc49MCxJu1M0XdgEgk9dQ4nRYD1K7zUq', 'admin', '9fab92a1bec4fb9d2553ac3f236e026b', 0, 'admin', NULL, '2026-03-31 06:57:29');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
