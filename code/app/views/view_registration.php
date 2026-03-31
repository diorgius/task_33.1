<?php
$csrf_token = hash('gost-crypto', random_int(0, 999999));
$_SESSION['csrf_token'] = $csrf_token;
?>

<div class="div-main-login-container">

    <div class="div-alert">
        <?php if (!empty($data)): ?>
            <?php foreach ($data as $error): ?>
                <p><?= $error; ?></p>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <form class="form-login" id="formlogin" action="/registration/signup" method="post">
        <input class="input-login" name="email" id="email" type="email" placeholder="email" value="example@example.com" required />
        <input class="input-login" name="password" id="password" type="password" placeholder="пароль" required />
        <input class="input-login" name="passwordagain" id="passwordagain" type="password" placeholder="пароль еще раз" required />
        <input type="hidden" name="csrf_token" value="<?= $csrf_token ?>">
        <button class="btn-signup" name="submit" id="send" type="submit">Зарегистрироваться</button>
    </form>
</div>