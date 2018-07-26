<?php

namespace Golli\Controllers;

use Golli\Components\Request;
use Golli\Components\Response;
use Golli\Components\Session;

abstract class ControllerAbstract implements ControllerInterface
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

    /**
     * @param Request  $request
     * @param Response $response
     * @param Session  $session
     */
    public function __construct(
        Request $request,
        Response $response,
        Session $session
    ) {
        $this->__request = new Request();
        $this->__response = new Response();
        $this->__session = new Session();
    }

    /**
     * @throws \Exception
     *
     * @return Response
     */
    public function dispatch()
    {
        $actionMethod = strtolower($this->getRequest()->getActionName()) . 'Action';

        if (!method_exists($this, $actionMethod)) {
            throw new \Exception(
                sprintf(
                    'Action method %s does not exist in %s',
                    $actionMethod,
                    get_class($this)
                )
            );
        }
        $this->$actionMethod();

        return $this->getResponse();
    }

    /**
     * @return Request
     */
    protected function getRequest()
    {
        return $this->__request;
    }

    /**
     * @return Response
     */
    protected function getResponse()
    {
        return $this->__response;
    }

    /**
     * @return Session
     */
    protected function getSession()
    {
        return $this->__session;
    }
}
