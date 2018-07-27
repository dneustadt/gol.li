<?php

namespace Golli\Controllers;

use Golli\Models\Service;
use Golli\Models\User;

class Backend extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        $this->checkLogin();

        $limit = 10;
        $page = (int) $this->getRequest()->get('page');
        $offset = $page * $limit;

        $model = new User();
        $users = $this->getDb()->findAll($model, $offset, $limit);
        $count = $this->getDb()->count($model);

        return [
            'title' => 'gol.li - backend',
            'users' => $users,
            'page' => $page,
            'pages' => ceil($count / $limit),
        ];
    }

    public function deleteUserAction()
    {
        $this->checkLogin();

        $id = (int) $this->getRequest()->get('id');

        $model = new User();
        $model->setId($id);

        $this->getDb()->delete($model);

        $this->redirect('backend', 'index');
    }

    public function servicesAction()
    {
        $this->checkLogin();

        $limit = 100;
        $page = (int) $this->getRequest()->get('page');
        $offset = $page * $limit;

        $model = new Service();
        $services = $this->getDb()->findAll($model, $offset, $limit);
        $count = $this->getDb()->count($model);

        return [
            'title' => 'gol.li - backend',
            'services' => $services,
            'page' => $page,
            'pages' => ceil($count / $limit),
        ];
    }

    public function deleteServiceAction()
    {
        $this->checkLogin();

        $id = (int) $this->getRequest()->get('id');

        $model = new Service();
        $model->setId($id);

        $this->getDb()->delete($model);

        $this->redirect('backend', 'index');
    }

    public function addServiceAction()
    {
        $post = $this->getRequest()->getPost();

        if ($this->getRequest()->isPost()) {
            $service = new Service();
            $service->setName($post['_name']);
            $service->setUrl($post['_url']);
            $service->setPriority($post['_priority']);

            $file = $this->getRequest()->getFile('_image');
            if (!empty($file['tmp_name'])) {
                $filename = $file["name"];
                $path = '/web/icons/' . $filename;

                if (move_uploaded_file($file["tmp_name"], $this->getRequest()->getAppPath() . $path)) {
                    $service->setImage($path);
                }
            }

            $this->getDb()->insert($service);
        }

        $this->redirect('backend', 'services');
    }

    /**
     * @return array
     */
    public function loginAction()
    {
        if ($this->isLoggedIn() && $this->getSession()->get('isAdmin')) {
            $this->redirect('backend', 'index');
        }

        $user = $this->login(true);

        if ($user instanceof User) {
            $this->redirect('backend', 'index');
        }

        return [
            'title' => 'gol.li - backend',
        ];
    }

    public function logoutAction()
    {
        session_destroy();

        $this->redirect('backend', 'login');
    }

    private function checkLogin()
    {
        if (!$this->isLoggedIn() || !$this->getSession()->get('isAdmin')) {
            $this->redirect('backend', 'login');
        }
    }
}
