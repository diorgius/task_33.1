const BUTTON_ADD_USER = document.querySelector('#btnadduser');
const DIV_LIST_USERS = document.querySelector('#divlistusers');
const DIV_USER_CHATS = document.querySelector('#divuserchats');
const MAIN_WINDOW = document.querySelector('#mainwindow');
const TEXT_AREA_MESSAGE = document.querySelector('#textsendmessage');
if (document.querySelector('#userid')) {
    const USER_ID = document.querySelector('#userid').value;
}

// !!!TO DO
// !!!СДЕЛАНО 1. изменить добавление nickname, при регистрации не задавать nickname автоматически 
// (у разных почтовиков могут быть одинаковые nickname)
// только если пользователь сам его добавляет, при этом учитывать скрытие email, 
// если не задан nickname, то не давать возможность скрыть email
// при выводе списка пользователей и добавленных пользователей вывод nickname/email
//
// !!!СДЕЛАНО 2. разобраться с отправкой сообщений только выбранному пользователю и 
// при открытии чата задавать id divusermessages уникальным 
// (??? nickname? emai? id - уже нельзя, занят в списке добавленных пользоватей)
// !!! для дива задается id с ником или емайл(если нет ника)
// или как-то комбинировать, чтобы потом закрывать и открывать
// в зависимости от того с кем чат
//
// !!! СДЕЛАНО 3. если у пользователя нет открытого чата,
// активировать пользователя из списка контактов (имитировать клик), 
// активировать divusermessages писать в заголовке с кем чат (от кого пришло сообщение)
// и примать сообщения в него 
// 
// !!! СДЕЛАНО 4. если у пользователя уже открыт чат с другим пользователем
// выдать сообщение о приходе сообщения от другого пользователя (этот пользователь выделяется желтым цветом)
// ??? или просто делать оповещение в любом случае, а чат пусть пользователь открывает сам
//
// !!! СДЕЛАНО 5. запись сообщений в базу
//
// !!! СДЕЛАНО 6. при активации пользователя загружать из базы ранние сообщения от этого пользователя
//
// !!! СДЕЛАНО 6.1 при получение сообщения от другого пользователя когда открыт чат, при активации также загружать 
// направленные ему сообщения
//
// !!! СДЕЛАНО 7. выдавать звуковое оповещение о приходе сообщения 
// (воспроизводится только если пользователь повзаимодействовал со страницей)
//
// !!! СДЕЛАНО 8. вкл/выкл оповещения и отображение этого
//
// !!! ПОКА НЕ РАЗОБРАЛСЯ 9. проверить выделение бордером при левом клике после кликов правой кнопкой
//
// !!! СДЕЛАНО 10. добавить к сообщению дату и время отправки
//
// !!! СДЕЛАНО 11. добавить возможность закрытия чата
//
// 12. сделать автозапуск wsserver.php в контейнере
// 
// !!! СДЕЛАНО 13. 
//          (
//            // добавлена отправка сообщения самому себе после отправки сообщения адресату
//            // для того чтобы получить message_id из БД и дату и время сообщения
//            // для присвоения div id для однозначной идентификации
//            // сообщения и вывода даты и времени
//          )
//  как идентифицировать сообщение на стороне отправителя??? в момент его отправки???
// на стороне получателя мы при записе в базу получаем message_id и пересылаем его адресату
// уже с уникальным id, а на стороне отправителя??? id нет и как потом его идентифицировать
// если пользователь захочет его переслать???
// при открытии чата сообщения будут загружены из базы и тут проблем нет т.к. id будет
//
// !!! СДЕЛАНО 14. сделать удаление всей переписки с пользователем
// 14.1 при удалении пользователя из списка контактов ???надо ли удалять переписку с ним
//
// 15. удаление конкретного сообщения
//
// 16. редактирование сообщения
//
// 17. пересылка сообщения
//
// 18. создание группы и добавление пользователей в группу
// 
// 19. рассылка групповых сообщений
//
// 20. удаление пользователя из группы
// 
// 21. удаление группы ???только ее создателем


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
        if (document.querySelector('#divaddusers')) {
            BUTTON_ADD_USER.textContent = 'Добавить пользователей';
            document.querySelector('#divaddusers').remove();
        } else {
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
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
                        divUser.onclick = () => { addUser(USER_ID, item.id, item.email, item.nickname, item.avatar, item.hideemail); };

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
                    }
                });
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    });
}

// добавляем пользователя в список своих контактов
async function addUser(userId, contactUserId, email, nickname, avatar, hideemail) {
    if (!document.getElementById(contactUserId)) {
        // отправляем данные на бэкенд для записи в базу
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

// обрабатываем меню по клику правой кнопки 
window.oncontextmenu = (e) => {
    // выводим контекстное меню на пользователях чата
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e.target.id);
        e.preventDefault();
        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu');
        CHAT_USER_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_USER_MENU.style.top = positionY + 'px';
        CHAT_USER_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        // console.log(divChatUserActive);
        divChatUserActive !== null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
        e.target.classList.add('div-chat-user-active');

        // добавляем пользователя в групповой чат
        let addGroupChat = document.querySelector('#addgroupchat');
        addGroupChat.onclick = () => {
            // console.log(e.target.id);
            // здесь будем добавлять пользователя в групповой чат
        }

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotification');
        offNotification.onclick = () => {
            // console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.contains('div-chat-user-onchat') ? chatUserWithoutNotice.classList.remove('div-chat-user-onchat') : null;
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotification');
        onNotification.onclick = () => {
            // console.log(e.target.id);
            // console.log(connectedUsers);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
            Object.values(connectedUsers).forEach(value => {
                if (value === e.target.id) {
                    chatUserWithoutNotice.classList.add('div-chat-user-onchat');
                }
            })
        }

        // удаляем пользователя из списка чатов
        let deleteChatUser = document.querySelector('#deletechatuser');
        deleteChatUser.onclick = async () => {
            // console.log(e);
            // отправляем данные на бэкенд для удаления из базы
            data = {
                action: 'deleteContact',
                'userId': USER_ID,
                'contactUserId': e.target.id
            }
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

                // выводим сообщение, что данный пользователь удален из списка чатов
                alertMessage(`Пользователь ${e.target.innerText} удален из списка чатов`);
                document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null;
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // удаляем переписку с пользователем
        let deleteUserChats = document.querySelector('#deleteuserchats');
        deleteUserChats.onclick = async () => {
            // console.log(e.target.id);
            // отправляем данные на бэкенд для удаления из базы
            data = {
                action: 'deleteUserMessages',
                'send_user_id': USER_ID,
                'accept_user_id': e.target.id
            }
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

                // выводим сообщение, что переписка с пользователем удалена
                document.getElementById(`${e.target.innerText}`) ? document.getElementById(`${e.target.innerText}`).remove() : null;
                alertMessage(`Вся переписка с пользователем ${e.target.innerText} удалена`);
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    }

    // выводим контекстное меню на сообщении
    if (e.target.classList.contains('div-send-message')
        || e.target.classList.contains('div-accept-message')
        // || e.target.classList.contains('div-text-message')
        // || e.target.classList.contains('div-datetime-message')
    ) {
        // console.log(e.target.id);
        e.preventDefault();
        // выводим меню
        const CHAT_MESSAGE_MENU = document.querySelector('.ul-message-menu');
        CHAT_MESSAGE_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_MESSAGE_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_MESSAGE_MENU.style.top = positionY + 'px';
        CHAT_MESSAGE_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом сообщении
        let divMessageActive = document.querySelector('.div-message-active');
        divMessageActive !== null ? divMessageActive.classList.remove('div-message-active') : null;
        e.target.classList.add('div-message-active');

        // удаляем выбранное сообщение
        let deleteMessage = document.querySelector('#deletemessage');
        deleteMessage.onclick = async () => {
            // отравляем сообщение пользователю, для удаления у него удаленного сообщения и удаления из базы
            let chatUser = document.querySelector('.div-chat-user-active').id
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatUser);
            WS.send(JSON.stringify({
                command: 'deleteMessage',
                id: e.target.id,
                to: to,
                nickname: USER_NICKNAME
            }))
            // выводим сообщение, что сообщение удалено
            document.getElementById(`${e.target.id}`).textContent = 'Сообщение удалено'
            e.target.classList.remove('div-message-active');
            DELETEMESSAGE.play();
        }

        // редактируем выбранное сообщение
        let editMessage = document.querySelector('#editmessage');
        editMessage.onclick = async () => {
            // console.log(e);
            // выводим текст сообщения в текстовую область для редактирования
            TEXT_AREA_MESSAGE.value = e.target.firstChild.innerText;
            // убираем выделение сообщения
            document.getElementById(e.target.id).classList.remove('div-message-active');
            // отправка измененного сообщения
            const MESSAGE_SEND = document.querySelector('#sendmessage');
            let chatUser = document.querySelector('.div-chat-user-active').id
            MESSAGE_SEND.onclick = () => {
                let textSendMessage = TEXT_AREA_MESSAGE.value;
                // проверить не пусто ли сообщение
                if (textSendMessage === '') {
                    alertMessage('Введите текст сообщения');
                } else {
                    TEXT_AREA_MESSAGE.value = '';
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatUser);
                    message = JSON.stringify({
                        command: 'editMessage',
                        id: e.target.id,
                        to: to,
                        send_user_id: USER_ID,
                        accept_user_id: chatUser,
                        nickname: USER_NICKNAME,
                        text_message: textSendMessage
                    });
                    WS.send(message);
                    TEXT_AREA_MESSAGE.focus();
                    // выводим текст измененного сообщение
                    e.target.firstChild.textContent = textSendMessage;
                    // делаем пометку на сообщении
                    e.target.lastChild.textContent = 'edited';
                }
            }
        }

        // пересылаем выбранное сообщение
        let forwardMessage = document.querySelector('#forwardmessage');
        forwardMessage.onclick = async () => {
            console.log(e.target.id);
            // отправляем данные на бэкенд для изменения в базе
            data = {
                action: 'forwardMessage',
                'message_id': e.target.id
            }
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.text();
                console.log('Успех: ', result);


            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    }

    // убираем меню по клику в любом месте документа
    window.addEventListener('click', () => {
        document.querySelector('.ul-chat-user-menu').style.display = 'none';
        document.querySelector('.ul-message-menu').style.display = 'none';
        // !!! если здесь убирать выделение кликнутого пользователя рамкой,
        // то потом при клике левой кнопкой пользователь не выделяется
        // пока не понял почему
        // e.target.classList.remove('div-chat-user-active');
    });

    // убираем меню по клавише escape
    window.addEventListener('keydown', (press) => {
        if (press.key === 'Escape') {
            document.querySelector('.ul-chat-user-menu').style.display = 'none';
            document.querySelector('.ul-message-menu').style.display = 'none';
            // аналогично
            // e.target.classList.remove('div-chat-user-active');
        }
    });
}