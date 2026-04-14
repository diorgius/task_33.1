const USER_ID = document.querySelector('#userid').value;
const USER_NICKMAME = document.querySelector('.p-nickname').innerText;
const OBJECT_CONNECTED_USERS = new Map();

// открываем соединение websocket
const WS = new WebSocket("WS://localhost:8080/");
// console.log(WS);

WS.onopen = () => {
    console.log('Connected');
    WS.send(JSON.stringify({
        command: 'connect',
        userId: USER_ID,
        nickname: USER_NICKMAME
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
    console.log('Received:', data);
    switch (data.command) {
        case 'connect':
            OBJECT_CONNECTED_USERS.set(data.connectId, data);
            console.log(OBJECT_CONNECTED_USERS);
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
            
            // let activeChatUser = document.getElementById(data.userId);
            console.log(data.connectedUsers);
            // console.log(data.connectedUsers[parseInt(data.connectId)]);
            // let userConnectedId = data.connectedUsers[parseInt(data.connectId)];
            // console.log('userConnectedId - ' + userConnectedId);
            // document.getElementById(userConnectedId).classList.add('div-chat-user-onchat');

            // Object.keys(data.connectedUsers).forEach(key => {
            //     console.log(`${key}: ${data.connectedUsers[key]}`)
            // })

            Object.values(data.connectedUsers).forEach(value => {
                if (value !== USER_ID) {
                    console.log('Условие выполняется');
                    console.log(typeof value + ' - ' + value);
                    console.log(typeof data.userId + ' - ' + data.userId);
                    console.log(document.getElementById(value));
                    document.getElementById(value).classList.add('div-chat-user-onchat');
                } else {
                    console.log('Условие невыполняется');
                    console.log(typeof value + ' - ' + value);
                    console.log(typeof data.userId + ' - ' + data.userId);
                }
            })

            // counter = 0;
            // for (let user in data.connectedUsers) {
            //     console.log("key - " + user + " value - " + data.connectedUsers[user]);
            //     counter++;
            //     if (data.connectedUsers[user] !== data.userId) {
            //         document.getElementById(data.connectedUsers[user]).classList.add('div-chat-user-onchat');
            //     }
            // }
            // console.log(counter);
            break;
        case 'message':
            break;
        case 'disconnect':
            OBJECT_CONNECTED_USERS.delete(data.connectId);
            // console.log(OBJECT_CONNECTED_USERS)
            let inactiveChatUser = document.getElementById(data.userId);
            inactiveChatUser.classList.remove('div-chat-user-onchat');
            break;
    }

    // if (!document.querySelector('#divusermessages')) {
    //     console.log(document.querySelector('#divusermessages'));
    //     let divUserMessages = document.createElement('div');
    //     divUserMessages.classList.add('div-user-messages');
    //     divUserMessages.setAttribute('id', 'divusermessages');
    //     divUserMessages.textContent = `Чат с пользователем ${data.contactNickname}`;
    //     MAIN_WINDOW.appendChild(divUserMessages);
    //     document.getElementById(`${data.contactId}`).click();
    // }

    // let divUserMessages = document.querySelector('#divusermessages');
    // let divMessage = document.createElement('div');
    // divMessage.classList.add('div-accept-message');
    // divMessage.setAttribute('id', 'divacceptmessage');
    // divMessage.textContent = data.textMessage;
    // divUserMessages.appendChild(divMessage);
}



// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку)
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e);

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
            let nickname = document.querySelector('.p-nickname').innerText;
            let textMessage = TEXT_AREA_MESSAGE.value;
            TEXT_AREA_MESSAGE.value = '';
            message = JSON.stringify({
                'to': `${e.target.id}`,
                'contactId': USER_ID,
                'contactNickname': nickname,
                'textMessage': textMessage
            });
            WS.send(message);
            let divMessage = document.createElement('div');
            divMessage.classList.add('div-send-message');
            divMessage.setAttribute('id', 'divsendmessage');
            divMessage.textContent = textMessage;
            divUserMessages.appendChild(divMessage);
        });
    }
});