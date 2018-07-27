<?php

namespace Golli\Models;

class UserServices implements ModelInterface
{
    const TABLE = 'user_services';

    /**
     * @var int
     */
    private $userID;

    /**
     * @var string
     */
    private $serviceID;

    /**
     * @var string
     */
    private $handle;

    /**
     * @var int
     */
    private $position = 0;

    /**
     * @return int
     */
    public function getUserID()
    {
        return $this->userID;
    }

    /**
     * @param int $userID
     */
    public function setUserID($userID)
    {
        $this->userID = $userID;
    }

    /**
     * @return string
     */
    public function getServiceID()
    {
        return $this->serviceID;
    }

    /**
     * @param string $serviceID
     */
    public function setServiceID($serviceID)
    {
        $this->serviceID = $serviceID;
    }

    /**
     * @return string
     */
    public function getHandle()
    {
        return $this->handle;
    }

    /**
     * @param string $handle
     */
    public function setHandle($handle)
    {
        $this->handle = $handle;
    }

    /**
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param int $position
     */
    public function setPosition($position)
    {
        $this->position = (int) $position;
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        return [
            'userID' => $this->getUserID(),
            'serviceID' => $this->getServiceID(),
            'handle' => $this->getHandle(),
            'position' => $this->getPosition(),
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getTable()
    {
        return self::TABLE;
    }

    /**
     * {@inheritdoc}
     */
    public function getPrimaryIndexCondition()
    {
        return 'userID=' . $this->getUserID() . ' AND serviceID=' . $this->getServiceID();
    }
}
