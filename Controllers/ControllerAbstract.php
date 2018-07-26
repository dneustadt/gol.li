<?php

namespace Golli\Controllers;

use Golli\Components\Db;
use Golli\Components\Request;
use Golli\Components\Response;
use Golli\Components\Session;
use Golli\Models\User;

abstract class ControllerAbstract implements ControllerInterface
{
    const TEMPLATE_SKELETON = 'skeleton.php';

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
     * @var Db|null
     */
    private $__db;

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
        $this->__request = $request;
        $this->__response = $response;
        $this->__session = $session;
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

        if (
            !file_exists(
                $this->getRequest()->getAppPath('Views') .
                DIRECTORY_SEPARATOR .
                $this->getTemplate()
            )
        ) {
            $this->setTemplate('regular/index.php');
        }

        $this->getResponse()->setBody($this->readTemplate($data));

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

    /**
     * @return Db
     */
    protected function getDb()
    {
        if (!$this->__db instanceof Db) {
            $this->__db = new Db();
        }

        return $this->__db;
    }

    /**
     * @return null|string
     */
    protected function getTemplate()
    {
        return $this->__template;
    }

    /**
     * @param string $template
     */
    protected function setTemplate($template)
    {
        $this->__template = $template;
    }

    /**
     * @param string $controller
     * @param string $action
     * @param int    $responseCode
     */
    protected function redirect($controller, $action, $responseCode = 302)
    {
        header(
            sprintf('Location: %s/%s/%s', $this->getRequest()->getBasePath(), $controller, $action),
            true,
            $responseCode
        );
        die();
    }

    /**
     * @return bool|\Golli\Models\ModelInterface|User
     */
    protected function login()
    {
        if ($this->getRequest()->isPost()) {
            $username = $this->getRequest()->getPost('_username');
            $password = $this->getRequest()->getPost('_password');

            $sql = 'SELECT `id`, `password` FROM `users` WHERE `username` = :username';

            $stmt = $this->getDb()->prepare($sql);

            $stmt->bindValue(':username', $username);
            $stmt->execute();

            $idPassword = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!empty($idPassword) && password_verify($password, $idPassword['password'])) {
                $user = new User();
                $user->setId($idPassword['id']);

                return $this->getDb()->find($user);
            }
        }

        return false;
    }

    /**
     * @param array $data
     *
     * @throws \Exception
     *
     * @return string
     */
    private function readTemplate($data = [])
    {
        if (!is_array($data)) {
            throw new \Exception(
                sprintf(
                    '%sAction must return array',
                    $this->getRequest()->getActionName()
                )
            );
        }

        $data['template'] = $this->getTemplate();
        $data['base_path'] = $this->getRequest()->getBasePath();

        ob_start();
        include $this->getRequest()->getAppPath('Views') .
            DIRECTORY_SEPARATOR .
            self::TEMPLATE_SKELETON;

        return ob_get_clean();
    }
}
