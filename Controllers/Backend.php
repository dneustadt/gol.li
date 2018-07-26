<?php

namespace Golli\Controllers;

class Backend extends ControllerAbstract
{
    public function indexAction()
    {
        $this->getResponse()->setBody('backend');
    }
}
