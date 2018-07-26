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
    }

    /**
     * @param ModelInterface $model
     */
    public function insert(ModelInterface $model)
    {
        $keys = array_keys($model->getData());
        $columns = array_map(
            function ($column) {
                return "`{$column}`";
            },
            $keys
        );
        $placeholders = array_map(
            function ($placeholder) {
                return ":{$placeholder}";
            },
            $keys
        );

        $sql = sprintf(
            'INSERT INTO %s (%s) VALUES (%s)',
            "`{$model::TABLE}`",
            join(',', $columns),
            join(',', $placeholders)
        );
        $stmt = $this->prepare($sql);

        foreach ($model->getData() as $placeholder => $value) {
            $stmt->bindParam(":{$placeholder}", $value);
        }

        $stmt->execute();
    }
}
