<?php

namespace Golli\Components;

use Golli\Controllers\ControllerAbstract;
use Golli\Controllers\Regular;

class Kernel
{
    /**
     * @var Request
     */
    private $__request;

    /**
     * @var Response
     */
    private $__response;

    /**
     * @var Session
     */
    private $__session;

    public function __construct()
    {
        $this->__request = new Request();
        $this->__response = new Response();
        $this->__session = new Session();
    }

    /**
     * @throws \Exception
     */
    public function boot()
    {
        $this->getController()->dispatch();
    }

    /**
     * @throws \Exception
     */
    public function render()
    {
        echo $this->__response->getBody();
    }

    /**
     * @return ControllerAbstract
     */
    private function getController()
    {
        $controllerName = ucfirst($this->__request->getControllerName());
        $controllerClass = '\\Golli\\Controllers\\' . $controllerName;

        if (
            !empty($controllerName) &&
            class_exists($controllerClass)
        ) {
            return new $controllerClass(
                $this->__request,
                $this->__response,
                $this->__session
            );
        }

        return new Regular(
            $this->__request,
            $this->__response,
            $this->__session
        );
    }
}
