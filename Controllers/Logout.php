<?php

namespace Golli\Controllers;

class Logout extends ControllerAbstract
{
    public function indexAction()
    {
        $this->getSession()->destroy();
        // $this->getSession()->regenerateId();

        $this->redirect('regular', 'index');
    }
}
