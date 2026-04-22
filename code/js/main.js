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
// !!! СДЕЛАНО 5. запись сообщений в БД
//
// !!! СДЕЛАНО 6. при активации пользователя загружать из БД ранние сообщения от этого пользователя
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
// на стороне получателя мы при записе в БД получаем message_id и пересылаем его адресату
// уже с уникальным id, а на стороне отправителя??? id нет и как потом его идентифицировать
// если пользователь захочет его переслать???
// при открытии чата сообщения будут загружены из БД и тут проблем нет т.к. id будет
//
// !!! СДЕЛАНО 14. сделать удаление всей переписки с пользователем
//
// !!! СДЕЛАНО 14.1 при удалении пользователя из списка контактов ??? НАДО ЛИ удалять переписку с ним
//
// !!! СДЕЛАНО 15. удаление конкретного сообщения
//
// !!! СДЕЛАНО 16. редактирование сообщения
//
// !!! СДЕЛАНО 17. пересылка сообщения ??? НАДО ЛИ У СЕБЯ ДЕЛАТЬ ОТМЕТКУ О ПЕРЕСЫЛКЕ ???
//
// !!! ??? ПЕРЕДЕЛАТЬ ??? запись отправленного сообщения не от кого кому, а по id контакта !!!
//
// 18. создание группы и добавление пользователей в группу
// 
// 19. рассылка групповых сообщений
//
// 20. удаление пользователя из группы
// 
// 21. удаление группы ???только ее создателем
//
// !!! СДЕЛАНО 22. при добавлении пользователя в список своих контактов
// добавлять себя в список его контактов с отправкой ему сообщения об этом
//
// 23. правый клик не только на див сообщения, а на всей области сообщения
//
// 24. !!! ??? НАДО ПОДУМАТЬ о статусе сообщения прочитано/непрочитано, чтобы пользователь
// при входе мог видеть, что ему поступили новые сообщения и от кого, пока он был неактивен
// 
// !!! СДЕЛАНО 25. !!! ??? при удалении контакта ??? тоже удалять себя у него





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
                        // при клике на пользователе вызываем функцию добавления пользователя в список своих контактов
                        divUser.onclick = () => { addUser(USER_ID, item.id, item.email, item.nickname, item.avatar, item.hideemail, true); };
                    }
                });
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    });
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

        // удаляем пользователя из списка контактов с удалением всей переписки и удаляем у него свой контакт
        let deleteChatUser = document.querySelector('#deletechatuser');
        deleteChatUser.onclick = async () => {
            // console.log(e);
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
            document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null;
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';

        }

        // удаляем переписку с пользователем
        let deleteUserChats = document.querySelector('#deleteuserchats');
        deleteUserChats.onclick = async () => {
            // console.log(e.target.id);
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
        deleteMessage.onclick = () => {
            // отравляем сообщение пользователю, для удаления у него удаленного сообщения и удаления из БД
            let chatUser = document.querySelector('.div-chat-user-active').id
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatUser);
            WS.send(JSON.stringify({
                command: 'deleteMessage',
                id: e.target.id,
                to: to,
                send_nickname: USER_NICKNAME
            }))
            // выводим сообщение, что сообщение удалено
            document.getElementById(`${e.target.id}`).textContent = 'Сообщение удалено'
            e.target.classList.remove('div-message-active');
            DELETEMESSAGE.play();
        }

        // редактируем выбранное сообщение
        let editMessage = document.querySelector('#editmessage');
        editMessage.onclick = () => {
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
                        send_nickname: USER_NICKNAME,
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
        forwardMessage.onclick = async (event) => {
            // console.log(event);
            // получаем список пользователей из своих контактов для пересылки сообщения
            data = {
                action: 'getUserContacts',
                'user_id': USER_ID
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
                ulChatUsers.setAttribute('id', 'ulusersmenu')
                let divUserMessages = document.querySelector('.div-user-messages');
                result.forEach((item) => {
                    // если это контакт с которым открыт чат, не выводим этот контакт для пересылки
                    if (divUserMessages.id !== item.nickname && divUserMessages.id !== item.email) {
                        // выводим список пользователей
                        let liChatUser = document.createElement('li');
                        liChatUser.classList.add('li-users-menu');
                        let spanUserNickname = document.createElement('span');
                        spanUserNickname.classList.add('span-forward-user');
                        item.nickname !== '' ? spanUserNickname.textContent = item.nickname : spanUserNickname.textContent = item.email;
                        let spanCheckbox = document.createElement('span');
                        spanCheckbox.classList.add('span-forward-user');
                        let checkbox = document.createElement('input');
                        checkbox.setAttribute('type', 'checkbox');
                        checkbox.classList.add('checkbox-forward-user');
                        checkbox.setAttribute('id', item.contact_user_id);
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
                    // console.log(userToForward);
                    // отправляем данные в сокет для записи в БД и отправки сообщения
                    // активным пользователям из числа тех кому пересылается сообщение
                    // определяем от кого пересылаем
                    e.target.classList.contains('div-accept-message') ?
                        forwardUser = document.querySelector('.div-chat-user-active').lastElementChild.innerText :
                        forwardUser = USER_NICKNAME;
                    message = JSON.stringify({
                        command: 'forwardMessage',
                        id: e.target.id,
                        send_user_id: USER_ID,
                        usersToForward: usersToForward,
                        send_nickname: USER_NICKNAME,
                        text_message: e.target.firstChild.innerText,
                        status_message: `forwarded from ${forwardUser}`
                    });
                    WS.send(message);
                    // убираем контекстное меню
                    document.querySelector('.ul-message-menu').style.display = 'none';
                    document.querySelector('#ulusersmenu') ? document.querySelector('#ulusersmenu').remove() : null;
                }

            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    }

    // убираем меню по клику в любом месте документа
    window.addEventListener('click', (elem) => {
        document.querySelector('.ul-chat-user-menu').style.display = 'none';
        // !!! если здесь убирать выделение кликнутого пользователя рамкой,
        // то потом при клике левой кнопкой пользователь не выделяется
        // пока не понял почему
        // e.target.classList.remove('div-chat-user-active');

        // console.log(elem.target);
        // если клики не на пункте меню или пользователе или чекбоксе, то убираем меню
        if (!elem.target.classList.contains('li-users-menu')
            && !elem.target.classList.contains('span-forward-user')
            && !elem.target.classList.contains('checkbox-forward-user')) {
            document.querySelector('#ulusersmenu') ? document.querySelector('#ulusersmenu').remove() : null;
            document.querySelector('.ul-message-menu').style.display = 'none';
        }
    });

    // убираем меню по клавише escape
    window.addEventListener('keydown', (press) => {
        if (press.key === 'Escape') {
            document.querySelector('.ul-chat-user-menu').style.display = 'none';
            // аналогично
            // e.target.classList.remove('div-chat-user-active');
            // по клавише убираем все меню
            document.querySelector('.ul-message-menu').style.display = 'none';
            document.querySelector('#ulusersmenu') ? document.querySelector('#ulusersmenu').remove() : null;
        }
    });
}