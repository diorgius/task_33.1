// функция вывода списка пользователей и добавления пользователя в список контактов
function showUsersList(result, typeAction) {
    // console.log(result);
    let divAddUsers = document.createElement('div');
    DIV_LIST_USERS.appendChild(divAddUsers);
    divAddUsers.setAttribute('id', 'divaddusers');
    result.forEach((item) => {
        // проверяем пользователя, что бы в списках он не выводился
        if ((typeAction === 'addUserToPrivate' && `${item.id}` !== USER_ID) || 
            (typeAction === 'addUserToGroup' && `${item.contact_user_id}` !== null) || 
            (typeAction === 'deleteGroupUser' && `${item.user_id}` !== USER_ID)) {
            let divUser = document.createElement('div');
            divUser.classList.add('div-user');
            divUser.setAttribute('id', 'divuser_' + `${item.id}`);
            divAddUsers.appendChild(divUser);
            let divUserAvatar = document.createElement('div');
            divUser.appendChild(divUserAvatar);
            let imgUserAvatar = document.createElement('img');
            let image = item.avatar !== null ? URL + '/avatars/' + item.avatar : URL + '/img/avatar_0.jpg';
            imgUserAvatar.src = image;
            imgUserAvatar.alt = 'Аватар';
            imgUserAvatar.width = '40';
            divUserAvatar.appendChild(imgUserAvatar);
            let divUserNickname = document.createElement('div');
            divUserNickname.classList.add('div-user-nickname');
            divUser.appendChild(divUserNickname);
            let pUserNickname = document.createElement('p');
            divUserNickname.appendChild(pUserNickname);
            pUserNickname.textContent = item.nickname;
            if (item.hideemail === 0) {
                let pUserEmail = document.createElement('p');
                divUserNickname.appendChild(pUserEmail);
                pUserEmail.textContent = item.email;
            }
            // при клике на пользователе
            // если добавление в личный список вызываем функцию добавления пользователя в список своих контактов
            if (typeAction === 'addUserToPrivate') {
                divUser.onclick = () => { addUserToPrivate(USER_ID, item.id, item.email, item.nickname, item.avatar); };
                // если добавление в группу вызываем функцию добавления пользователя в группу
            } else if (typeAction === 'addUserToGroup') {
                let nickname = ''
                item.nickname === null ? nickname = item.email : nickname = item.nickname;
                divUser.onclick = () => { addUserToGroup(result.group_id, item.contact_user_id, nickname, result.group_name); };
                // если удаляем пользователя из группы (при выводе списка пользователей группы)
            } else if (typeAction === 'deleteGroupUser') {
                let nickname = ''
                item.nickname === null ? nickname = item.email : nickname = item.nickname;
                divDeleteGroupUser = document.createElement('div');
                divDeleteGroupUser.classList.add('div-delete-group-user');
                let spanDeleteGroupUser = document.createElement('span');
                spanDeleteGroupUser.classList.add('span-delete-group-user');
                spanDeleteGroupUser.setAttribute('id', 'spandeletegroupuser');
                spanDeleteGroupUser.setAttribute('title', 'Удалить пользователя из группы');
                divDeleteGroupUser.appendChild(spanDeleteGroupUser);
                divUser.appendChild(divDeleteGroupUser);
                spanDeleteGroupUser.onclick = () => { deleteGroupUser(item.id, item.user_id, result.group_id, nickname, result.group_name); };
            }
        }
    });
}

// функция добавления пользователя в контакты
function addUserToPrivate(user_id, contact_user_id, email, nickname, avatar) {
    // проверяем есть ли пользователя в списке контактов
    if (!document.getElementById(contact_user_id)) {
        // вызываем функцию добавления контакта в левую панель
        addContactIntoSidebar(user_id, contact_user_id, email, nickname, avatar)
        // если пользователь активен, то потом будем отправлять ему сообщение о добавлении его в контаты
        to = Object.keys(connectedUsers).find(key => connectedUsers[key] === contact_user_id.toString());
        message = JSON.stringify({
            command: 'addedToContacts',
            to: to,
            send_user_id: user_id,
            send_nickname: USER_NICKNAME,
            accept_user_id: contact_user_id
        });
        WS.send(message);
        // проверяем активен ли сейчас добавленный пользователь
        Object.values(connectedUsers).forEach(async value => {
            // если пользователь соединен с сервером выделяем его цветом
            if (parseInt(value) === parseInt(contact_user_id)) {
                document.getElementById(value).classList.add('div-chat-user-onchat');
            }
        });
    } else {
        // выводим сообщение, что данный пользователь уже в списке чатов
        alertMessage(`Пользователь ${nickname ? nickname : email}  уже в списке чатов`);
    }
}

// функция добавления пользователя в группу
function addUserToGroup(group_id, contact_user_id, nickname, group_name) {
    // если пользователь активен, то потом будем отправлять ему сообщение о добавлении его в группу
    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === contact_user_id.toString());
    message = JSON.stringify({
        command: 'addedToGroup',
        to: to,
        group_id: group_id,
        group_name: group_name,
        send_user_id: USER_ID,
        send_nickname: USER_NICKNAME,
        accept_user_id: contact_user_id,
        accept_nickname: nickname
    });
    WS.send(message);
}

// функция создания элемента контакта в левой панели
function addContactIntoSidebar(user_id, contact_user_id, email, nickname, avatar) {
    // добавляем пользователя в свои контакты
    let divChatUser = document.createElement('div');
    divChatUser.classList.add('div-chat-user');
    divChatUser.setAttribute('id', contact_user_id);
    DIV_USER_CHATS.appendChild(divChatUser);
    let divChatUserAvatar = document.createElement('div');
    divChatUser.appendChild(divChatUserAvatar);
    let imgChatUserAvatar = document.createElement('img');
    let image = avatar !== null ? URL + '/avatars/' + avatar : URL + '/img/avatar_0.jpg';
    imgChatUserAvatar.src = image;
    imgChatUserAvatar.alt = 'Аватар';
    imgChatUserAvatar.width = '35';
    divChatUserAvatar.appendChild(imgChatUserAvatar);
    let divChatUserNickname = document.createElement('div');
    divChatUserNickname.classList.add('div-user-nickname');
    divChatUser.appendChild(divChatUserNickname);
    let pChatUser = document.createElement('p');
    nickname ? pChatUser.textContent = nickname : pChatUser.textContent = email;
    divChatUserNickname.appendChild(pChatUser);
}

// функция создания элемента группы в левой панели
function addGroupIntoSidebar(group_id, group_name) {
    // проверяем если ли див добавления групп
    if (!document.querySelector('#divusergroups')) {
        // создаем див контейнер
        let divUserGroups = document.createElement('div');
        divUserGroups.classList.add('div-user-groups');
        divUserGroups.setAttribute('id', 'divusergroups');
        document.querySelector('#sidebarleft').appendChild(divUserGroups);
        // уменьшаем область пользователей
        DIV_USER_CHATS.style.height = '45%';
    }
    // создаем элемент группы
    let divUserGroup = document.createElement('div');
    divUserGroup.classList.add('div-chat-group');
    divUserGroup.setAttribute('id', group_id);
    let divGroupAvatar = document.createElement('div');
    let imgGroupAvatar = document.createElement('img');
    imgGroupAvatar.src = URL + '/img/group.jpg';
    imgGroupAvatar.alt = 'Аватар';
    imgGroupAvatar.width = '35';
    divGroupAvatar.appendChild(imgGroupAvatar);
    divUserGroup.appendChild(divGroupAvatar);
    let divUserGroupName = document.createElement('div');
    divUserGroupName.classList.add('div-user-nickname');
    divUserGroup.appendChild(divUserGroupName);
    let pUserGroup = document.createElement('p');
    pUserGroup.textContent = group_name;
    divUserGroupName.appendChild(pUserGroup);
    let divUserGroups = document.querySelector('#divusergroups');
    divUserGroups.appendChild(divUserGroup);
}

// функция проверки и вывода сообщений
function showMessage(data, chatType) {
    // console.log(data);
    if (chatType === 'private') {
        contactId = data.send_user_id;
        contactName = data.send_nickname;
    } else if (chatType === 'group') {
        contactId = data.group_id;
        contactName = data.group_name;
    }
    // если открыт список добавления пользователей или создание группы, то выделяем пользователя цветом 
    // (от пользователя пришло сообщение)
    if (document.querySelector('#divaddusers') || document.querySelector('#divcreategroup')) {
        document.getElementById(contactId).classList.add('div-chat-user-onmessage');
    } else {
        // проверяем если есть открытый чат
        if (document.querySelector('.div-user-messages')) {
            // проверяем если открытый чат с пользователем от которого пришло сообщение, то выводим сообщение
            if (document.querySelector('.div-user-messages').id === contactName) {
                let divUserMessages = document.getElementById(contactName);
                // выводим принятое сообщение
                outputMessage(divUserMessages, data, chatType);
                // проверяем отключено или включено оповещение для этого пользователя
                // если включено, то воспроизводим звук  
                !document.getElementById(contactId).classList.contains('div-chat-user-without-notice') ? NOTICE.play() : null;
                // если у пользователя открыт чат и приходит сообщение от другого пользователя, 
                // то выделяем пользователя цветом (от пользователя пришло сообщение)
            } else if (document.querySelector('.div-user-messages').id !== contactName) {
                document.getElementById(contactId).classList.add('div-chat-user-onmessage');
            }
            // если нет открытых чатов, то создаем его с тем от кого пришло сообщение и выводим текст
        } else {
            // проверяем отключено или нет оповещение для этого пользователя
            // если включено, то не открываем чат и не воспроизводим звук, 
            // выделяем пользователя цветом (от пользователя пришло сообщение)
            if (document.getElementById(contactId).classList.contains('div-chat-user-without-notice')) {
                document.getElementById(contactId).classList.add('div-chat-user-onmessage');
            } else {
                // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя
                createDivUserMessages(contactName, chatType);
                // выводим ранние сообщения из БД
                // готовим данные для отправки на бэкенд
                if (chatType === 'private') {
                    data = {
                        action: 'getUserMessages',
                        send_user_id: USER_ID,
                        accept_user_id: contactId,
                        chat_type: 'private'
                    };
                } else if (chatType === 'group') {
                    data = {
                        action: 'getUserMessages',
                        send_user_id: USER_ID,
                        accept_group_id: contactId,
                        chat_type: 'group'
                    };
                }
                // отправляем запрос на бэкенд для загрузки ранних сообщений и выводим сообщения
                getUserMessages(data, chatType);
                // воспроизводим звук
                NOTICE.play();
                // имитируем клик на пользователе от которого пришло сообщение для возможности отправки ему сообщений
                document.getElementById(contactId).click();
            }
        }
    }
}

// функция вывода информационных сообщений
function alertMessage(message) {
    let pAlert = document.createElement('p');
    pAlert.setAttribute('id', 'alert');
    DIV_ALERT.appendChild(pAlert);
    pAlert.textContent = message;
    // убираем надпись по таймеру (3 секунды)
    setTimeout(() =>
        pAlert.remove(), 3000
    );
}

// функция создания дива для отображения сообщений
function createDivUserMessages(divId, chatType) {
    let divUserMessages = document.createElement('div');
    divUserMessages.classList.add('div-user-messages');
    divUserMessages.setAttribute('id', divId);
    MAIN_WINDOW.appendChild(divUserMessages);
    let divUserMessagesHeader = document.createElement('div');
    divUserMessagesHeader.classList.add('div-user-messages-header');
    divUserMessages.appendChild(divUserMessagesHeader);
    let spanChatName = document.createElement('span');
    spanChatName.classList.add('span-chat-name');
    spanChatName.setAttribute('id', 'spanchatname');
    chatName = chatType === 'private' ? `Чат с пользователем ${divId}` : `Групповой чат ${divId}`;
    spanChatName.textContent = chatName;
    divUserMessagesHeader.appendChild(spanChatName);
    let spanChatClose = document.createElement('span');
    spanChatClose.classList.add('span-chat-close');
    spanChatClose.setAttribute('id', 'spanchatclose');
    spanChatClose.setAttribute('title', 'Закрыть чат');
    divUserMessagesHeader.appendChild(spanChatClose);
}

// функция вывода сообщений
// !!! везде где пересылается сообщение надо использовать именно id, а не message_id,
// потому, что из БД сообщения загружаются и ввыводятся по id
function outputMessage(location, message, chatType) {
    // console.log(message);
    parseInt(message.send_user_id) === parseInt(USER_ID) ? type = 'send' : type = 'accept';
    let divMessage = document.createElement('div');
    divMessage.classList.add(`div-${type}-message`);
    divMessage.setAttribute('id', message.id);
    // location.appendChild(divMessage);
    let divSenderName = document.createElement('div')
    if (chatType === 'group') {
        divSenderName.classList.add(`div-info-message`);
        if (message.send_nickname) {
            let senderNickname = message.send_nickname;
            divSenderName.textContent = senderNickname;
        } else {
            let senderNickname = message.nickname !== null ? message.nickname : message.email;
            divSenderName.textContent = senderNickname;
        }
    }
    let divTextMessage = document.createElement('div');
    divTextMessage.classList.add(`div-text-message`);
    let divDateTimeMessage = document.createElement('div');
    divDateTimeMessage.classList.add(`div-datetime-message`);
    divTextMessage.textContent = message.text_message;
    dateTimeCreate = new Date(message.created);
    divDateTimeMessage.textContent = dateTimeCreate.toLocaleTimeString("ru-RU") + ' ' + dateTimeCreate.toLocaleDateString("ru-RU");
    let divInfoMessage = document.createElement('div')
    divInfoMessage.classList.add(`div-info-message`);
    divInfoMessage.textContent = message.status_message;
    divMessage.append(divSenderName, divTextMessage, divDateTimeMessage, divInfoMessage);
    location.appendChild(divMessage);
    location.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

// функция загрузки из БД и вывода сообщений пользователя
async function getUserMessages(data, chatType) {
    // console.log(data);
    try {
        let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        });
        let result = await response.json();
        // console.log('Успех: ', result);

        // выводим ранние сообщения пользователя
        result.forEach((item) => {
            let divUserMessages = document.querySelector('.div-user-messages');
            // вызываем функцию вывода сообщений
            outputMessage(divUserMessages, item, chatType);
        });
    } catch (error) {
        console.log('Ошибка: ', error);
    }
}

// функция удаления пользователя из группы
function deleteGroupUser(contact_id, user_id, group_id, nickname, group_name) {
    // console.log(e.target.id);
    // удаляем пользователя из группы и послаем сообщение пользователям об этом
    WS.send(JSON.stringify({
        command: 'deleteGroupUser',
        group_id: group_id,
        group_name: group_name,
        contact_id: contact_id,
        user_id: user_id,
        user_nickname: nickname,
        send_user_id: USER_ID,
        send_nickname: USER_NICKNAME
    }))
}