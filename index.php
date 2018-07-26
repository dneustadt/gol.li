<?php

define('APP_PATH', __DIR__);

require_once APP_PATH . DIRECTORY_SEPARATOR . 'autoloader.php';

$loader = new Psr4AutoloaderClass();
$loader->addNamespace('Golli', __DIR__);
$loader->register();

if (file_exists(APP_PATH . DIRECTORY_SEPARATOR . '.env.php')) {
    include_once APP_PATH . DIRECTORY_SEPARATOR . '.env.php';
}

$kernel = new \Golli\Components\Kernel();

$kernel->boot();
$kernel->render();
