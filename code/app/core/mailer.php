<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function mailsend($email, $code)
{
    $mail = new PHPMailer(true);
    // указываем, что нужно использовать SMTP
    $mail->isSMTP();

    // для отладки включаем вывод результатов на страницу отправки
    // $mail->SMTPDebug = 2;
    // $mail->Debugoutput = 'html';

    // указываем доступы к SMTP
    $mail->Host = 'smtp.gmail.com'; // хост
    $mail->Port = 587; # порт
    $mail->SMTPSecure = 'tls'; // шифрование
    $mail->SMTPAuth = true; // авторизация
    $mail->Username = "messengerlocal2026@gmail.com"; // логин
    $mail->Password = "qyxe wckb xxkg maoh"; // пароль mailsender

    // получатели и отправители
    $mail->setFrom('messengerlocal2026@gmail.com'); // от кого
    $mail->addReplyTo('messengerlocal2026@gmail.com'); // адрес для ответа
    $mail->addAddress($email); // кому

    // тема и содержание
    $mail->Subject = 'Confirmation of registration'; // тема
    $mail->msgHTML("<h2>Welcome to our messenger. To confirm your registration, enter the code you received in this email on the messenger.local website</h1> <h2>$code<h2>");

    // выводим результат
    if (!$mail->send()) {
        echo "Mailer Error: " . $mail->ErrorInfo;
        return false;
    } else {
        return true;
    }
}