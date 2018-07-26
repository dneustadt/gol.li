<?php

namespace Golli\Controllers;

use Golli\Components\Request;
use Golli\Components\Response;
use Golli\Components\Session;

abstract class ControllerAbstract implements ControllerInterface
{
    /**
     * @var string|null
     */
    protected $__template = null;
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

        $data = $this->$actionMethod();

        if (empty($this->__template)) {
            $templateFile = join('/', [
                $this->getRequest()->getControllerName(),
                $this->getRequest()->getActionName(),
            ]) . '.php';

            $this->setTemplate($templateFile);
        }

        if (!file_exists($this->getTemplate())) {
            $this->setTemplate('regular/index.php');
        }

        ob_start();
        include $this->getTemplate();
        $body = ob_get_clean();

        $this->getResponse()->setBody($body);

        return $this->getResponse();
    }

    /**
     * @return null|string
     */
    public function getTemplate()
    {
        return $this->__template;
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

    /**
     * @param string $template
     */
    protected function setTemplate($template)
    {
        $this->__template = $this->getRequest()->getAppPath('Views') . DIRECTORY_SEPARATOR . $template;
    }
}
