const BUTTON_ADD_USER = document.querySelector('#btnadduser');
const BUTTON_CREATE_GROUP = document.querySelector('#btncreategroup');
const DIV_LIST_USERS = document.querySelector('#divlistusers');
const DIV_USER_CHATS = document.querySelector('#divuserchats');
const MAIN_WINDOW = document.querySelector('#mainwindow');
const TEXT_AREA_MESSAGE = document.querySelector('#textsendmessage');
const USER_ID = document.querySelector('.div-user-avatar').id;
const USER_NICKNAME = document.querySelector('.p-nickname').innerText;

// маштабируем текстовую область сообщений
let actions = ['input', 'cut', 'paste', 'drop', 'onchange'];
if (TEXT_AREA_MESSAGE) {
    actions.forEach((e) => {
        TEXT_AREA_MESSAGE.addEventListener(e, () => {
            TEXT_AREA_MESSAGE.style.height = 'auto';
            TEXT_AREA_MESSAGE.style.height = TEXT_AREA_MESSAGE.scrollHeight + 'px';
        });
    });
}

// выводим список пользователей для добавления в свои контакты
if (BUTTON_ADD_USER) {
    BUTTON_ADD_USER.addEventListener('click', async () => {
        // если список уже выведен  - убираем его и меняем надпись на кнопке
        if (document.querySelector('#divaddusers')) {
            BUTTON_ADD_USER.textContent = 'Добавить пользователей';
            document.querySelector('#divaddusers').remove();
        } else {
            // меняем надпись на кнопке
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // если открыто окно создание группы - убираем его
            if (document.querySelector('#divcreategroup')) {
                BUTTON_CREATE_GROUP.textContent = 'Создать группу';
                document.querySelector('#divcreategroup').remove();
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
            // отправляем запрос в БД, получаем список пользователей
            data = { action: 'getAllUsers' };
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

                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция добавления пользователя                
                showUsersList(result, 'addUserToPrivate');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    });
}

if (BUTTON_CREATE_GROUP) {
    BUTTON_CREATE_GROUP.addEventListener('click', () => {
        // если уже вывено окно создания группы - убираем его и меняем надпись на кнопке
        if (document.querySelector('#divcreategroup')) {
            BUTTON_CREATE_GROUP.textContent = 'Создать группу';
            document.querySelector('#divcreategroup').remove();
        } else {
            // меняем надпись на кнопке
            BUTTON_CREATE_GROUP.textContent = 'Убрать создание группы';
            // если открыто окно добавления пользователей - убираем его
            if (document.querySelector('#divaddusers')) {
                document.querySelector('#divaddusers').remove();
                BUTTON_ADD_USER.textContent = 'Добавить пользователей';
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
            // добавляем окно создания группы
            document.querySelector('#divwrappercreategroup').innerHTML =
                `<div class="div-create-group" id="divcreategroup">
                <div class="div-create-group-header" id="divcreategroupheader">
                    <p>Создание группового чата</p>
                </div>
                <label for="inputgroupname">Введите название группы</label>
                <input class="input-group-name" type="text" id="inputgroupname" name="inputgroupname" />
                <button class="btn-add" id="btnaddgroup" name="btnaddgroup">Создать</button>
            </div>`;
            let inputGroupName = document.querySelector('#inputgroupname');
            // проверяем уникальность имени группы
            inputGroupName.onchange = (e) => { validation(e) }
            const BUTTON_ADD_GROUP = document.querySelector('#btnaddgroup');
            // ловим нажатие кнопки создания группы
            BUTTON_ADD_GROUP.onclick = async () => {
                let inputGroupName = document.querySelector('#inputgroupname');
                if (inputGroupName.value === '') {
                    alertMessage('Введите название группы');
                } else {
                    // отправляем данные в БД для записи
                    data = {
                        action: 'createGroup',
                        group_name: inputGroupName.value,
                        creator: USER_ID
                    };
                    try {
                        let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(data)
                        });
                        let result = await response.text();
                        // console.log('Успех: ', result);

                        // вызываем функцию создания элемента группы в левой панели
                        addGroupIntoSidebar(result, inputGroupName.value);
                        // убираем окно создания группы
                        document.querySelector('#divcreategroup').remove();
                        BUTTON_CREATE_GROUP.textContent = 'Создать группу';
                    } catch (error) {
                        console.log('Ошибка: ', error);
                    }
                }
            }
        }
    });
}

// обрабатываем меню по клику правой кнопки 
window.oncontextmenu = (e) => {
    // выводим контекстное меню на пользователях чата
    if (e.target.classList.contains('div-chat-user')) {
        e.preventDefault();
        // если открыто меню сообщения, убираем его
        document.querySelector('.ul-message-menu') ? document.querySelector('.ul-message-menu').style.display = 'none' : null;
        // если открыто меню пользователей для пересылки, убираем его
        document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
        // если открыто меню группы, убираем его
        document.querySelector('.ul-chat-group-menu') ? document.querySelector('.ul-chat-group-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu');
        CHAT_USER_MENU.style.display = 'block';
        // меняем позицию, чтобы меню выводилось вверх от курсора
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight;
        CHAT_USER_MENU.style.top = positionY + 'px';
        CHAT_USER_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatUserActive = document.querySelector('.div-chat-active');
        divChatUserActive !== null ? divChatUserActive.classList.remove('div-chat-active') : null;
        e.target.classList.add('div-chat-active');

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotificationuser');
        offNotification.onclick = () => {
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotificationuser');
        onNotification.onclick = () => {
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
        }

        // удаляем переписку с пользователем
        let deleteUserChats = document.querySelector('#deleteuserchats');
        deleteUserChats.onclick = () => {
            // отправляем сообщение в сокет для удаления всей переписки с пользователем и
            // если пользователь активен отправляем сообщение пользователю, что переписка удалена
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
            WS.send(JSON.stringify({
                command: 'deleteAllMessages',
                user_id: e.target.id,
                to: to,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
            // если открыт чат с удаленным пользователем, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // выводим сообщение, что переписка удалена
            alertMessage(`Вся переписка с пользователем ${e.target.innerText} удалена`);
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';

        }

        // удаляем пользователя из списка контактов с удалением всей переписки и удаляем у него свой контакт
        let deleteChatUser = document.querySelector('#deletechatuser');
        deleteChatUser.onclick = () => {
            // отправляем сообщение в сокет для удаления контакта пользователя и
            // если пользователь активен отправляем сообщение пользователю, что его контакт удален
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
            WS.send(JSON.stringify({
                command: 'deleteContact',
                user_id: e.target.id,
                to: to,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
            // если открыт чат с удаленным пользователем, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // выводим сообщение, что данный пользователь удален из списка контактов
            alertMessage(`Пользователь ${e.target.innerText} удален из списка контактов`);
            // удаляем пользователя из списка контактов
            document.getElementById(e.target.id) ? document.getElementById(e.target.id).remove() : null;
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';

        }
    }

    // выводим контекстное меню на группе
    if (e.target.classList.contains('div-chat-group')) {
        e.preventDefault();
        // если открыто меню сообщения, убираем его
        document.querySelector('.ul-message-menu') ? document.querySelector('.ul-message-menu').style.display = 'none' : null;
        // если открыто меню пользователей для пересылки, убираем его
        document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
        // если открыто меню пользователя, убираем его
        document.querySelector('.ul-chat-user-menu') ? document.querySelector('.ul-chat-user-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-group-menu');
        CHAT_USER_MENU.style.display = 'block';
        // меняем позицию, чтобы меню выводилось вверх от курсора
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight;
        CHAT_USER_MENU.style.top = positionY + 'px';
        CHAT_USER_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatGroupActive = document.querySelector('.div-chat-active');
        divChatGroupActive !== null ? divChatGroupActive.classList.remove('div-chat-active') : null;
        e.target.classList.add('div-chat-active');

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotificationgroup');
        offNotification.onclick = () => {
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotificationgroup');
        onNotification.onclick = () => {
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
        }

        // добавляем пользователя в группу
        let addGroupChatUser = document.querySelector('#addgroupchatuser');
        addGroupChatUser.onclick = async () => {
            // вызываем функцию закрытия окон
            closeWindow();
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // делаем запрос в БД на получение контактов пользователя
            data = {
                action: 'getUserContacts',
                user_id: USER_ID
            }
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

                // добавляем id группы
                result.group_id = e.target.id;
                // добавляем имя группы
                result.group_name = e.target.innerText;
                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция добавления пользователя
                showUsersList(result, 'addUserToGroup');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // выводим список группы
        let showGroupUsers = document.querySelector('#showgroupchatuser');
        showGroupUsers.onclick = async () => {
            // вызываем функцию закрытия окон
            closeWindow();
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // делаем запрос в БД на получение списка пользователей группы
            data = {
                action: 'getUserGroupContacts',
                user_id: USER_ID,
                contact_group_id: e.target.id
            }
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

                // добавляем id группы
                result.group_id = e.target.id;
                // добавляем имя группы
                result.group_name = e.target.innerText;
                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция удаления пользователя
                showUsersList(result, 'deleteGroupUser');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // покидаем группу
        let leaveGroup = document.querySelector('#leavegroupchatuser');
        leaveGroup.onclick = () => {
            // покидаем группу и послаем сообщение пользователям об этом
            WS.send(JSON.stringify({
                command: 'leaveGroup',
                group_id: e.target.id,
                group_name: e.target.innerText,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
        }

        // удаляем группу
        let deleteGroup = document.querySelector('#deletegroup');
        deleteGroup.onclick = () => {
            // удаляем группу и послаем сообщение пользователям группы об ее удалении
            WS.send(JSON.stringify({
                command: 'deleteGroup',
                group_id: e.target.id,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME,
                group_name: e.target.innerText
            }))
            // если открыт чат с удаленной группой, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
        }
    }

    // выводим контекстное меню на сообщении
    if (e.target.classList.contains('div-send-message')
        || e.target.classList.contains('div-accept-message')) {
        e.preventDefault();
        // если открыто меню пользователя, убираем его
        document.querySelector('.ul-chat-user-menu') ? document.querySelector('.ul-chat-user-menu').style.display = 'none' : null;
        // если открыто меню пользователей для пересылки, убираем его
        document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
        // если открыто меню группы, убираем его
        document.querySelector('.ul-chat-group-menu') ? document.querySelector('.ul-chat-group-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_MESSAGE_MENU = document.querySelector('.ul-message-menu');
        CHAT_MESSAGE_MENU.style.display = 'block';
        // меняем позицию, чтобы меню выводилось вверх от курсора
        positionY = e.pageY - CHAT_MESSAGE_MENU.offsetHeight;
        CHAT_MESSAGE_MENU.style.top = positionY + 'px';
        CHAT_MESSAGE_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом сообщении
        let divMessageActive = document.querySelector('.div-message-active');
        divMessageActive !== null ? divMessageActive.classList.remove('div-message-active') : null;
        e.target.classList.add('div-message-active');

        // удаляем выбранное сообщение
        let deleteMessage = document.querySelector('#deletemessage');
        deleteMessage.onclick = () => {
            // определяем тип чата
            document.querySelector('.div-chat-active').classList.contains('div-chat-user') ? chatType = 'private' : chatType = 'group';
            // получаем id пользователя/группы
            let chatId = document.querySelector('.div-chat-active').id;
            // получаем название чата
            chatType === 'private' ? chatName = USER_NICKNAME : chatName = document.querySelector('.div-user-messages').id;
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatId);
            message = JSON.stringify({
                command: 'deleteMessage',
                id: e.target.id,
                to: to,
                accept_id: chatId,
                accept_name: chatName,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME,
                status_message: `the message was deleted by ${USER_NICKNAME}`,
                chat_type: chatType
            });
            // отправляем сообщение пользователю, для удаления у него удаленного сообщения и удаления из БД
            WS.send(message);
            // выводим сообщение, что сообщение удалено
            e.target.childNodes[1].textContent = 'Сообщение удалено';
            // выводим пометку на сообщении
            e.target.lastChild.textContent = `the message was deleted by ${USER_NICKNAME}`;
            e.target.classList.remove('div-message-active');
            DELETEMESSAGE.play();
        }

        // редактируем выбранное сообщение
        let editMessage = document.querySelector('#editmessage');
        editMessage.onclick = () => {
            // выводим текст сообщения в текстовую область для редактирования
            TEXT_AREA_MESSAGE.value = e.target.childNodes[1].innerText;
            // убираем выделение сообщения
            document.getElementById(e.target.id).classList.remove('div-message-active');
            // отправка измененного сообщения
            const MESSAGE_SEND = document.querySelector('#sendmessage');
            // определяем тип чата
            document.querySelector('.div-chat-active').classList.contains('div-chat-user') ? chatType = 'private' : chatType = 'group';
            // получаем id пользователя/группы
            let chatId = document.querySelector('.div-chat-active').id;
            // получаем название чата
            chatType === 'private' ? chatName = USER_NICKNAME : chatName = document.querySelector('.div-user-messages').id;
            MESSAGE_SEND.onclick = () => {
                let textSendMessage = TEXT_AREA_MESSAGE.value;
                // проверить не пусто ли сообщение
                if (textSendMessage === '') {
                    alertMessage('Введите текст сообщения');
                } else {
                    TEXT_AREA_MESSAGE.value = '';
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatId);
                    message = JSON.stringify({
                        command: 'editMessage',
                        id: e.target.id,
                        to: to,
                        accept_id: chatId,
                        accept_name: chatName,
                        send_user_id: USER_ID,
                        send_nickname: USER_NICKNAME,
                        text_message: textSendMessage,
                        status_message: `the message was edited by ${USER_NICKNAME}`,
                        chat_type: chatType
                    });
                    WS.send(message);
                    TEXT_AREA_MESSAGE.focus();
                    // выводим текст измененного сообщение
                    e.target.childNodes[1].textContent = textSendMessage;
                    // делаем пометку на сообщении
                    e.target.lastChild.textContent = `the message was edited by ${USER_NICKNAME}`;
                    e.target.classList.remove('div-message-active');
                }
            }
        }

        // пересылаем выбранное сообщение
        let forwardMessage = document.querySelector('#forwardmessage');
        forwardMessage.onclick = async (event) => {
            // если открыто меню пользователей для пересылки, убираем его
            document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
            // делаем запрос в БД на получение списка контактов пользователя для пересылки сообщения
            data = {
                action: 'getUserContactsAndGroups',
                user_id: USER_ID
            }
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

                // выводим список контактов
                let sectionMain = document.querySelector('#mainwindow');
                let ulChatUsers = document.createElement('ul');
                ulChatUsers.classList.add('ul-users-menu');
                ulChatUsers.setAttribute('id', 'ulforwardmessagemenu')
                let divUserMessages = document.querySelector('.div-user-messages');
                result.contacts.forEach((item) => {
                    // если это контакт с которым открыт чат, не выводим этот контакт для пересылки
                    if (divUserMessages.id !== item.nickname && divUserMessages.id !== item.email) {
                        // выводим список пользователей
                        let liChatUser = document.createElement('li');
                        liChatUser.classList.add('li-users-menu');
                        let spanUserNickname = document.createElement('span');
                        spanUserNickname.classList.add('span-forward-user');
                        spanUserNickname.textContent = item.nickname !== null ? item.nickname : item.email;
                        let spanCheckbox = document.createElement('span');
                        spanCheckbox.classList.add('span-forward-user');
                        let checkbox = document.createElement('input');
                        checkbox.classList.add('checkbox-forward-user');
                        checkbox.setAttribute('type', 'checkbox');
                        checkbox.setAttribute('id', item.contact_user_id);
                        checkbox.setAttribute('name', 'private');
                        checkbox.setAttribute('value', item.nickname !== null ? item.nickname : item.email);
                        spanCheckbox.appendChild(checkbox);
                        liChatUser.append(spanUserNickname, spanCheckbox);
                        ulChatUsers.appendChild(liChatUser);
                    }
                });
                result.groups.forEach((item) => {
                    // если это контакт с которым открыт чат, не выводим этот контакт для пересылки
                    if (divUserMessages.id !== item.group_name) {
                        // выводим список групп
                        let liChatUser = document.createElement('li');
                        liChatUser.classList.add('li-users-menu');
                        let spanUserNickname = document.createElement('span');
                        spanUserNickname.classList.add('span-forward-user');
                        spanUserNickname.textContent = item.group_name;
                        let spanCheckbox = document.createElement('span');
                        spanCheckbox.classList.add('span-forward-user');
                        let checkbox = document.createElement('input');
                        checkbox.classList.add('checkbox-forward-user');
                        checkbox.setAttribute('type', 'checkbox');
                        checkbox.setAttribute('id', item.contact_group_id);
                        checkbox.setAttribute('name', 'group');
                        checkbox.setAttribute('value', item.group_name);
                        spanCheckbox.appendChild(checkbox);
                        liChatUser.append(spanUserNickname, spanCheckbox);
                        ulChatUsers.appendChild(liChatUser);
                    }
                });
                // добавляем кнопку пересылки
                let btnForwardMessage = document.createElement('button');
                btnForwardMessage.setAttribute('id', 'btnforwardmessage');
                btnForwardMessage.classList.add('btn-forward-message');
                btnForwardMessage.textContent = 'Переслать';
                ulChatUsers.append(btnForwardMessage);
                // выводим меню
                sectionMain.append(ulChatUsers);
                ulChatUsers.style.display = 'block';
                // если позиция на эране меньше половины экрана, то выводим меню вниз
                if (event.clientY < 500) {
                    ulChatUsers.style.top = `${event.clientY}px`;
                    // иначе выводим меню вверх
                } else {
                    positionY = event.clientY - ulChatUsers.offsetHeight;
                    ulChatUsers.style.top = positionY + 'px';
                }
                ulChatUsers.style.left = `${event.clientX}px`;
                // обрабатываем пересылку сообщения
                btnForwardMessage.onclick = async () => {
                    // получаем отмеченные чекбоксы
                    let checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                    // записываем их в массив
                    let usersToForward = Array.from(checkedCheckboxes).map(checkbox => checkbox.id);
                    // определяем тип пересылки пользователь/группа
                    // записываем в массив имя чекбокса, по которому определяем для кого рассылка
                    let chatType = Array.from(checkedCheckboxes).map(checkbox => checkbox.name);
                    // определяем имя группы
                    // записываем в массив значение чекбокса, по которому определяем для какой группы рассылка
                    let acceptName = Array.from(checkedCheckboxes).map(checkbox => checkbox.value);
                    // отправляем данные в сокет для записи в БД и отправки сообщения
                    // активным пользователям из числа тех кому пересылается сообщение
                    // определяем от кого пересылаем
                    e.target.classList.contains('div-accept-message') ?
                        forwardUser = document.querySelector('.div-chat-active').lastElementChild.innerText :
                        forwardUser = USER_NICKNAME;
                    message = JSON.stringify({
                        command: 'forwardMessage',
                        id: e.target.id,
                        send_user_id: USER_ID,
                        users_to_forward: usersToForward,
                        send_nickname: USER_NICKNAME,
                        text_message: e.target.childNodes[1].innerText,
                        status_message: `the message forwarded from ${forwardUser}`,
                        chat_type: chatType,
                        accept_name: acceptName
                    });
                    WS.send(message);
                    // убираем контекстное меню
                    document.querySelector('.ul-message-menu').style.display = 'none';
                    document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
                }
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    }

    // убираем меню по клику в любом месте документа
    window.addEventListener('click', (elem) => {
        document.querySelector('.ul-chat-user-menu').style.display = 'none';
        document.querySelector('.ul-chat-group-menu').style.display = 'none';
        // если клики не на пункте меню или пользователе или чекбоксе, то убираем меню
        if (!elem.target.classList.contains('li-users-menu')
            && !elem.target.classList.contains('span-forward-user')
            && !elem.target.classList.contains('checkbox-forward-user')) {
            document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
            document.querySelector('.ul-message-menu').style.display = 'none';
        }
    });

    // убираем меню по клавише escape
    window.addEventListener('keydown', (press) => {
        if (press.key === 'Escape') {
            document.querySelector('.ul-chat-user-menu').style.display = 'none';
            document.querySelector('.ul-chat-group-menu').style.display = 'none';
            document.querySelector('.ul-message-menu').style.display = 'none';
            document.querySelector('#ulusersmenu') ? document.querySelector('#ulusersmenu').remove() : null;
        }
    });
}