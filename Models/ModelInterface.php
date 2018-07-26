<?php

namespace Golli\Models;

interface ModelInterface
{
    /**
     * @return array
     */
    public function getData();

    /**
     * @return string
     */
    public function getTable();

    /**
     * @return string
     */
    public function getUpdateCondition();
}
