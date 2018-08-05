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
                'email' => $user->getEmail(),
                'is_owner' => $isOwner,
                'services' => $services,
                'error' => $this->getRequest()->get('error'),
            ];
        }

        return [
            'title' => 'gol.li - the social network hub',
            'login_error' => $this->getRequest()->get('login_error'),
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

                $userService->setHandle(
                    implode(
                        '/',
                        array_map(
                            'rawurlencode',
                            explode('/', urldecode($serviceValue))
                        )
                    )
                );
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
                        $urls[$service['name']] = sprintf($service['url'], $service['handle']);
                    }
                }

                header('Content-Type: application/json');
                header('Access-Control-Allow-Origin: *');
                header('Access-Control-Allow-Headers: Origin, X-Requested-With, X-CSRF-Token, Content-Type, Accept');
                echo json_encode($urls, JSON_PRETTY_PRINT);
                die();
            }

            $this->setTemplate('regular/share.php');

            return [
                'services' => $services,
                'no_skeleton' => true,
            ];
        }

        return $this->redirect('regular', 'index', 301);
    }

    public function updateProfileAction()
    {
        if (!empty($this->getRequest()->getControllerName())) {
            $userID = $this->getUserIdBySlug();

            if ($userID === false || !$this->isOwner($userID)) {
                $this->redirect('regular', 'index', 301);
            }

            $oldPassword = $this->getRequest()->getPost('_old_password');
            $newPassword = $this->getRequest()->getPost('_new_password');
            $newPasswordConfirm = $this->getRequest()->getPost('_new_password_confirm');
            $email = $this->getRequest()->getPost('_email');

            if (!empty($newPassword) && (strlen($newPassword) < 6 || $newPassword !== $newPasswordConfirm)) {
                $this->redirect(
                    $this->getRequest()->getControllerName(),
                    'index',
                    302,
                    ['error' => 'password_match']
                );
            }

            $user = new User();
            $user->setId($userID);

            /** @var User $user */
            $user = $this->getDb()->find($user);

            if (empty($oldPassword) || !password_verify($oldPassword, $user->getPassword())) {
                $this->redirect(
                    $this->getRequest()->getControllerName(),
                    'index',
                    302,
                    ['error' => 'password']
                );
            }

            if (!empty($newPassword)) {
                $user->setNewPassword($newPassword);
            }

            if ($email !== $user->getEmail()) {
                $sql = 'SELECT `id` FROM `users` WHERE `email` = :email';
                $stmt = $this->getDb()->prepare($sql);
                $stmt->bindValue(':email', $email);
                $stmt->execute();

                if (empty($stmt->fetchColumn())) {
                    $user->setEmail($email);
                } else {
                    $this->redirect(
                        $this->getRequest()->getControllerName(),
                        'index',
                        302,
                        ['error' => 'email']
                    );
                }
            }

            $this->getDb()->update($user);

            $this->redirect($this->getRequest()->getControllerName(), 'index');
        }
    }

    public function deleteProfileAction()
    {
        if (!empty($this->getRequest()->getControllerName())) {
            $userID = $this->getUserIdBySlug();

            if ($userID === false || !$this->isOwner($userID)) {
                $this->redirect('regular', 'index', 301);
            }

            $user = new User();
            $user->setId($userID);

            $this->getDb()->delete($user);
            $this->getSession()->destroy();

            $this->redirect('regular', 'index', 301);
        }
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
     * @return array
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

        $services = $stmt->fetchAll(\PDO::FETCH_ASSOC) ?: [];

        foreach ($services as &$service) {
            $pattern = '/^' . str_replace([':', '/', '%s'], ['%3A', '\/', '(.*?)'], $service['url']) . '$/i';
            $cleanedHandle = str_replace(['http%3A//', 'www.'], ['https%3A//', ''], $service['handle']);

            if (!empty($cleanedHandle) && preg_match($pattern, $cleanedHandle, $matches)) {
                $service['handle'] = $matches[1];
            }

            if (!$isOwner) {
                $service['name'] = trim(preg_replace('/\([^)]+\)/','', $service['name']));
            }
        }

        return $services;
    }
}
