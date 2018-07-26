<?php

namespace Golli\Controllers;

class Regular extends ControllerAbstract
{
    public function indexAction()
    {
        $this->getResponse()->setBody('test');
    }
}
