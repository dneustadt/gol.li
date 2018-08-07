<?php

namespace Golli\Models;

class UserSettings implements ModelInterface
{
    const TABLE = 'user_settings';

    const PRIMARY_INDEX_OPERATOR = 'userID=';

    /**
     * @var int
     */
    private $userID;

    /**
     * @var string
     */
    private $layout = 'list';

    /**
     * @var string
     */
    private $theme = 'light';

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
        $this->userID = (int) $userID;
    }

    /**
     * @return string
     */
    public function getLayout()
    {
        return $this->layout;
    }

    /**
     * @param string $layout
     */
    public function setLayout($layout)
    {
        if (in_array($layout, ['list', 'tiles'])) {
            $this->layout = $layout;

            return;
        }

        $this->layout = 'list';
    }

    /**
     * @return string
     */
    public function getTheme()
    {
        return $this->theme;
    }

    /**
     * @param string $theme
     */
    public function setTheme($theme)
    {
        if (in_array($theme, ['light', 'dark'])) {
            $this->theme = $theme;

            return;
        }

        $this->theme = 'light';
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        return [
            'userID' => $this->getUserID(),
            'layout' => $this->getLayout(),
            'theme' => $this->getTheme(),
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
        return self::PRIMARY_INDEX_OPERATOR . $this->getUserID();
    }
}
