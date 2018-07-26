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
        $error = $this->validate($post);

        if (empty($error) && $this->getRequest()->isPost()) {
            $user = new User();
            $user->setUsername($post['_username']);
            $user->setEmail($post['_email']);
            $user->setPassword($post['_password']);
            $user->setSessionID($this->getSession()->getSessionId());

            $this->getDb()->insert($user);

            //$user->setId($this->getDb()->lastInsertId());

            $user = $this->login();

            if ($user instanceof User) {
                $user->setVerified(1);
                $this->getDb()->update($user);

                $this->redirect($user->getUsername(), 'index');
            }
        }

        return [
            'title' => 'gol.li - register',
            'error' => $error,
        ];
    }

    /**
     * @param array $post
     *
     * @return array
     */
    private function validate($post)
    {
        $error = [];

        if (
            empty($post['_username']) ||
            empty($post['_password']) ||
            empty($post['_password_confirm'])
        ) {
            $error['all'] = 'Please provide all necessary information';
        } else {
            if (preg_match("/[a-z0-9_]/", $post['_username'])) {
                $error['username'] = 'The username must be all lowercase characters or numbers and may further contain only underscores';
            }
        }

        return $error;
    }
}
