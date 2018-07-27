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
            $userID = $this->getUserIdBySlug();

            if ($userID === false) {
                $this->redirect('regular', 'index', 301);
            }

            $user = new User();
            $user->setId($userID);

            /** @var User $user */
            $user = $this->getDb()->find($user);
            $isOwner = $this->isOwner($user->getId());

            if (!$this->getSession()->get('userId') || !$isOwner) {
                $user->setHits($user->getHits() + 1);
                $this->getDb()->update($user);
            }

            return [
                'title' => 'gol.li - ' . $user->getUsername(),
                'name' => $user->getUsername(),
                'isOwner' => $isOwner,
            ];
        }

        return [
            'title' => 'gol.li',
        ];
    }

    /**
     * @return mixed
     */
    private function getUserIdBySlug()
    {
        $sql = 'SELECT `id` FROM `users` WHERE `username` = :username';

        $stmt = $this->getDb()->prepare($sql);

        $stmt->bindValue(':username', $this->getRequest()->getControllerName());
        $stmt->execute();

        return $stmt->fetchColumn();
    }

    /**
     * @param $userID
     *
     * @return bool
     */
    private function isOwner($userID)
    {
        return $this->getSession()->get('userId') == $userID;
    }
}
