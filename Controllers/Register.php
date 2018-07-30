<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Register extends ControllerAbstract
{
    const USERNAME_BLACKLIST = [
        'regular',
        'backend',
        'login',
        'logout',
        'register',
        'terms',
        'components',
        'controllers',
        'models',
        'views',
        'web',
    ];

    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        $post = $this->getRequest()->getPost();
        $error = $this->validate($post);

        if (!empty($post['_username'])) {
            $post['_username'] = strtolower($post['_username']);
        }

        if (empty($error) && $this->getRequest()->isPost()) {
            $user = new User();
            $user->setUsername($post['_username']);
            $user->setEmail($post['_email']);
            $user->setNewPassword($post['_password']);
            $user->setVerified(0);
            $user->setSessionID($this->getSession()->getSessionId());
            $user->setCreated(date('Y-m-d H:i:s'));

            $this->getDb()->insert($user);

            $message = <<<EOD
Hello {$user->getUsername()},

to complete your registration at gol.li please click the link below:
{$this->getRequest()->getHost(true)}/register/complete?id={$user->getId()}&session={$user->getSessionID()}

If it wasn't you who registered this email address, just ignore this message.
EOD;
            $header = [
                'From' => 'no-reply@gol.li',
                'Reply-To' => 'no-reply@gol.li',
                'X-Mailer' => 'PHP/' . phpversion(),
            ];

            mail($user->getEmail(), 'Your registration at gol.li', $message, $header);

            $this->redirect('register', 'confirm');

            //$user->setId($this->getDb()->lastInsertId());

            //$user = $this->login();

            //if ($user instanceof User) {
            //    $user->setVerified(1);
            //    $this->getDb()->update($user);

            //    $this->redirect($user->getUsername(), 'index');
            //}
        }

        return [
            'title' => 'gol.li - register',
            'error' => $error,
        ];
    }

    /**
     * @return array
     */
    public function confirmAction()
    {
        return [
            'title' => 'gol.li - confirm registration',
        ];
    }

    public function completeAction()
    {
        $id = (int) $this->getRequest()->get('id');
        $session = $this->getRequest()->get('session');

        if (!empty($id) && !empty($session)) {
            $sql = 'UPDATE `users` SET `verified` = 1 WHERE `id` = :id AND `session` = :session';

            $stmt = $this->getDb()->prepare($sql);

            $stmt->bindValue(':id', $id);
            $stmt->bindValue(':session', $session);
            $stmt->execute();
        }

        $this->redirect('regular', 'index');
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
            empty($post['_password_confirm']) ||
            empty($post['_email'])
        ) {
            $error['all'] = true;
        } else {
            $sql = 'SELECT `id` FROM `users` WHERE `username` = :username OR `email` = :email';

            $stmt = $this->getDb()->prepare($sql);
            $stmt->bindValue(':username', $post['_username']);
            $stmt->bindValue(':email', $post['_email']);
            $stmt->execute();

            if (in_array($post['_username'], self::USERNAME_BLACKLIST) || !empty($stmt->fetchColumn())) {
                $error['username_taken'] = true;
            }
            if (preg_match('/[^a-z0-9_]/', $post['_username']) || strlen($post['_username']) < 3) {
                $error['username'] = true;
            }
            if (strlen($post['_password']) < 6) {
                $error['password'] = true;
            }
            if ($post['_password'] !== $post['_password_confirm']) {
                $error['password_confirm'] = true;
            }
            if (!filter_var($post['_email'], FILTER_VALIDATE_EMAIL)) {
                $error['email'] = true;
            }
        }

        return $error;
    }
}
