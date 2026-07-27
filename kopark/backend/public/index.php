<?php

declare(strict_types=1);

require dirname(__DIR__) . '/src/bootstrap.php';

use SmartPark\Core\Router;

$router = new Router();
require dirname(__DIR__) . '/src/Routes/api.php';
$router->dispatch($_SERVER['REQUEST_METHOD'], parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
