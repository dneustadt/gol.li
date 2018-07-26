<?php

namespace Golli\Controllers;

class Backend extends ControllerAbstract
{
    /**
     * {@inheritdoc}
     */
    public function indexAction()
    {
        $this->redirect('backend', 'login');
    }

    /**
     * @return array
     */
    public function loginAction()
    {
        return [];
    }
}
