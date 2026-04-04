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

        <button class="btn-add-user" id="btnadduser" name="btnadduser">Добавить пользователя</button>
    </aside>
    
    <section class="section-main-window">
        <div class="div-seach-users">
            <input class="input-search-users" type="text" id="searchusers" name="searchusers" />
        </div>

        <div class="div-list-users" id="divlistusers">
            <input type="text" id="userid" hidden value="<?= $userId?>">
        </div>

        <div class="div-text-message">
            <textarea class="textarea-text-message" type="text" id="textareatextmessage" name="textareatextmessage" placeholder="Ваше сообщение..."></textarea>&nbsp&nbsp
            <a class="a-message-send" href="#"><img class="img-message-send" src="../img/send.png" alt="Отправить"></a>
        </div>
    </section>



    <?php endif; ?>
<?php endif; ?> 
