<?php

namespace Golli\Controllers;

class Regular extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        return [
            'title' => 'gol.li',
            'name' => 'Foobar',
        ];
    }
}
