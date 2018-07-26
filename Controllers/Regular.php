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
            'name' => 'Foobar',
        ];
    }
}
