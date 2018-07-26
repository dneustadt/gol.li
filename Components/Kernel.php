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
    public function render()
    {
        $this->__response = $this->boot();

        echo $this->__response->getBody();
    }

    /**
     * @throws \Exception
     *
     * @return Response
     */
    private function boot()
    {
        $controller = $this->getController();

        return $controller->dispatch();
    }

    /**
     * @return ControllerAbstract
     */
    private function getController()
    {
        $controllerName = ucfirst(strtolower($this->__request->getControllerName()));
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
