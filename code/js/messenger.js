const USER_ID = document.querySelector('#userid').value;
const USER_NICKNAME = document.querySelector('.p-nickname').innerText;
const notice = new Audio('../../img/notice.mp3');
let connectedUsers = '';

// открываем соединение websocket
const WS = new WebSocket("WS://localhost:8080/");
// console.log(WS);

WS.onopen = () => {
    console.log('Connected');
    // отправляем сообщение всем пользователям чата о своем присоединении к чату
    WS.send(JSON.stringify({
        command: 'connect',
        userId: USER_ID,
        nickname: USER_NICKNAME
    }))
}

WS.onerror = (error) => {
    console.error("WebSocket error:", error);
}

WS.onclose = (e) => {
    console.log(`Closed: ${e.code} ${e.reason}`);
}

WS.onmessage = (e) => {
    let data = JSON.parse(e.data);
    // console.log('Received:', data);
    switch (data.command) {
        case 'connect':
            // сообщение, о том что пользователь присоединился к чату
            data.userId !== USER_ID ? alertMessage(`Пользователь ${data.nickname} в чате`) : null;
            // получаем список активных пользователей 
            connectedUsers = data.connectedUsers;
            // console.log(connectedUsers);
            // проверяем есть ли у пользователя привоединившийся контакт и выделяем присоединившегося пользователя цветом 
            // и даем возможность отправки сообщений этому пользователю
            Object.values(connectedUsers).forEach(value => {
                if (value !== USER_ID) {
                    document.getElementById(value) ? document.getElementById(value).classList.add('div-chat-user-onchat') : null;
                }
            })
            break;
        case 'privateMessage':
            // console.log(data);
            // проверяем отключено или нет оповещение для этого пользователя
            if (!document.getElementById(data.send_user_id).classList.contains('div-chat-user-without-notice')) {
                // если открыт список добавления пользователей, то выделяем пользователя цветом 
                // (сообщаем, что от этого пользователя пришло сообщение)
                if (document.querySelector('#divaddusers')) {
                    document.getElementById(data.send_user_id).classList.add('div-chat-user-onmessage');
                } else {
                    // проверяем если есть открытый чат
                    if (document.querySelector('.div-user-messages')) {
                        // проверяем если открытый чат с пользователем от которого пришло сообщение, то выводим сообщение
                        if (document.querySelector('.div-user-messages').id === data.send_nickname) {
                            let divUserMessages = document.getElementById(data.send_nickname);
                            // выводим принятое сообщение
                            outputMessage(divUserMessages, data);
                            // воспроизводим звук
                            notice.autoplay = true;
                            notice.play();
                            // если у пользователя открыт чат и приходит сообщение от другого пользователя, 
                            // то выделяем пользователя цветом (сообщаем, что от этого пользователя пришло сообщение)
                        } else if (document.querySelector('.div-user-messages').id !== data.send_nickname) {
                            document.getElementById(data.send_user_id).classList.add('div-chat-user-onmessage');
                        }
                        // если нет открытых чатов, то создаем его с тем от кого пришло сообщение и выводим текст
                    } else {
                        // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя
                        createDivUserMessages(data.send_nickname);
                        let divUserMessages = document.getElementById(data.send_nickname);
                        console.log(data);

                        // выводим ранние сообщения из базы

                        // отправляем запрос в бэкенд для загрузки ранних сообщений пользователя
                        data = {
                            action: 'getUserMessages',
                            sendUserId: USER_ID,
                            acceptUserId: data.send_user_id
                        };
                        getUserMessages(data);

                        // выводим принятое сообщение
                        // outputMessage(divUserMessages, data);
                        // воспроизводим звук
                        notice.autoplay = true;
                        notice.play();
                        // имитируем клик на пользователе от которого пришло сообщение для возможности отправки ему сообщений
                        document.getElementById(data.acceptUserId).click();
                    }
                }
            }
            break;
        case 'replay':
            // console.log(data);
            // добавлена отправка сообщения самому себе после отправки сообщения адресату
            // для того чтобы получить message_id из БД, дату и время сообщения
            // для присвоения div id для однозначной идентификации и возможности удалять, редактировать, персылать
            // сообщения и вывода даты и времени

            // вызываем функцию для вывода себе сообщения, отправленного адресату
            let divUserMessages = document.querySelector('.div-user-messages');
            outputMessage(divUserMessages, data);
            break;
        case 'disconnect':
            // если пользователь отключается, то удаляем его из списка активных пользователей
            delete connectedUsers[data.connectId];
            // console.log(connectedUsers);
            // проверяем есть ли у пользователя такой контакт и убираем отметку об активности пользователя
            if (document.getElementById(data.userId)) {
                let inactiveChatUser = document.getElementById(data.userId);
                inactiveChatUser.classList.remove('div-chat-user-onchat');
            }
            break;
    }
}

// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку (загружаем ранние сообщения из базы))
document.body.addEventListener('click', async (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e);

        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive !== null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
        e.target.classList.add('div-chat-user-active');

        // если пользователь не в чате, блокируем отправку сообщения
        if (!e.target.classList.contains('div-chat-user-onchat')) {
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
            // выводим сообщение, что пользователь не в чате
            alertMessage(`Пользователь ${e.target.innerText} не в чате`);
        } else {
            // при клике на пользователе проверяем есть ли открытый чат или, если это не чат 
            // с пользователем на котором кликнули. то удаляем окрытый и создаем новый с кликнутым пользователем
            if (!document.querySelector('.div-user-messages') || document.querySelector('.div-user-messages').id !== e.target.innerText) {
                document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;

                // если у пользователя есть полученные и непрочитанные сообщения от других пользователей
                document.getElementById(e.target.id).classList.remove('div-chat-user-onmessage');
                document.getElementById(e.target.id).classList.add('div-chat-user-onchat');
                // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя
                createDivUserMessages(e.target.innerText);

                // отправляем запрос в бэкенд для загрузки ранних сообщений пользователя
                data = {
                    action: 'getUserMessages',
                    sendUserId: USER_ID,
                    acceptUserId: e.target.id
                };
                getUserMessages(data);

                document.querySelector('.div-text-send-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
                // если это тот же чат просто активируем поле ввода сообщения
            } else {
                document.querySelector('.div-text-send-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
            }

            // отправка сообщения
            const MESSAGE_SEND = document.querySelector('#sendmessage');
            MESSAGE_SEND.onclick = () => {
                let textSendMessage = TEXT_AREA_MESSAGE.value;
                // проверить не пусто ли сообщение
                if (textSendMessage === '') {
                    alertMessage('Введите текст сообщения');
                } else {
                    TEXT_AREA_MESSAGE.value = '';
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
                    message = JSON.stringify({
                        command: 'privateMessage',
                        to: to,
                        accept_user_id: e.target.id,
                        send_user_id: USER_ID,
                        send_nickname: USER_NICKNAME,
                        text_message: textSendMessage
                    });
                    WS.send(message);
                    // let divUserMessages = document.getElementById(e.target.innerText);
                    // выводим отправляемое сообщение
                    // outputMessage(divUserMessages, 'send', textMessage);
                }
            }
        }
    }
    // если клик по крестику в хидере чата
    if (e.target.id === 'spanchatclose') {
        document.querySelector('.div-user-messages').remove();
        document.querySelector('.div-text-send-message').style.visibility = 'hidden';
    }
});