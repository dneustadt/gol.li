<?php

namespace Golli\Controllers;

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
            $preview = $this->getRequest()->get('preview');
            $isOwner = !$preview ? $this->isOwner($user->getId()) : false;

            if (!$this->getSession()->get('userId') || !$isOwner) {
                $user->setHits($user->getHits() + 1);
                $this->getDb()->update($user);
            }

            $services = $this->getServicesWithHandlesByUserId($user->getId(), $isOwner);

            return [
                'title' => 'gol.li - ' . $user->getUsername(),
                'name' => $user->getUsername(),
                'is_owner' => $isOwner,
                'services' => $services,
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

                if (empty($serviceValue)) {
                    $this->getDb()->delete($userService);

                    continue;
                }

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
     * @return array
     */
    public function shareAction()
    {
        if (!empty($this->getRequest()->getControllerName())) {
            $userID = $this->getUserIdBySlug();

            if ($userID === false) {
                $this->redirect('regular', 'index', 301);
            }

            $services = $this->getServicesWithHandlesByUserId($userID, false);
            $json = $this->getRequest()->get('json');

            if (!empty($json)) {
                $urls = [];

                foreach ($services as $service) {
                    if (!empty($service['handle'])) {
                        $url[$service['name']] = sprintf($service['url'], $service['handle']);
                    }
                }

                header('Content-Type: application/json');
                echo json_encode($url, JSON_PRETTY_PRINT);
                die();
            }

            $this->setTemplate('regular/share.php');

            return [
                'services' => $services,
                'no_skeleton' => true,
            ];
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

    /**
     * @param mixed $userID
     * @param bool  $isOwner
     *
     * @return array|bool
     */
    private function getServicesWithHandlesByUserId($userID, $isOwner = true)
    {
        $joinType = $isOwner ? 'LEFT' : 'INNER';

        $sql = 'SELECT * 
                FROM `services` ' .
                $joinType . ' JOIN `user_services`
                ON `services`.`id` = `user_services`.`serviceID` AND `user_services`.`userID` = :userId
                ORDER BY IF(`user_services`.`position` IS NULL, ~0, `user_services`.`position`) ASC, `services`.`priority` ASC';

        $stmt = $this->getDb()->prepare($sql);

        $stmt->bindValue(':userId', $userID);
        $stmt->execute();

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
