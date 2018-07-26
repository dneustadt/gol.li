<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Register extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        $post = $this->getRequest()->getPost();
        $error = [];

        if (empty($error) && $this->getRequest()->isPost()) {
            $user = new User();
            $user->setUsername($post['_username']);
            $user->setEmail($post['_email']);
            $user->setPassword($post['_password']);
            $user->setSessionID($this->getSession()->getSessionId());

            $this->getDb()->insert($user);

            $user->setId($this->getDb()->lastInsertId());
            $user->setVerified(1);

            $this->getDb()->update($user);
        }

        return [
            'title' => 'gol.li - register',
            'error' => $error,
        ];
    }
}
