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
