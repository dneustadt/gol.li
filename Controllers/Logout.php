<?php

namespace Golli\Controllers;

class Logout extends ControllerAbstract
{
    public function indexAction()
    {
        session_destroy();

        $this->redirect('regular', 'index');
    }
}
