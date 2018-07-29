<?php

namespace Golli\Controllers;

class Terms extends ControllerAbstract
{
    public function indexAction()
    {
        return [
            'title' => 'gol.li - terms of service',
        ];
    }

    public function privacyAction()
    {
        return [
            'title' => 'gol.li - privacy policy',
        ];
    }
}
