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

        $this->redirect('regular', 'index', 301, ['login_error' => 'true']);
    }

    /**
     * @return array
     */
    public function resetAction()
    {
        if (
            $this->getRequest()->isPost() &&
            empty($this->getSession()->get('passwordResetToken'))
        ) {
            $email = $this->getRequest()->getPost('_email');

            $sql = 'SELECT `sessionID` FROM `users` WHERE `email` = :email';

            $stmt = $this->getDb()->prepare($sql);

            $stmt->bindValue(':email', $email);
            $stmt->execute();

            $sessionID = $stmt->fetchColumn();

            if ($sessionID) {
                $rand = rand(1000, 9999);

                $token = md5($rand . $sessionID);
                $this->getSession()->set(
                    'passwordResetToken',
                    [$token => $email]
                );

                $message = <<<EOD
Hello,

you or someone else requested a password reset at gol.li for the email address {$email}
To set a new password click the following link:
{$this->getRequest()->getHost(true)}{$this->getRequest()->getBasePath()}/login/password?token={$token}

If it wasn't you who requested the password reset, just ignore this message.
EOD;

                mail(
                    $email,
                    'Password reset at gol.li',
                    $message,
                    "From: gol.li <no-reply@gol.li>\r\nReply-To: gol.li <no-reply@gol.li>\r\n" .
                    "Organization: gol.li\r\nMIME-Version: 1.0\r\nContent-type: text/plain; charset=utf-8\r\n" .
                    "X-Priority: 3\r\nX-Mailer: PHP" . phpversion()
                );
            }
        }

        return [
            'title' => 'gol.li - password reset',
            'sent' => $this->getRequest()->isPost(),
        ];
    }

    /**
     * @return array
     */
    public function passwordAction()
    {
        $token = $this->getRequest()->get('token') ?:
            $this->getRequest()->getPost('_token');
        $sessionToken = $this->getSession()->get('passwordResetToken');
        $error = [];

        if (
            $this->getRequest()->isPost() &&
            is_array($sessionToken) &&
            $token &&
            isset($sessionToken[$token])
        ) {
            $error = $this->validate($this->getRequest()->getPost());

            if (empty($error)) {
                $email = $sessionToken[$token];

                $sql = 'SELECT `id` FROM `users` WHERE `email` = :email';

                $stmt = $this->getDb()->prepare($sql);

                $stmt->bindValue(':email', $email);
                $stmt->execute();

                $userID = $stmt->fetchColumn();

                $user = new User();
                $user->setId($userID);

                /** @var User $user */
                $user = $this->getDb()->find($user);
                $user->setNewPassword($this->getRequest()->getPost('_password'));

                $this->getDb()->update($user);

                $this->getSession()->destroy();
            }
        }

        return [
            'title' => 'gol.li - password reset',
            'token' => $token,
            'sent' => $this->getRequest()->isPost(),
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
            empty($post['_password']) ||
            empty($post['_password_confirm'])
        ) {
            $error['password'] = true;
        } else {
            if (strlen($post['_password']) < 6) {
                $error['password'] = true;
            }
            if ($post['_password'] !== $post['_password_confirm']) {
                $error['password_confirm'] = true;
            }
        }

        return $error;
    }
}
