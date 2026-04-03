<?php if (!$auth): ?>
    <div class="div-greeting">Пожалуйста авторизуйтесь</div>
<?php else: ?>
    <?php if ($role === 'admin'): ?>
        <button class="btn-admin-action" onclick="location.href='/admin'">Страница администрирования</button>
        <?php phpinfo(); ?>
    <?php else: ?>
    
    <aside class="sidebar">
        <?php if (!empty($data)): ?>
            <div class="div-user-avatar">
                <img src="<?= URL . 'avatars/' . $data['avatar'] ?>" alt="avatar" width="90px">
                <p><?= $data['nickname']?></p>
            </div>    
        <?php endif; ?>

        <p>Здесь будем выводить чаты</p>
    </aside>
    
    <section class="section-main-window">
        <div class="div-seach-users">
            <input class="input-search-users" type="text" id="searchusers" name="searchusers" />
        </div>

        <div class="div-text-message">
            <input class="input-text-message" type="text" id="textmessage" name="textmessage" />
        </div>
    </section>



    <?php endif; ?>
<?php endif; ?> 
