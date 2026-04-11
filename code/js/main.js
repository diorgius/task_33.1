const BUTTON_ADD_USER = document.querySelector('#btnadduser');
const DIV_LIST_USERS = document.querySelector('#divlistusers');
const DIV_USER_CHATS = document.querySelector('#divuserchats');
const MAIN_WINDOW = document.querySelector('#mainwindow');
const TEXT_AREA_MESSAGE = document.querySelector('#textmessage');

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





// маштабируем текстовую область сообщений
let actions = ['input', 'cut', 'paste', 'drop'];
if (TEXT_AREA_MESSAGE) {
    actions.forEach((e) => {
        TEXT_AREA_MESSAGE.addEventListener(e, () => {
            TEXT_AREA_MESSAGE.style.height = 'auto';
            TEXT_AREA_MESSAGE.style.height = TEXT_AREA_MESSAGE.scrollHeight + 'px';
        });
    });
};

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
                    let userId = document.querySelector('#userid').value;
                    if (`${item.id}` !== userId) {

                        let divUser = document.createElement('div');
                        divUser.classList.add('div-user');
                        divUser.setAttribute('id', 'divuser_' + `${item.id}`);
                        divAddUsers.appendChild(divUser);
                        divUser.onclick = () => { addUser(userId, item.id, item.email, item.nickname, item.avatar, item.hideemail); };

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
                        };
                    };
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
    };
};

// открываем соединение websocket
const ws = new WebSocket("ws://localhost:8080/");
console.log(ws);

ws.onopen = () => {
    console.log("Connected");
    // ws.send(JSON.stringify({ type: "hello" }))
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = (event) => {
    console.log(`Closed: ${event.code} ${event.reason}`);
};

ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    console.log("Received:", data);
    if (!document.querySelector('#divusermessages')) {
        console.log(document.querySelector('#divusermessages'));
        let divUserMessages = document.createElement('div');
        divUserMessages.classList.add('div-user-messages');
        divUserMessages.setAttribute('id', 'divusermessages');
        divUserMessages.textContent = `Чат с пользователем ${data.contactNickname}`;
        MAIN_WINDOW.appendChild(divUserMessages);
        document.getElementById(`${data.contactId}`).click();
    }
    let divUserMessages = document.querySelector('#divusermessages');
    let divMessage = document.createElement('div');
    divMessage.classList.add('div-accept-message');
    divMessage.setAttribute('id', 'divacceptmessage');
    divMessage.textContent = data.textMessage;
    divUserMessages.appendChild(divMessage);
};

// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку)
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e);

        // варианты переключения классов при клике на #divchatuser
        // 1. с условиями
        // let active = null // объявляем переменную вне функции, чтобы не обнулялась
        // if (active === e.target) {
        //     e.target.classList.toggle('div-chat-user-active')
        // } else {
        //     active === null ? null : active.classList.remove('div-chat-user-active')
        //     e.target.classList.add('div-chat-user-active')
        //     active = e.target
        //     console.log(active)
        // }
        // 2. цикл forEach
        // elements = document.querySelectorAll('.div-chat-user') // перебираем все элементы верхнего класса
        // elements = document.querySelectorAll('.div-chat-user-active') // сразу ищем нужный класс
        // elements.forEach(elem => {elem.classList.remove('div-chat-user-active')})
        // console.log(elements)
        // 3. то же с циклом for...of
        // for (const element of elements) {
        //      element.classList.remove('div-chat-user-active')
        // }

        // остановился на этом варианте,  думаю в данном случае самый оптимальный
        // добавляем/удаляем выделение элемента border
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
        e.target.classList.add('div-chat-user-active');

        document.querySelector('#divusermessages') ? document.querySelector('#divusermessages').remove() : null;
        let divUserMessages = document.createElement('div');
        divUserMessages.classList.add('div-user-messages');
        divUserMessages.setAttribute('id', 'divusermessages');
        MAIN_WINDOW.appendChild(divUserMessages);
        divUserMessages.textContent = `Чат с пользователем ${e.target.innerText}`;
        document.querySelector('.div-text-message').style.visibility = 'visible';
        TEXT_AREA_MESSAGE.focus();

        const MESSAGE_SEND = document.querySelector('#messagesend');
        MESSAGE_SEND.addEventListener('click', () => {
            let userId = document.querySelector('#userid').value;
            let nickname = document.querySelector('.p-nickname').innerText;
            let textMessage = TEXT_AREA_MESSAGE.value;
            TEXT_AREA_MESSAGE.value = '';
            message = JSON.stringify({
                'to': `${e.target.id}`,
                'contactId': userId,
                'contactNickname': nickname,
                'textMessage': textMessage
            });
            ws.send(message);
            let divMessage = document.createElement('div');
            divMessage.classList.add('div-send-message');
            divMessage.setAttribute('id', 'divsendmessage');
            divMessage.textContent = textMessage;
            divUserMessages.appendChild(divMessage);
        });
    };
});

// const controller = new AbortController()
// const { signal } = controller // клик отрабатывает, но грохает все слушатели после правого клика

// // обрабатываем меню по клику правой кнопки на пользователях чата
// document.body.addEventListener('contextmenu', (e) => {
// // document.body.addEventListener('contextmenu', async function contextMenu(e) {
//     if (e.target.classList.contains('div-chat-user')) {
//         // console.log(e.target.closest('div-chat-user'))
//         console.log(e.target.id)
//         e.preventDefault()
//         // return
//         const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
//         CHAT_USER_MENU.display = 'block'
//         CHAT_USER_MENU.top = `${e.layerY}px`
//         CHAT_USER_MENU.left = `${e.layerX}px`

//         let divChatUserActive = document.querySelector('.div-chat-user-active')
//         divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null
//         e.target.classList.add('div-chat-user-active')

//         // добавляем пользователя в групповой чат
//         let addGroupChat = document.querySelector('#addgroupchat')
//         addGroupChat.addEventListener('click', () => {
//             console.log(e.target.id)
//             // здесь будем добавлять пользователя в групповой чат


//         }, { signal })

//         // включаем оповещение
//         let onNotification = document.querySelector('#onnotification')
//         onNotification.addEventListener('click', () => {
//             console.log(e.target.id)
//             let chatUserWithoutNotice = document.getElementById(e.target.id)
//             chatUserWithoutNotice.classList.remove('chat-user-without-notice')

//             // здесь будем включать оповещение


//         }, { signal })

//         // отключаем оповещение
//         let offNotification = document.querySelector('#offnotification')
//         offNotification.addEventListener('click', () => {
//             console.log(e.target.id)
//             let chatUserWithoutNotice = document.getElementById(e.target.id)
//             chatUserWithoutNotice.classList.add('chat-user-without-notice')

//             // здесь будем отключать оповещение


//         }, { signal })

//         // удаляем пользователя из списка чатов
//         let delChatUser = document.querySelector('#deletechatuser')
//         delChatUser.addEventListener('click', async () => {
//             // delChatUser.addEventListener('click', async function clickDeleteChatUser() {
//             let userId = document.querySelector('#userid').value
//             console.log(e.target.id)
//             return
//             // при клике на меню deletechatuser на разных пользователях накапливались события и происходило
//             // последовательное самостоятельное удаление всех пользователей на которых был сделан клик
//             // для того что бы при клике события не накапливались (данные не дублировались, не происходило удаление),
//             // надо после каждого клика (считанного события) удалять EventListener, но удалить его можно только если на событие 
//             // вызывается именованая функция или можно использовать опцию once
//             // после вызываемой функции добавляем третьим аргументом ,{ capture: false, once: true })

//             // delChatUser.removeEventListener('click', clickDeleteChatUser)

//             // !!! (ПРОБЛЕММА ПОКА НЕ РЕШЕНА) выяснилась еще одна проблемма, теперь еще и просто при клите правой кнопкой на chatuser
//             // и при последующем выборе пункта меню
//             // также происходит и изменение (и уаление тоже) тех пользователей на которые был просто клик правой кнопкой,
//             // если добавить в функцию клика contextmenu опцию once, то дальнейшие клики по элементам не отрабатываются

//             data = {
//                 action: 'deleteContact',
//                 'userId': userId,
//                 'contactUserId': e.target.id
//             }

//             try {
//                 let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json;charset=utf-8'
//                     },
//                     body: JSON.stringify(data)
//                 })
//                 let result = await response.text()
//                 // console.log('Успех: ', result)
//                 let nickname = e.target.lastElementChild.lastElementChild.innerHTML
//                 document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null
//                 let pAlert = document.createElement('p')
//                 pAlert.setAttribute('id', 'alert')
//                 DIV_ALERT.appendChild(pAlert)
//                 pAlert.textContent = `Пользователь ${nickname} успешно удален из списка чатов`

//                 // убираем надпись по таймеру (2 секунды)
//                 setTimeout(() =>
//                     pAlert.remove(), 2000
//                 )
//             } catch (error) {
//                 console.log('Ошибка: ', error)
//             }
//         }, { signal })

//         // удаляем чаты с пользователем
//         let delUserChats = document.querySelector('#deleteuserchats')
//         delUserChats.addEventListener('click', () => {
//             console.log(e.target.id)
//             // здесь будем удалять чаты пользователя


//         }, { signal })

//         // убираем меню по клику в любом месте документа
//         window.addEventListener('click', () => {
//             document.querySelector('.ul-chat-user-menu').style.display = 'none'
//             e.target.classList.remove('div-chat-user-active')

//         });

//         // убираем меню по клавише escape
//         window.addEventListener('keydown', (press) => {
//             if (press.key === 'Escape') {
//                 document.querySelector('.ul-chat-user-menu').style.display = 'none'
//                 e.target.classList.remove('div-chat-user-active')
//             }
//         });
//     }
//     controller.abort()
// })




// обрабатываем меню по клику правой кнопки на пользователях чата

window.oncontextmenu = function (e) {
    // document.body.addEventListener('contextmenu', (e) => {
    // document.body.addEventListener('contextmenu', async function contextMenu(e) {
    if (e.target.classList.contains('div-chat-user')) {
        console.log(e.target.id);
        e.preventDefault();

        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu');
        CHAT_USER_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight;
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
            console.log(e.target.id);
            // здесь будем добавлять пользователя в групповой чат
        }

        // addGroupChat.addEventListener('click', () => {
        //     console.log(e.target.id)
        //     // здесь будем добавлять пользователя в групповой чат
        // }, { capture: false, once: true })// для остановки EventListener опция once: true

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotification');
        offNotification.onclick = () => {
            console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.add('chat-user-without-notice');

            // здесь будем отключать оповещение

        }

        // offNotification.addEventListener('click', () => {
        //     console.log(e.target.id)
        //     let chatUserWithoutNotice = document.getElementById(e.target.id)
        //     chatUserWithoutNotice.classList.add('chat-user-without-notice')

        //     // здесь будем отключать оповещение

        // }, { capture: false, once: true })// для остановки EventListener опция once: true

        // включаем оповещение
        let onNotification = document.querySelector('#onnotification');
        onNotification.onclick = () => {
            console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('chat-user-without-notice');

            // здесь будем включать оповещение

        }

        // onNotification.addEventListener('click', () => {
        //     console.log(e.target.id)
        //     let chatUserWithoutNotice = document.getElementById(e.target.id)
        //     chatUserWithoutNotice.classList.remove('chat-user-without-notice')

        //     // здесь будем включать оповещение

        // }, { capture: false, once: true })// для остановки EventListener опция once: true

        // удаляем пользователя из списка чатов
        let delChatUser = document.querySelector('#deletechatuser');
        delChatUser.onclick = async () => {
            // delChatUser.addEventListener('click', async () => {
            // delChatUser.addEventListener('click', async function clickDeleteChatUser() {
            let userId = document.querySelector('#userid').value;
            console.log(e.target.id);

            // при клике на меню deletechatuser на разных пользователях накапливались события и происходило
            // последовательное самостоятельное удаление всех пользователей на которых был сделан клик
            // для того что бы при клике события не накапливались (данные не дублировались, не происходило удаление),
            // надо после каждого клика (считанного события) удалять EventListener, но удалить его можно только если на событие 
            // вызывается именованая функция или можно использовать опцию once
            // после вызываемой функции добавляем третьим аргументом ,{ capture: false, once: true })

            // delChatUser.removeEventListener('click', clickDeleteChatUser)

            // !!! (ПРОБЛЕММА ПОКА НЕ РЕШЕНА) выяснилась еще одна проблемма, теперь еще и просто при клите правой кнопкой на chatuser
            // и при последующем выборе пункта меню
            // также происходит и изменение (и уаление тоже) тех пользователей на которые был просто клик правой кнопкой,
            // если добавить в функцию клика contextmenu опцию once, то дальнейшие клики по элементам не отрабатываются

            // !!! ПРОБЛЕММА РЕШЕНА - вместо навешивания addEventListener на элементы меню
            // просто на элемент меню вешаем событие onclick, а на него функцию обработки

            data = {
                action: 'deleteContact',
                'userId': userId,
                'contactUserId': e.target.id
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
                let nickname = e.target.lastElementChild.lastElementChild.innerHTML;
                document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null;
                let pAlert = document.createElement('p');
                pAlert.setAttribute('id', 'alert');
                DIV_ALERT.appendChild(pAlert);
                pAlert.textContent = `Пользователь ${nickname} успешно удален из списка чатов`;

                // убираем надпись по таймеру (2 секунды)
                setTimeout(() =>
                    pAlert.remove(), 2000
                );
            } catch (error) {
                console.log('Ошибка: ', error);
            };
        };

        // удаляем чаты с пользователем
        let delUserChats = document.querySelector('#deleteuserchats');
        delUserChats.onclick = () => {
            // delUserChats.addEventListener('click', () => {
            console.log(e.target.id);

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
            };
        });


        // e.target.removeEventListener('contextmenu', contextMenu) // если добавляем здесь, то меню срабатывает только 1 раз
    };
    // },  { capture: false, once: true })// для остановки EventListener опция once: true если добавляем здесь, то меню срабатывает только 1 раз
};
// })


// if (document.querySelector('.div-chat-user')) {

//     let divChatUser = document.querySelectorAll('.div-chat-user')
//     console.log(divChatUser)

//     divChatUser.forEach(elem => {elem.addEventListener('click', (e) => {
//         e.preventDefault()
//         console.log(elem)
//     })})

//      // при таком подходе не отрабатывается на вновь добавленных элементах,
//      // только на тех которые были на момент загрузки страницы

//     divChatUser.forEach(elem => {elem.addEventListener('contextmenu', (e) => {
//         e.preventDefault()
//         console.log(e)
//         const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
//         CHAT_USER_MENU.display = 'block'
//         CHAT_USER_MENU.top = `${e.layerY}px`
//         CHAT_USER_MENU.left = `${e.layerX}px`

//         let delChatUser = document.querySelector('#deletechatuser')
//         delChatUser.addEventListener('click', async () => {
//             let userId = document.querySelector('#userid').value
//             console.log(e)
//             deleteChatUser(userId, `${e.target.id}`)

//             // data = {
//             //     action: 'deleteContact',
//             //     'userId': userId,
//             //     'contactUserId': `${e.target.id}`
//             // }
//             // try {
//             //     let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
//             //         method: 'POST',
//             //         headers: {
//             //             'Content-Type': 'application/json;charset=utf-8'
//             //         },
//             //         body: JSON.stringify(data)
//             //     })
//             //     let result = await response.text()
//             //     // console.log('Успех: ', result)
//             //     document.getElementById(`${e.target.id}`).remove()
//             //     let pAlert = document.createElement('p')
//             //     pAlert.setAttribute('id', 'alert')
//             //     DIV_ALERT.appendChild(pAlert)
//             //     pAlert.textContent = 'Пользователь успешно удален'
//             //     // убираем надпись по таймеру (2 секунды)
//             //     setTimeout(() =>
//             //         pAlert.remove(), 2000
//             //     )
//             // } catch (error) {
//             //     console.log('Ошибка: ', error)
//             // }
//         })
//     })})
// }