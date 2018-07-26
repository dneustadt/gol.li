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
    private $verified = 0;

    /**
     * @var int
     */
    private $admin = 0;

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
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
        $this->password = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
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
     * @return int
     */
    public function getAdmin()
    {
        return $this->admin;
    }

    /**
     * @param int $admin
     */
    public function setAdmin($admin)
    {
        $this->admin = $admin;
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
            'verified' => $this->getVerified(),
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
