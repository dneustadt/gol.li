<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Backend extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        if (!$this->isLoggedIn() || !$this->getSession()->get('isAdmin')) {
            $this->redirect('backend', 'login');
        }

        return [
            'title' => 'gol.li - backend',
        ];
    }

    /**
     * @return array
     */
    public function loginAction()
    {
        if ($this->isLoggedIn() && $this->getSession()->get('isAdmin')) {
            $this->redirect('backend', 'index');
        }

        $user = $this->login(true);

        if ($user instanceof User) {
            $this->redirect('backend', 'index');
        }

        return [
            'title' => 'gol.li - backend',
        ];
    }

    public function logoutAction()
    {
        session_destroy();

        $this->redirect('backend', 'login');
    }
}
