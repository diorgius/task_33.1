// функция вывода списка пользователей и добавления пользователя в список контактов
function showUsersToAdd(result, typeOfAdding) {
    // console.log(result);
    let divAddUsers = document.createElement('div');
    DIV_LIST_USERS.appendChild(divAddUsers);
    divAddUsers.setAttribute('id', 'divaddusers');
    result.forEach((item) => {
        if (`${item.id}` !== USER_ID) {
            // console.log(item);
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
            if (typeOfAdding === 'addUserToPrivate') {
                divUser.onclick = () => { addUserToPrivate(USER_ID, item.id, item.email, item.nickname, item.avatar, item.hideemail, true); };
            // если добавление в группу вызываем функцию добавления пользователя в группу
            } else if ((typeOfAdding === 'addUserToGroup')) {
                // divUser.onclick = () => { addUserToGroup(USER_ID, item.id, item.email, item.nickname, item.avatar, item.hideemail, true); };
            }
        }
    });
}

// функция добавления пользователя в личный список
async function addUserToPrivate(userId, contactUserId, email, nickname, avatar, hideemail, contactAddition = false) {
    if (!document.getElementById(contactUserId)) {
        // отправляем данные на бэкенд для записи в БД и создания сообщения в БД о добавлении пользователя
        data = {
            action: 'createContact',
            user_id: userId,
            contact_user_id: contactUserId,
            text_message: `Вас добавил(а) в свои контакты пользователь ${USER_NICKNAME}`
        };
        try {
            // отправляем запрос на создание записей в БД только один раз,
            // но в методе создания производим сразу две записи и для своего контакта и у него 
            // записываем себя, а также создаем в БД информационное сообщение для этого пользователя
            // которое поступит ему сразу если пользователь активен или после его входа в чат
            // проверяем, что добавление запускается по клику
            if (contactAddition) {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.text();
                // console.log('Успехgit: ', result);
            }
            // добавляем пользователя в свои контакты
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
            nickname ? pChatUser.textContent = nickname : pChatUser.textContent = email;
            divChatUserNickname.appendChild(pChatUser);
            // проверяем активен ли сейчас добавленный пользователь
            Object.values(connectedUsers).forEach(async value => {
                // console.log(value);
                // если пользователь соединен с сервером выделяем его цветом
                if (parseInt(value) === parseInt(contactUserId)) {
                    document.getElementById(value).classList.add('div-chat-user-onchat');

                    // при добавлении контакта вместе с записью в БД о своем новом контакте
                    // делаем запись и себя в его контакты,
                    // теперь проверяем если добавленный контакт активен, то
                    // отправляем ему через сокет сообщение при получении которого запускается эта же 
                    // функция, которая добавляет ему контакт добавившего его пользователя
                    // информационное сообщение о добавлении его в контакты отправляется выше в этой же функции

                    // проверяем, что признак инициации добавления контакта ПОЛЬЗОВАТЕЛЕМ (через клик), а не автоматическое добавление
                    // инициированное добавлением контакта, что бы не запускалось добавление контактов по кругу
                    // при вызове из main.js по клику ставим contactAddition = true, а при вызове из messenger.js
                    // когда функция addUser запускается после отправки нижеидущего сообщения, то ставим false 
                    if (contactAddition) {
                        // готовим и отправляем сообщение пользователю о том, что его присоединили
                        to = Object.keys(connectedUsers).find(key => connectedUsers[key] === contactUserId.toString());
                        message = JSON.stringify({
                            command: 'addedToContacts',
                            to: to,
                            accept_user_id: contactUserId,
                            send_user_id: userId,
                        });
                        WS.send(message);
                    }
                    return;
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

