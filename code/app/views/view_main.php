<?php if (!$auth): ?>
    <div class="div-greeting">Пожалуйста авторизуйтесь</div>
<?php else: ?>
    <?php if ($role === 'admin'): ?>
        <button class="btn-admin-action" onclick="location.href='/admin'">Страница администрирования</button>
        <?php phpinfo(); ?>
    <?php else: ?>

    <aside class="sidebar" id="aside-sidebar">

        <?php if (!empty($data['user'])): ?>
            <div class="div-user-avatar">
            <?php isset($data['user']['avatar']) ? $image = URL . 'avatars/' . $data['user']['avatar'] : $image = URL . 'img/avatar_0.jpg'; ?>
                <img src="<?= $image; ?>" alt="avatar" width="90px">
                <p class="p-nickname"><?= $data['user']['nickname']; ?></p>
            </div>    
        <?php endif; ?>

        <button class="btn-add-user" id="btnadduser" name="btnadduser">Добавить пользователей</button>
        <div class="div-user-chats" id="divuserchats">
            
            <?php if (!empty($data['contacts'])): ?>

                <?php foreach($data['contacts'] as $key => $value): ?>
                <div class="div-chat-user" id="<?= $data['contacts'][$key]['contact_user_id']; ?>"  >
                    <div>
                        <?php !empty($data['contacts'][$key]['avatar']) ? $image = URL . 'avatars/' . $data['contacts'][$key]['avatar'] : $image = URL . 'img/avatar_0.jpg'; ?>
                        <img src="<?= $image; ?>" alt="Аватар" width="35">
                    </div>
                    <div class="div-user-nickname">
                        <p><?= $data['contacts'][$key]['nickname']; ?></p>
                    </div>
                </div>
                <?php endforeach; ?>

            <?php endif; ?>

        </div>

        <ul class="ul-chat-user-menu">
            <li><a href="#" id="deletechatuser">Удалить пользователя из списка чатов</a></li>
            <li><a href="#" id="deleteuserchats">Удалить чаты с пользователем</a></li>
        </ul>
        
    </aside>
    
    <section class="section-main-window">

        <input type="text" id="userid" hidden value="<?= $userId?>">

        <div class="div-seach-users">
            <input class="input-search-users" type="text" id="searchusers" name="searchusers" />
        </div>

        <div class="div-alert"></div>

        <div class="div-list-users" id="divlistusers"></div>

        <div class="div-text-message">
            <textarea class="textarea-text-message" type="text" id="textareatextmessage" name="textareatextmessage" placeholder="Ваше сообщение..."></textarea>&nbsp&nbsp
            <a class="a-message-send" href="#"><img class="img-message-send" src="../img/send.png" alt="Отправить"></a>
        </div>

    </section>

    <?php endif; ?>
<?php endif; ?> 
