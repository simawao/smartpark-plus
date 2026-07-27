<?php

declare(strict_types=1);

spl_autoload_register(static function (string $class): void {
    $prefix = 'SmartPark\\';
    if (!str_starts_with($class, $prefix)) return;
    $file = __DIR__ . '/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
    if (is_file($file)) require $file;
});

header('Content-Type: application/json; charset=utf-8');
$allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

function env_value(string $key, ?string $default = null): ?string
{
    $value = getenv($key);
    if ($value !== false) return $value;
    static $file = null;
    if ($file === null) {
        $file = [];
        $path = dirname(__DIR__) . '/.env';
        if (is_file($path)) {
            foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
                if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
                [$name, $content] = explode('=', $line, 2);
                $file[trim($name)] = trim($content);
            }
        }
    }
    return $file[$key] ?? $default;
}
