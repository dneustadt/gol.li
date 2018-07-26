<?php

define('APP_PATH', __DIR__);

require_once APP_PATH . DIRECTORY_SEPARATOR . 'autoloader.php';

$loader = new Psr4AutoloaderClass();
$loader->addNamespace('Golli', __DIR__);
$loader->register();

$kernel = new \Golli\Components\Kernel();

$kernel->boot();
$kernel->render();
