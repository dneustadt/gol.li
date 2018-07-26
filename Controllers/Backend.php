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
        $this->redirect('backend', 'login');
    }

    /**
     * @return array
     */
    public function loginAction()
    {
        $user = $this->login();

        if ($user instanceof User) {
            var_dump($user->getId());exit();
        }

        return [
            'title' => 'gol.li - backend',
        ];
    }
}
