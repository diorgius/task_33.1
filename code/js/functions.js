// функция добавления пользователя в список своих контактов
// так же !!! НАДО !!! добавлять и себя у пользователя которого добавил
// что бы можно было начать переписку, если пользователь активный, то
// надо у него выводить в списке контактов себя и отпралять сообщения,
// что его добавили в свои контакты,
// если пользователь не активный, то просто делать запись в БД о том, что
// его добавили в контакты, а при перезагрузке страницы контакт у него добавиться и 
// будет получено сообщение об его добавлении

async function addUser(userId, contactUserId, email, nickname, avatar, hideemail, contactAddition = false) {
    if (!document.getElementById(contactUserId)) {
        // отправляем данные на бэкенд для записи в БД
        data = {
            action: 'createContact',
            'userId': userId,
            'contactUserId': contactUserId
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

            // добавляем пользователя в боковую панель
            let divChatUser = document.createElement('div');
            divChatUser.classList.add('div-chat-user');
            divChatUser.setAttribute('id', contactUserId);
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
            divChatUserNickname.appendChild(pChatUser);
            nickname ? pChatUser.textContent = nickname : pChatUser.textContent = email;


            // если пользователь соединен с сервером выделяем его
            Object.values(connectedUsers).forEach(value => {
                // console.log(value);
                if (parseInt(value) === parseInt(contactUserId)) {
                    document.getElementById(value).classList.add('div-chat-user-onchat');
                    return;
                }

                // при добавлении контакта вместе с записью в БД о своем новом контакте
                // делаем запись и себя в его контакты,
                // теперь надо проверить если добавленный контакт активен,
                // то у него также добавить себя в список контактов и отправить ему
                // информационное сообщение об этом, если не активен, то просто в БД
                // создаем сообщение о добавлении его в контакты, которое он увидит при подключении к чату

                // проверяем, что признак инициации добавления контакта ПОЛЬЗОВАТЕЛЕМ (через клик), а не автоматическое добавление
                // инициированное добавлением контакта, что бы не запускалось добавление контактов по кругу
                // при вызове из main.js по клику ставим contactAddition = true, а при вызове из messenger.js
                // когда функция addUser запускается после отпраки нижеидущего сообщения, то ставим false 
                if (contactAddition) {
                    // console.log(connectedUsers);
                    // console.log(contactUserId);
                    
                    // готовим и отправляем сообщение пользователю о том, что его присоединили
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === contactUserId.toString());
                    console.log(to);
                    // textSendMessage = `Вас добавил(а) в свои контакты пользователь ${USER_NICKNAME}`;
                    message = JSON.stringify({
                        command: 'addedToContacts',
                        to: to,
                        accept_user_id: contactUserId,
                        send_user_id: userId,
                        // send_nickname: USER_NICKNAME,
                        // text_message: textSendMessage
                    });
                    WS.send(message);
                }
            })




        } catch (error) {
            console.log('Ошибка: ', error);
        }
    } else {
        // выводим сообщение, что данный пользователь уже в списке чатов
        alertMessage(`Пользователь ${nickname ? nickname : email}  уже в списке чатов`);
    }
}

// функция вывода информационных сообщений
function alertMessage(msg) {
    let pAlert = document.createElement('p');
    pAlert.setAttribute('id', 'alert');
    DIV_ALERT.appendChild(pAlert);
    pAlert.textContent = msg;
    // убираем надпись по таймеру (3 секунды)
    setTimeout(() =>
        pAlert.remove(), 3000
    );
}

// функция создания дива для отображения сообщений
function createDivUserMessages(divId) {
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
    spanChatName.textContent = `Чат с пользователем ${divId}`;
    divUserMessagesHeader.appendChild(spanChatName);
    let spanChatClose = document.createElement('span');
    spanChatClose.classList.add('span-chat-close');
    spanChatClose.setAttribute('id', 'spanchatclose');
    spanChatClose.setAttribute('title', 'Закрыть чат');
    divUserMessagesHeader.appendChild(spanChatClose);
}

// функция вывода сообщений
function outputMessage(location, msg) {
    // console.log(msg);
    parseInt(msg.send_user_id) === parseInt(USER_ID) ? type = 'send' : type = 'accept';
    let divMessage = document.createElement('div');
    divMessage.classList.add(`div-${type}-message`);
    divMessage.setAttribute('id', msg.id);
    let divTextMessage = document.createElement('div');
    divTextMessage.classList.add(`div-text-message`);
    let divDateTimeMessage = document.createElement('div');
    divDateTimeMessage.classList.add(`div-datetime-message`);
    divTextMessage.textContent = msg.text_message;
    dateTimeCreate = new Date(msg.created);
    divDateTimeMessage.textContent = dateTimeCreate.toLocaleTimeString("ru-RU") + ' ' + dateTimeCreate.toLocaleDateString("ru-RU");
    let divInfoMessage = document.createElement('div')
    divInfoMessage.classList.add(`div-info-message`);
    divInfoMessage.textContent = msg.status_message;
    location.appendChild(divMessage);
    divMessage.append(divTextMessage, divDateTimeMessage, divInfoMessage);
    location.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

async function getUserMessages(data) {
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
            outputMessage(divUserMessages, item);
        });
    } catch (error) {
        console.log('Ошибка: ', error);
    }
}