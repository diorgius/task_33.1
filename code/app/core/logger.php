<?php

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

function logging(string $errorlevel, string $message)
{
    $logger = new Logger('logger');
    $logger->pushHandler(new StreamHandler(LOG . 'debuglog.log', Logger::DEBUG));
    $logger->pushHandler(new StreamHandler(LOG . 'warninglogs.log', Logger::WARNING));
    $logger->pushHandler(new StreamHandler(LOG . 'alertlogs.log', Logger::ALERT));

    $logger->$errorlevel(strtoupper("$errorlevel message. ") . $message);
}

// $logger->debug('Debug message');
// $logger->info('Informational message');
// $logger->notice('Notice message');
// $logger->warning('Warning message');
// $logger->error('Error message');
// $logger->critical('Critical message');
// $logger->alert('Alert message');
// $logger->emergency('Emergency message');