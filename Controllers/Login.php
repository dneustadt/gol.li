<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Login extends ControllerAbstract
{
    public function indexAction()
    {
        $user = $this->login();

        if ($user instanceof User) {
            $this->redirect($user->getUsername(), 'index');
        }

        $this->redirect('regular', 'index');
    }
}
