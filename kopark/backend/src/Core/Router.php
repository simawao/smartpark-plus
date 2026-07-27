<?php

declare(strict_types=1);

namespace SmartPark\Core;

final class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void { $this->add('GET', $path, $handler); }
    public function post(string $path, callable $handler): void { $this->add('POST', $path, $handler); }
    public function put(string $path, callable $handler): void { $this->add('PUT', $path, $handler); }
    public function delete(string $path, callable $handler): void { $this->add('DELETE', $path, $handler); }

    private function add(string $method, string $path, callable $handler): void
    {
        $pattern = preg_replace('#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#', '(?P<$1>[^/]+)', $path);
        $this->routes[$method][] = ['pattern' => '#^' . $pattern . '$#', 'handler' => $handler];
    }

    public function dispatch(string $method, string $path): void
    {
        try {
            foreach ($this->routes[$method] ?? [] as $route) {
                if (!preg_match($route['pattern'], $path, $matches)) continue;
                $parameters = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                $data = ($route['handler'])(...array_values($parameters));
                $this->respond(200, true, 'İşlem başarılı.', $data);
                return;
            }
            $this->respond(404, false, 'Kaynak bulunamadı.', null);
        } catch (\InvalidArgumentException $exception) {
            $this->respond(422, false, $exception->getMessage(), null);
        } catch (\Throwable $exception) {
            error_log($exception->getMessage());
            $this->respond(500, false, 'Sunucu işlemi tamamlayamadı.', null);
        }
    }

    private function respond(int $status, bool $success, string $message, mixed $data): void
    {
        http_response_code($status);
        echo json_encode(compact('success', 'message', 'data'), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    }
}
