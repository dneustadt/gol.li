<?php

namespace Golli\Components;

class Request
{
    /**
     * @var array
     */
    private $__server;

    /**
     * @var array
     */
    private $__get;

    /**
     * @var array
     */
    private $__post;

    public function __construct()
    {
        $this->__server = $_SERVER;
        $this->__get = $_GET;
        $this->__post = $_POST;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return substr(
            parse_url($this->__server['REQUEST_URI'], PHP_URL_PATH),
            strlen($this->getBasePath())
        );
    }

    /**
     * @param string $path
     *
     * @return string
     */
    public function getAppPath($path = null)
    {
        return $path ? APP_PATH . DIRECTORY_SEPARATOR . $path : APP_PATH;
    }

    /**
     * @return string
     */
    public function getBasePath()
    {
        return substr(APP_PATH, strlen($this->__server['DOCUMENT_ROOT']));
    }

    /**
     * @return string|null
     */
    public function getControllerName()
    {
        $pathParts = $this->getPathParts();

        return is_array($pathParts) ? strtolower($pathParts[0]) : null;
    }

    /**
     * @return string
     */
    public function getActionName()
    {
        $pathParts = $this->getPathParts();

        return is_array($pathParts) && isset($pathParts[1]) ? strtolower($pathParts[1]) : 'index';
    }

    /**
     * @param string|null $param
     *
     * @return mixed
     */
    public function get($param = null)
    {
        if (empty($param)) {
            return $this->__get;
        }

        return isset($this->__get[$param]) ? $this->__get[$param] : null;
    }

    /**
     * @param string $param
     * @param mixed  $value
     */
    public function set($param, $value)
    {
        $this->__get[$param] = $value;
    }

    /**
     * @param string|null $param
     *
     * @return mixed
     */
    public function getPost($param = null)
    {
        if (empty($param)) {
            return $this->__post;
        }

        return isset($this->__post[$param]) ? $this->__post[$param] : null;
    }

    /**
     * @param string $param
     * @param mixed  $value
     */
    public function setPost($param, $value)
    {
        $this->__post[$param] = $value;
    }

    /**
     * @return array
     */
    private function getPathParts()
    {
        return explode('/', trim($this->getPath(), '/'));
    }
}
