<?php
    $auth = $_SESSION['auth'] ?? null;
    $userId = $_SESSION['userId'] ?? null;
    $nickname = $_SESSION['nickname'] ?? null;
    $role = $_SESSION['role'] ?? null;
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/style_styleload.css">
    <script defer src="../../js/validation.js"></script>
    <script defer src="../../js/main.js"></script>
    <title>Мессенджер</title>
</head>
<body>
    <header class="header">
        <div class="div-header-title">   
            <p>Мессенджер</p>
        </div>
        <div class="div-header-btn-login">
            <?php if (!$auth): ?>
                <button class="btn-login" onclick="location.href='/login'">Вход</button>
                <button class="btn-login" onclick="location.href='/registration'">Регистрация</button>
            <?php else: ?>
                <button class="btn-login" onclick="location.href='/login/signout'">Выход</button>
                <button class="btn-login" onclick="location.href='/profile'">Профиль</button>
            <?php endif; ?>   
        </div>
    </header>

    <main class="main">

        <section class="section-main">
            <?php require_once VIEW . $view_content; ?>
        </section>

    </main>

    <footer class="footer">
        <p>&copy; 2026 Мессенджер</p>
    </footer>

</body>
</html>