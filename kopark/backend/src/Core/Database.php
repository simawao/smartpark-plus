<?php

declare(strict_types=1);

namespace SmartPark\Core;

use PDO;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection) return self::$connection;
        $host = \env_value('DB_HOST', '127.0.0.1');
        $port = \env_value('DB_PORT', '3306');
        $name = \env_value('DB_NAME', 'smartpark_plus');
        self::$connection = new PDO(
            "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4",
            \env_value('DB_USER', 'root'),
            \env_value('DB_PASSWORD', ''),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
        );
        return self::$connection;
    }
}
