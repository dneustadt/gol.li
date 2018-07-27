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

    /**
     * @param string $param
     *
     * @return mixed
     */
    public function get($param)
    {
        return isset($this->__session[$param]) ? $this->__session[$param] : null;
    }

    /**
     * @param string $param
     * @param mixed  $value
     */
    public function set($param, $value)
    {
        $_SESSION[$param] = $value;

        $this->__session = $_SESSION;
    }

    public function destroy()
    {
        session_destroy();
    }

    public function regenerateId()
    {
        session_regenerate_id();
    }
}
