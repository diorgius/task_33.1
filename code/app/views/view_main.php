<?php if (!$auth): ?>
    <div class="div-greeting">Пожалуйста авторизуйтесь</div>
<?php else: ?>
    <?php if ($role === 'admin'): ?>
        <button class="btn-admin-action" onclick="location.href='/admin'">Страница администрирования</button>
        <?php phpinfo(); ?>
    <?php else: ?>
         <!-- может его заменить на другой элемент -->
        <input type="text" id="userid" hidden value="<?= $userId ?>">

        <aside class="sidebar-left" id="sidebarleft">

            <?php if (!empty($data['user'])): ?>

                <div class="div-user-avatar">
                    <?php isset($data['user']['avatar']) ? $image = URL . 'avatars/' . $data['user']['avatar'] : $image = URL . 'img/avatar_0.jpg'; ?>
                    <img src="<?= $image; ?>" alt="avatar" width="90px">
                    <?php isset($data['user']['nickname']) && !empty($data['user']['nickname']) ? 
                        $nickname = $data['user']['nickname'] : $nickname = $data['user']['email']; ?>
                    <p class="p-nickname"><?= $nickname; ?></p>
                <?php endif; ?>
            </div>

            <div class="div-user-chats" id="divuserchats">

                <?php if (!empty($data['contacts'])): ?>

                    <?php foreach ($data['contacts'] as $key => $value): ?>
                        <div class="div-chat-user" id="<?= $data['contacts'][$key]['contact_user_id']; ?>">
                            <div>
                                <?php !empty($data['contacts'][$key]['avatar']) ? 
                                    $image = URL . 'avatars/' . $data['contacts'][$key]['avatar'] : $image = URL . 'img/avatar_0.jpg'; ?>
                                <img src="<?= $image; ?>" alt="Аватар" width="35">
                            </div>
                            <div class="div-user-nickname">
                                <?php isset($data['contacts'][$key]['nickname']) && !empty($data['contacts'][$key]['nickname']) ? 
                                    $nickname = $data['contacts'][$key]['nickname'] : $nickname = $data['contacts'][$key]['email']; ?>
                                <p><?= $nickname; ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>

                <?php endif; ?>

            </div>

            <ul class="ul-chat-user-menu">
                <li id="addgroupchat">Добавить в групповой чат</li>
                <li id="offnotification">Отключить оповещение</li>
                <li id="onnotification">Включить оповещение</li>
                <li id="deletechatuser">Удалить пользователя из списка контактов</li>
                <li id="deleteuserchats">Удалить переписку с пользователем</li>
            </ul>

        </aside>

        <aside class="sidebar-right">

            <div class="div-btn-right-group">
                <button class="btn-add" id="btnadduser" name="btnadduser">Добавить пользователей</button>
                <button class="btn-add" id="btncreategroup" name="btncreategroup">Создать группу</button>
            </div>

        </aside>

        <div class="div-alert"></div>
        
        <section class="section-main-window" id="mainwindow">
            
            <div class="div-list-users" id="divlistusers"></div>
            <div class="div-wrapper-create-group" id="divwrappercreategroup"></div>

            <ul class="ul-message-menu">
                <li id="deletemessage">Удалить сообщение</li>
                <li id="editmessage">Редактировать сообщение</li>
                <li class="span-forward-user" id="forwardmessage">Переслать сообщение</li>
            </ul>

        </section>

        <section class="section-message">

            <div class="div-text-send-message">
                <textarea class="textarea-text-send-message" type="text" id="textsendmessage" name="textsendmessage"
                    placeholder="Ваше сообщение..."></textarea>&nbsp&nbsp
                <a class="a-send-message" href="#" id="sendmessage"><img src="../img/send.png" alt="Отправить"></a>
            </div>

        </section>
        <script defer src="../../js/messenger.js"></script>
    <?php endif; ?>
<?php endif; ?>

