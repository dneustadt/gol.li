<?php

namespace Golli\Controllers;

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
