<?php

namespace Golli\Components;

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
}
