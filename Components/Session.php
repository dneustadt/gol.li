<?php

namespace Golli\Components;

class Session
{
    /**
     * @var array
     */
    private $__session;

    public function __construct()
    {
        if (empty($this->getSessionId())) {
            session_start();
        }

        $this->__session = $_SESSION;
    }

    /**
     * @return string
     */
    public function getSessionId()
    {
        return session_id();
    }
}
