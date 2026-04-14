const USER_ID = document.querySelector('#userid').value;
const USER_NICKNAME = document.querySelector('.p-nickname').innerText;
let connectedUsers = '';

// открываем соединение websocket
const WS = new WebSocket("WS://localhost:8080/");
// console.log(WS);

WS.onopen = () => {
    console.log('Connected');
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
            if (data.userId !== USER_ID) {
                let pAlert = document.createElement('p');
                pAlert.setAttribute('id', 'alert');
                DIV_ALERT.appendChild(pAlert);
                pAlert.textContent = `Пользователь ${data.nickname} в чате`;

                // убираем надпись по таймеру (3 секунды)
                setTimeout(() =>
                    pAlert.remove(), 3000
                );
            }
            // console.log(data.connectedUsers);
            connectedUsers = data.connectedUsers;
            Object.values(data.connectedUsers).forEach(value => {
                if (value !== USER_ID) {
                    document.getElementById(value).classList.add('div-chat-user-onchat');
                }
            })
            break;
        case 'privateMessage':
            console.log(data);
            if (document.querySelector('.div-user-messages')) {
                if (document.querySelector('.div-user-messages').id === data.sendNickname) {
                    console.log(document.querySelector('.div-user-messages').id)
                    let divUserMessages = document.querySelector('#' + data.sendNickname);
                    let divMessage = document.createElement('div');
                    divMessage.classList.add('div-accept-message');
                    divMessage.setAttribute('id', 'divacceptmessage');
                    divMessage.textContent = data.textMessage;
                    divUserMessages.appendChild(divMessage);
                } else if (document.querySelector('.div-user-messages').id !== data.sendNickname) {
                    console.log(document.querySelector('.div-user-messages').id);
                    console.log(data.sendNickname)
                    document.getElementById(data.sendUserId).classList.add('div-chat-user-onmessage');
                }
            } else {
                let divUserMessages = document.createElement('div');
                divUserMessages.classList.add('div-user-messages');
                divUserMessages.setAttribute('id', data.sendNickname);
                divUserMessages.textContent = `Чат с пользователем ${data.sendNickname}`;
                MAIN_WINDOW.appendChild(divUserMessages);
                let divMessage = document.createElement('div');
                divMessage.classList.add('div-accept-message');
                divMessage.setAttribute('id', 'divacceptmessage');
                divMessage.textContent = data.textMessage;
                divUserMessages.appendChild(divMessage);                
                document.getElementById(data.sendUserId).click();
            }
            break;
        case 'disconnect':
            delete connectedUsers[data.connectId];
            // console.log(connectedUsers);
            let inactiveChatUser = document.getElementById(data.userId);
            inactiveChatUser.classList.remove('div-chat-user-onchat');
            break;
    }
}



// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку)
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e);

        // добавляем/удаляем выделение элемента border
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null;
        e.target.classList.add('div-chat-user-active');

        if (!e.target.classList.contains('div-chat-user-onchat')) {
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;
            document.querySelector('.div-text-message').style.visibility = 'hidden';
            let pAlert = document.createElement('p');
            pAlert.setAttribute('id', 'alert');
            DIV_ALERT.appendChild(pAlert);
            pAlert.textContent = `Пользователь не в чате`;

            // убираем надпись по таймеру (2 секунды)
            setTimeout(() =>
                pAlert.remove(), 2000
            );
        } else {
            // document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null;
            console.log(document.querySelector('.div-user-messages'));
            if (!document.querySelector('.div-user-messages')) {
                let divUserMessages = document.createElement('div');
                divUserMessages.classList.add('div-user-messages');
                divUserMessages.setAttribute('id', e.target.innerText);
                MAIN_WINDOW.appendChild(divUserMessages);
                divUserMessages.textContent = `Чат с пользователем ${e.target.innerText}`;
                document.querySelector('.div-text-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
            } else {
                document.querySelector('.div-text-message').style.visibility = 'visible';
                TEXT_AREA_MESSAGE.focus();
            }

            // console.log(connectedUsers);

            const MESSAGE_SEND = document.querySelector('#messagesend');
            MESSAGE_SEND.addEventListener('click', () => {
                let textMessage = TEXT_AREA_MESSAGE.value;
                TEXT_AREA_MESSAGE.value = '';
                to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
                // console.log(to)
                message = JSON.stringify({
                    command: 'privateMessage',
                    to: to,
                    acceptUserId: e.target.id,
                    sendUserId: USER_ID,
                    sendNickname: USER_NICKNAME,
                    textMessage: textMessage
                });
                WS.send(message);
                let divMessage = document.createElement('div');
                divMessage.classList.add('div-send-message');
                divMessage.setAttribute('id', 'divsendmessage');
                divMessage.textContent = textMessage;
                divUserMessages.appendChild(divMessage);
            });
        }
    }
});