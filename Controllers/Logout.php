<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Logout extends ControllerAbstract
{
    public function indexAction()
    {
        session_destroy();

        $this->redirect('regular', 'index');
    }
}
