<?php

namespace Golli\Models;

class User implements ModelInterface
{
    const TABLE = 'users';

    const PRIMARY_INDEX_OPERATOR = 'id=';

    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $username;

    /**
     * @var string
     */
    private $email;

    /**
     * @var string
     */
    private $password;

    /**
     * @var int
     */
    private $hits = 0;

    /**
     * @var int
     */
    private $verified = 0;

    /**
     * @var int
     */
    private $admin = 0;

    /**
     * @var string
     */
    private $sessionID;

    /**
     * @var string
     */
    private $created;

    /**
     * @var string
     */
    private $lastLogin;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param int $id
     */
    public function setId($id)
    {
        $this->id = (int) $id;
    }

    /**
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param string $username
     */
    public function setUsername($username)
    {
        $this->username = $username;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return $this->email;
    }

    /**
     * @param string $email
     */
    public function setEmail($email)
    {
        $this->email = $email;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }

    /**
     * @param string $password
     */
    public function setNewPassword($password)
    {
        $this->password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * @return int
     */
    public function getHits()
    {
        return $this->hits;
    }

    /**
     * @param int $hits
     */
    public function setHits($hits)
    {
        $this->hits = $hits;
    }

    /**
     * @return int
     */
    public function getVerified()
    {
        return $this->verified;
    }

    /**
     * @param int $verified
     */
    public function setVerified($verified)
    {
        $this->verified = $verified;
    }

    /**
     * @return bool
     */
    public function isAdmin()
    {
        return (bool) $this->admin;
    }

    /**
     * @param int $admin
     */
    public function setAdmin($admin)
    {
        $this->admin = $admin;
    }

    /**
     * @return string
     */
    public function getSessionID()
    {
        return $this->sessionID;
    }

    /**
     * @param string $sessionID
     */
    public function setSessionID($sessionID)
    {
        $this->sessionID = $sessionID;
    }

    /**
     * @return string
     */
    public function getCreated()
    {
        return $this->created;
    }

    /**
     * @param string $created
     */
    public function setCreated($created)
    {
        $this->created = $created;
    }

    /**
     * @return string
     */
    public function getLastLogin()
    {
        return $this->lastLogin;
    }

    /**
     * @param string $lastLogin
     */
    public function setLastLogin($lastLogin)
    {
        $this->lastLogin = $lastLogin;
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        return [
            'username' => $this->getUsername(),
            'email' => $this->getEmail(),
            'password' => $this->getPassword(),
            'hits' => $this->getHits(),
            'verified' => $this->getVerified(),
            'sessionID' => $this->getSessionID(),
            'created' => $this->getCreated(),
            'lastLogin' => $this->getLastLogin(),
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
        return self::PRIMARY_INDEX_OPERATOR . $this->getId();
    }
}
