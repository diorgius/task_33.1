<?php if (!$auth): ?>
    <div class="div-greeting">Пожалуйста авторизуйтесь</div>
<?php else: ?>
    <?php if ($role === 'admin'): ?>
        <button class="btn-admin-action" onclick="location.href='/admin'">Страница администрирования</button>
        <?php phpinfo(); ?>
    <?php else: ?>

    <aside class="sidebar">
        <?php if (!empty($data['user'])): ?>
            <div class="div-user-avatar">
                <img src="<?= URL . 'avatars/' . $data['user']['avatar']; ?>" alt="avatar" width="90px">
                <p class="p-nickname"><?= $data['user']['nickname']; ?></p>
            </div>    
        <?php endif; ?>

        <button class="btn-add-user" id="btnadduser" name="btnadduser">Добавить пользователя</button>
        <div class="div-user-chats" id="divuserchats">
            <?php if (!empty($data['contacts'])): ?>
                <?php foreach($data['contacts'] as $key => $value): ?>
                <div class="div-chat-user" id="divchatuser">
                    <div>
                        <img src="<?= URL . 'avatars/' . $data['contacts'][$key]['avatar']; ?>" alt="avatat" width="35">
                    </div>
                    <div class="div-user-nickname">
                        <p id="<?= $data['contacts'][$key]['nickname']; ?>"><?= $data['contacts'][$key]['nickname']; ?></p>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </aside>
    
    <section class="section-main-window">
        <div class="div-seach-users">
            <input class="input-search-users" type="text" id="searchusers" name="searchusers" />
        </div>
        <?php var_dump($data)?>
        <div class="div-alert"></div>

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
