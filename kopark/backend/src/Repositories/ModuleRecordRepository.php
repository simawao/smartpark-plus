<?php

declare(strict_types=1);

namespace SmartPark\Repositories;

use PDO;
use SmartPark\Core\Database;

final class ModuleRecordRepository
{
    private PDO $db;

    public function __construct() { $this->db = Database::connection(); }

    public function all(string $module): array
    {
        $statement = $this->db->prepare('SELECT id, payload FROM module_records WHERE module_key = ? ORDER BY id');
        $statement->execute([$module]);
        return array_map(static function (array $row): array {
            return ['id' => (int)$row['id'], ...json_decode($row['payload'], true, 512, JSON_THROW_ON_ERROR)];
        }, $statement->fetchAll());
    }

    public function create(string $module, array $payload): array
    {
        unset($payload['id']);
        $statement = $this->db->prepare('INSERT INTO module_records (module_key, payload) VALUES (?, ?)');
        $statement->execute([$module, json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)]);
        return ['id' => (int)$this->db->lastInsertId(), ...$payload];
    }

    public function bootstrap(string $module, array $records): array
    {
        $count = $this->db->prepare('SELECT COUNT(*) FROM module_records WHERE module_key = ?');
        $count->execute([$module]);
        if ((int)$count->fetchColumn() > 0) return $this->all($module);
        $this->db->beginTransaction();
        try {
            foreach ($records as $record) $this->create($module, is_array($record) ? $record : []);
            $this->db->commit();
        } catch (\Throwable $exception) {
            $this->db->rollBack();
            throw $exception;
        }
        return $this->all($module);
    }

    public function update(string $module, int $id, array $payload): ?array
    {
        unset($payload['id']);
        $statement = $this->db->prepare('UPDATE module_records SET payload = ? WHERE id = ? AND module_key = ?');
        $statement->execute([json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), $id, $module]);
        if ($statement->rowCount() > 0) return ['id' => $id, ...$payload];

        // MySQL, veri değişmediyse rowCount() için 0 döndürür. Bu durum
        // kaydın bulunmadığı anlamına gelmez; varlığını ayrıca kontrol ederiz.
        $exists = $this->db->prepare('SELECT 1 FROM module_records WHERE id = ? AND module_key = ?');
        $exists->execute([$id, $module]);
        return $exists->fetchColumn() ? ['id' => $id, ...$payload] : null;
    }

    public function delete(string $module, int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM module_records WHERE id = ? AND module_key = ?');
        $statement->execute([$id, $module]);
        return $statement->rowCount() > 0;
    }
}
