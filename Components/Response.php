<?php

namespace Golli\Components;

class Response
{
    private $__body;

    /**
     * @return mixed
     */
    public function getBody()
    {
        return $this->__body;
    }

    /**
     * @param mixed $_body
     */
    public function setBody($_body)
    {
        $this->__body = $_body;
    }
}
