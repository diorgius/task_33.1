<?php
$csrf_token = hash('gost-crypto', random_int(0, 999999));
$_SESSION['csrf_token'] = $csrf_token;
?>

<div class="div-main-login-container">

    <div class="div-alert">
        <?php if ($data): ?>
            <p><?= $data ?></p>
        <?php endif; ?>
    </div>

    <form class="form-login" action="/login/signup" method="post">
        <input class="input-login" name="emaillogin" id="emaillogin" type="text" placeholder="email" required>
        <input class="input-login" name="passwordlogin" id="passwordlogin" type="password" placeholder="пароль" required>
        <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
        <div class="div-input-checkbox">
            <input class="input-checkbox" name="remember" type="checkbox">&nbsp&nbspЗапомнить меня
        </div>
        <button class="btn-signup" name="submit" type="submit">Войти</button>
    </form>
</div>