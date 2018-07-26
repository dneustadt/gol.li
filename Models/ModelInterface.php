<?php

namespace Golli\Models;

interface ModelInterface
{
    const TABLE = '';

    const PRIMARY_INDEX = '';

    /**
     * @return array
     */
    public function getData();
}
