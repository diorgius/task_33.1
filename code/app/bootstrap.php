<?php

namespace App;
use App\core\Route;

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once 'core' . DIRECTORY_SEPARATOR . 'config.php';
require_once VENDOR . 'autoload.php';

Route::start();