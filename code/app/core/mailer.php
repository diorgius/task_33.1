<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function mailsend($address, $code) {
    $mail = new PHPMailer(true);
    // Указываем, что нужно использовать SMTP
    $mail->isSMTP();

    // В целях отладки включаем вывод результатов на страницу отправки
    $mail->SMTPDebug = 2;
    $mail->Debugoutput = 'html';

    // Указываем доступы к SMTP
    $mail->Host = 'smtp.gmail.com'; # хост
    $mail->Port = 587; # порт
    $mail->SMTPSecure = 'tls'; # шифрование
    $mail->SMTPAuth = true; # авторизация
    $mail->Username = "diorgius@gmail.com"; # логин
    $mail->Password = "jxwy zrbz wjkq iejc"; # полученный пароль

    // Получатели и отправители
    $mail->setFrom('diorgius@gmail.com'); # от кого
    $mail->addReplyTo('diorgius@gmail.com'); # адрес для ответа
    $mail->addAddress($address); # кому

    // Тема и содержание
    $mail->Subject = 'Confirmation of registration'; # тема
    $mail->msgHTML("<h1>Приветствуем Вас в нашем мессенджере, для подтверждения регистрации введите на сайте messenger.local полученный Вами в этом письме код</h1> <h2>$code<h2>"); # содержание в формате HTML
    $mail->AltBody = 'This is a plain-text message body'; # альтернативный текст, если не удастся использовать HTML


    // Выводим результат
    if (!$mail->send()) {
        echo "Mailer Error: " . $mail->ErrorInfo;
    } else {
        echo "Message sent!";
    }
}