<?php

namespace Golli\Controllers;

class Regular extends ControllerAbstract
{
    public function indexAction()
    {
        return [
            'name' => 'Foobar',
        ];
    }
}
