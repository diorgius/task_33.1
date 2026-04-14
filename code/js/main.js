const BUTTON_ADD_USER = document.querySelector('#btnadduser');
const DIV_LIST_USERS = document.querySelector('#divlistusers');
const DIV_USER_CHATS = document.querySelector('#divuserchats');
const MAIN_WINDOW = document.querySelector('#mainwindow');
const TEXT_AREA_MESSAGE = document.querySelector('#textmessage');
if (document.querySelector('#userid')) {
    const USER_ID = document.querySelector('#userid').value;
}

// !!!TO DO
// !!!СДЕЛАНО 1. изменить добавление nickname, при регистрации не задавать nickname автоматически 
// (у разных почтовиков могут быть одинаковые nickname)
// только если пользователь сам его добавляет, при этом учитывать скрытие email, 
// если не задан nickname, то не давать возможность скрыть email
// при выводе списка пользователей и добавленных пользователей вывод nickname/email

// 2. разобраться с отправкой сообщений только выбранному пользователю и 
// при открытии чата задавать id divusermessages уникальным 
// (??? nickname? emai? id - уже нельзя, занят в списке добавленных пользоватей)
// или как-то комбинировать, чтобы потом закрывать и открывать
// в зависимости от того с кем чат

// 3. если пользователю приходит сообщение от пользователя с которым не открыт чат,
// активировать пользователя из списка контактов (???имитировать клик), 
// активировать divusermessages писать в заголовке с кем чат (от кого пришло сообщение)
// и примать сообщения в него 
// 
// 4. если у пользователя уже открыт чат с другим пользователем
// выдать сообщение о приходе сообщения от другого пользователя
// ??? или просто делать оповещение в любом случае, а чат пусть пользователь открывает сам
//
// 5. запись сообщений в базу
//
// 6. при активации пользователя загружать из базы ранние сообщения от этого пользователя
//
// 7. выдавать звуковое оповещение о приходе сообщения
//
// 8. вкл/выкл оповещения и отображение этого
//
// 9. проверить выделение бордером при лвом кликом после кликов правой кнопкой


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

        } catch (error) {
            console.log('Ошибка: ', error);
        }
    } else {
        let pAlert = document.createElement('p');
        pAlert.setAttribute('id', 'alert');
        DIV_ALERT.appendChild(pAlert);
        pAlert.textContent = 'Пользователь ' + nickname + ' уже в списке чатов';

        // убираем надпись по таймеру (2 секунды)
        setTimeout(() =>
            pAlert.remove(), 2000
        );
    }
}

// обрабатываем меню по клику правой кнопки на пользователях чата
window.oncontextmenu = (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e.target.id);
        e.preventDefault();

        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu');
        CHAT_USER_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_USER_MENU.style.top = positionY + 'px';
        // CHAT_USER_MENU.top = `${e.pageY}px`;
        CHAT_USER_MENU.style.left = `${e.pageX}px`;

        // добавляем/удаляем выделение элемента border 
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
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
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
            // здесь будем отключать оповещение
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotification');
        onNotification.onclick = () => {
            // console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
            // здесь будем включать оповещение
        }

        // удаляем пользователя из списка чатов
        let delChatUser = document.querySelector('#deletechatuser');
        delChatUser.onclick = async () => {
            // console.log(e.target.id);

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
                let nickname = e.target.lastElementChild.lastElementChild.innerHTML;
                document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null;
                let pAlert = document.createElement('p');
                pAlert.setAttribute('id', 'alert');
                DIV_ALERT.appendChild(pAlert);
                pAlert.textContent = `Пользователь ${nickname} удален из списка чатов`;

                // убираем надпись по таймеру (2 секунды)
                setTimeout(() =>
                    pAlert.remove(), 2000
                );
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // удаляем чаты с пользователем
        let delUserChats = document.querySelector('#deleteuserchats');
        delUserChats.onclick = () => {
            // console.log(e.target.id);
            // здесь будем удалять чаты пользователя
        }

        // убираем меню по клику в любом месте документа
        window.addEventListener('click', () => {
            document.querySelector('.ul-chat-user-menu').style.display = 'none';
            e.target.classList.remove('div-chat-user-active');
        });

        // убираем меню по клавише escape
        window.addEventListener('keydown', (press) => {
            if (press.key === 'Escape') {
                document.querySelector('.ul-chat-user-menu').style.display = 'none';
                e.target.classList.remove('div-chat-user-active');
            }
        });
    }
}