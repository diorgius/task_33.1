<?php if (!$auth): ?>
    <div class="div-greeting">Пожалуйста авторизуйтесь</div>
<?php else: ?>
    <h2>Добро пожаловать <?= $nickname ?></h2>
    <?php if ($role === 'admin'): ?>
        <button class="btn-admin-action" onclick="location.href='/admin'">Страница администрирования</button>
    <?php endif; ?>
<?php endif; ?>   
