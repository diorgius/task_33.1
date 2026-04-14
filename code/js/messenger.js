const USER_ID = document.querySelector('#userid').value;
const USER_NICKNAME = document.querySelector('.p-nickname').innerText;
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
            // выделяем присоединившегося пользователя цветом и даем возможность отправки сообщений этому пользователю
            Object.values(data.connectedUsers).forEach(value => {
                if (value !== USER_ID) {
                    document.getElementById(value).classList.add('div-chat-user-onchat');
                }
            })
            break;
        case 'privateMessage':
            // console.log(data);
            // если есть открытый чат
            if (document.querySelector('.div-user-messages')) {
                // если открытый чат с пользователем от которого пришло сообщение, то выводим сообщение
                if (document.querySelector('.div-user-messages').id === data.sendNickname) {
                    let divUserMessages = document.querySelector('#' + data.sendNickname);
                    // выводим принятое сообщение
                    outputMessage(divUserMessages, 'accept', data.textMessage);
                // если у пользователя открыт чат и приходит сообщение от другого пользователя, то выделяем пользователя цветом
                } else if (document.querySelector('.div-user-messages').id !== data.sendNickname) {
                    document.getElementById(data.sendUserId).classList.add('div-chat-user-onmessage');
                }
                // если нет открытых чатов, то создаем его с тем от кого пришло сообщение и выводим текст
            } else {
                // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя
                createDivUserMessages(data.sendNickname);
                // let divUserMessages = document.createElement('div');
                // divUserMessages.classList.add('div-user-messages');
                // divUserMessages.setAttribute('id', data.sendNickname);
                // divUserMessages.textContent = `Чат с пользователем ${data.sendNickname}`;
                // MAIN_WINDOW.appendChild(divUserMessages);

                // ??? если создавать див через функцию, то следующая функция не видит див
                // надо наверно его найти через queryselector

                // выводим принятое сообщение
                outputMessage(divUserMessages, 'accept', data.textMessage);
                // имитируем клик на пользователе от которого пришло сообщение для возможности отправки ему сообщений
                document.getElementById(data.sendUserId).click();
            }
            break;
        case 'disconnect':
            // если пользователь отключается, то удаляем его из списка активных пользователей
            delete connectedUsers[data.connectId];
            // console.log(connectedUsers);
            // убираем отметку об активности пользователя
            let inactiveChatUser = document.getElementById(data.userId);
            inactiveChatUser.classList.remove('div-chat-user-onchat');
            break;
    }
}

// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку (загружаем ранние сообщения из базы))
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e);
        // добавляем/удаляем выделение элемента border
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
        e.target.classList.add('div-chat-user-active');
        // если пользователь не в чате, блокируем отправку сообщения
        if (!e.target.classList.contains('div-chat-user-onchat')) {
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;
            document.querySelector('.div-text-message').style.visibility = 'hidden';
            // выводим сообщение, что пользователь не в чате
            alertMessage('Пользователь не в чате');
        } else {
            // при клике на пользователе проверяем есть ли открытый чат или если это не чат 
            // с пользователем на котором кликнули. то удаляем окрытый и создаем новый с кликнутым пользователем
            if (!document.querySelector('.div-user-messages') || document.querySelector('.div-user-messages').id !== e.target.innerText) {
                document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;
                // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя
                createDivUserMessages(e.target.innerText);
                // let divUserMessages = document.createElement('div');
                // divUserMessages.classList.add('div-user-messages');
                // divUserMessages.setAttribute('id', e.target.innerText);
                // MAIN_WINDOW.appendChild(divUserMessages);
                // divUserMessages.textContent = `Чат с пользователем ${e.target.innerText}`;
                document.querySelector('.div-text-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
                // если это чат тот же просто активируем поле ввода сообщения
            } else {
                document.querySelector('.div-text-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
            }

            const MESSAGE_SEND = document.querySelector('#messagesend');
            MESSAGE_SEND.onclick = () => {
                let textMessage = TEXT_AREA_MESSAGE.value;
                // проверить не пусто ли сообщение
                if (textMessage === '') {
                    alertMessage('Введите текст сообщения');
                } else {
                    TEXT_AREA_MESSAGE.value = '';
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
                    message = JSON.stringify({
                        command: 'privateMessage',
                        to: to,
                        acceptUserId: e.target.id,
                        sendUserId: USER_ID,
                        sendNickname: USER_NICKNAME,
                        textMessage: textMessage
                    });
                    WS.send(message);
                    let divUserMessages = document.querySelector('#' + e.target.innerText);
                    // выводим отправляемое сообщение
                    outputMessage(divUserMessages, 'send', textMessage);
                }
            }
        }
    }
});

// функция вывода сообщений
function alertMessage(msg) {
    let pAlert = document.createElement('p');
    pAlert.setAttribute('id', 'alert');
    DIV_ALERT.appendChild(pAlert);
    pAlert.textContent = msg;
    // убираем надпись по таймеру (2 секунды)
    setTimeout(() =>
        pAlert.remove(), 2000
    );
}

// функция создания дива для отображения сообщений
function createDivUserMessages(divId) {
    let divUserMessages = document.createElement('div');
    divUserMessages.classList.add('div-user-messages');
    divUserMessages.setAttribute('id', divId);
    MAIN_WINDOW.appendChild(divUserMessages);
    divUserMessages.textContent = `Чат с пользователем ${divId}`;
}

// функция вывода сообщений
function outputMessage(location, type, msg) {
    let divMessage = document.createElement('div');
    divMessage.classList.add(`div-${type}-message`);
    divMessage.setAttribute('id', 'divsendmessage');
    divMessage.textContent = msg;
    location.appendChild(divMessage);
}