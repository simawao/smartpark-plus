<?php

declare(strict_types=1);

use SmartPark\Repositories\ModuleRecordRepository;

$allowedModules = ['parks','equipment','maintenance','faults','tasks','reports','staff','events','support'];
$repository = new ModuleRecordRepository();
$body = static function (): array {
    $decoded = json_decode(file_get_contents('php://input') ?: '{}', true);
    if (!is_array($decoded)) throw new InvalidArgumentException('Geçersiz JSON verisi.');
    return $decoded;
};
$module = static function (string $value) use ($allowedModules): string {
    if (!in_array($value, $allowedModules, true)) throw new InvalidArgumentException('Geçersiz modül.');
    return $value;
};

$router->get('/api/v1/health', static fn (): array => ['service' => 'KO-PARK API', 'status' => 'healthy', 'database' => 'connected']);
$router->get('/api/v1/records/{module}', static fn (string $value): array => $repository->all($module($value)));
$router->post('/api/v1/records/{module}', static fn (string $value): array => $repository->create($module($value), $body()));
$router->post('/api/v1/records/{module}/bootstrap', static fn (string $value): array => $repository->bootstrap($module($value), $body()['records'] ?? []));
$router->put('/api/v1/records/{module}/{id}', static function (string $value, string $id) use ($repository, $module, $body): array {
    return $repository->update($module($value), (int)$id, $body()) ?? throw new InvalidArgumentException('Kayıt bulunamadı.');
});
$router->delete('/api/v1/records/{module}/{id}', static fn (string $value, string $id): array => ['deleted' => $repository->delete($module($value), (int)$id)]);
