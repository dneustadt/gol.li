<?php

namespace Golli\Controllers;

use Golli\Models\User;

class Regular extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        if (!empty($this->getRequest()->getControllerName())) {
            $sql = 'SELECT `id` FROM `users` WHERE `username` = :username';

            $stmt = $this->getDb()->prepare($sql);

            $stmt->bindValue(':username', $this->getRequest()->getControllerName());
            $stmt->execute();

            $userID = $stmt->fetchColumn();

            if ($userID === false) {
                $this->redirect('regular', 'index', 301);
            }

            $user = new User();
            $user->setId($userID);

            /** @var User $user */
            $user = $this->getDb()->find($user);

            return [
                'title' => 'gol.li - ' . $user->getUsername(),
                'name' => $user->getUsername(),
            ];
        }

        return [
            'title' => 'gol.li',
        ];
    }
}
