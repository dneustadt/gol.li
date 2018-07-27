<?php

namespace Golli\Models;

class Service implements ModelInterface
{
    const TABLE = 'services';

    const PRIMARY_INDEX_OPERATOR = 'id=';

    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $name;

    /**
     * @var string
     */
    private $url;

    /**
     * @var string
     */
    private $image;

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
        $this->id = $id;
    }

    /**
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getUrl()
    {
        return $this->url;
    }

    /**
     * @param string $url
     */
    public function setUrl($url)
    {
        $this->url = $url;
    }

    /**
     * @return string
     */
    public function getImage()
    {
        return $this->image;
    }

    /**
     * @param string $image
     */
    public function setImage($image)
    {
        $this->image = $image;
    }

    /**
     * {@inheritdoc}
     */
    public function getData()
    {
        return [
            'name' => $this->getName(),
            'url' => $this->getUrl(),
            'image' => $this->getImage(),
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
