<?php
$csrf_token = hash('gost-crypto', random_int(0, 999999));
$_SESSION['csrf_token'] = $csrf_token;
?>

<div class="div-main-login-container">

    <div class="div-alert">
        <?php if (!empty($data)): ?> // если убрать проверку на бэке, то массив не нужен
            <?php foreach ($data as $error): ?>
                <p><?= $error; ?></p>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <form class="form-login" id="formlogin" action="/registration/signup" method="post">
        <input class="input-login" name="email" id="email" type="email" placeholder="email" value="diorg@mail.ru" required autocomplete="off" />
        <input class="input-login" name="password" id="password" type="password" placeholder="пароль" value="12345678" required autocomplete="off" />
        <input class="input-login" name="passwordagain" id="passwordagain" type="password" placeholder="пароль еще раз" value="12345678" required autocomplete="off" />
        <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
        <button class="btn-signup" name="submit" id="send" type="submit">Зарегистрироваться</button>
    </form>
</div>