<?php

namespace Golli\Components;

use Golli\Models\ModelInterface;

class Db extends \PDO
{
    public function __construct()
    {
        parent::__construct(
            sprintf(
                'mysql:host=%s;port=%s;dbname=%s',
                getenv('DB_HOST'),
                getenv('DB_PORT'),
                getenv('DB_DATABASE')
            ),
            getenv('DB_USERNAME'),
            getenv('DB_PASSWORD')
        );

        $this->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $this->setAttribute(\PDO::ATTR_EMULATE_PREPARES, false);
    }

    /**
     * @param ModelInterface $model
     */
    public function insert(ModelInterface $model)
    {
        $columns = $this->getColumns($model);
        $placeholders = $this->getPlaceholders($model);

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            "`{$model->getTable()}`",
            join(',', $columns),
            join(',', $placeholders)
        );
        $stmt = $this->prepare($sql);

        foreach ($model->getData() as $placeholder => $value) {
            $stmt->bindValue(":{$placeholder}", $value);
        }

        $stmt->execute();
    }

    /**
     * @param ModelInterface $model
     */
    public function update(ModelInterface $model)
    {
        $columns = $this->getColumns($model);
        $placeholders = $this->getPlaceholders($model);

        $columnPlaceholders = array_map(
            function ($column, $placeholder) {
                return "{$column} = $placeholder";
            },
            $columns,
            $placeholders
        );

        $sql = sprintf(
            'UPDATE %s SET %s WHERE %s',
            "`{$model->getTable()}`",
            join(',', $columnPlaceholders),
            $model->getPrimaryIndexCondition()
        );
        $stmt = $this->prepare($sql);

        foreach ($model->getData() as $placeholder => $value) {
            $stmt->bindValue(":{$placeholder}", $value);
        }

        $stmt->execute();
    }

    /**
     * @param ModelInterface $model
     *
     * @return ModelInterface
     */
    public function find(ModelInterface $model)
    {
        $sql = sprintf(
            'SELECT * FROM %s WHERE %s LIMIT 1',
            "`{$model->getTable()}`",
            $model->getPrimaryIndexCondition()
        );
        $stmt = $this->prepare($sql);
        $stmt->execute();

        $result = $stmt->fetch(\PDO::FETCH_ASSOC);

        foreach ($result as $key => $value) {
            $method = 'set' . ucfirst($key);
            if (method_exists($model, $method)) {
                $model->$method($value);
            }
        }

        return $model;
    }

    /**
     * @param ModelInterface $model
     * @param int            $offset
     * @param int            $limit
     *
     * @return array
     */
    public function findAll(ModelInterface $model, $offset = 0, $limit = 10)
    {
        $sql = sprintf(
            "SELECT * FROM %s LIMIT {$offset}, {$limit}",
            "`{$model->getTable()}`"
        );
        $stmt = $this->prepare($sql);
        $stmt->execute();

        $rows = [];

        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $modelClone = clone $model;

            foreach ($row as $key => $value) {
                $method = 'set' . ucfirst($key);
                if (method_exists($modelClone, $method)) {
                    $modelClone->$method($value);
                }
            }

            $rows[] = $modelClone;
        }

        return $rows;
    }

    /**
     * @param ModelInterface $model
     */
    public function delete(ModelInterface $model)
    {
        $sql = sprintf(
            'DELETE FROM %s WHERE %s',
            "`{$model->getTable()}`",
            $model->getPrimaryIndexCondition()
        );
        $stmt = $this->prepare($sql);
        $stmt->execute();
    }

    /**
     * @param ModelInterface $model
     *
     * @return int
     */
    public function count(ModelInterface $model)
    {
        $sql = sprintf(
            'SELECT COUNT(*) FROM %s',
            "`{$model->getTable()}`"
        );
        $stmt = $this->prepare($sql);
        $stmt->execute();

        return (int) $stmt->fetchColumn();
    }

    /**
     * @param ModelInterface $model
     *
     * @return array
     */
    private function getColumns(ModelInterface $model)
    {
        $keys = array_keys($model->getData());

        return array_map(
            function ($column) {
                return "`{$column}`";
            },
            $keys
        );
    }

    /**
     * @param ModelInterface $model
     *
     * @return array
     */
    private function getPlaceholders(ModelInterface $model)
    {
        $keys = array_keys($model->getData());

        return array_map(
            function ($placeholder) {
                return ":{$placeholder}";
            },
            $keys
        );
    }
}
