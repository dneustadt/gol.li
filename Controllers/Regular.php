<?php

namespace Golli\Controllers;

use Golli\Models\Service;
use Golli\Models\User;
use Golli\Models\UserServices;

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
                'is_owner' => $isOwner,
                'services' => $isOwner ? $this->getDb()->findAll(new Service()) : [],
            ];
        }

        return [
            'title' => 'gol.li',
        ];
    }

    public function updateAction()
    {
        $userID = $this->getUserIdBySlug();

        if ($this->isOwner($userID)) {
            $serviceValues = $this->getRequest()->getPost('services');
            $position = 0;

            foreach ($serviceValues as $serviceID => $serviceValue) {
                $userService = new UserServices();
                $userService->setUserID($userID);
                $userService->setServiceID($serviceID);
                $userService->setHandle($serviceValue);
                $userService->setPosition($position);

                $this->getDb()->insert($userService, true);

                $position++;
            }
            $this->redirect($this->getRequest()->getControllerName(), 'index');
        }

        $this->redirect('regular', 'index', 301);
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
