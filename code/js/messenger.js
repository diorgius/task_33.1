const NOTICE = new Audio('../../img/notice.mp3');
const DELETEMESSAGE = new Audio('../../img/deletemessage.mp3');
let connectedUsers = '';

// открываем соединение websocket
const WS = new WebSocket("WS://localhost:8080/");

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
            // проверяем есть ли у пользователя присоединившийся контакт и выделяем присоединившегося пользователя цветом, 
            Object.values(connectedUsers).forEach(value => {
                if (value !== USER_ID) {
                    document.getElementById(value) ? document.getElementById(value).classList.add('div-chat-user-onchat') : null;
                }
            })
            break;
        case 'addedToContacts':
            // при получении сообщения о добавлении в чей-то контакт, вызываем функцию
            // добавления контакта этого пользователя в контакты добавленного пользователя
            addContactIntoSidebar(USER_ID, data.send_user_id, data.email, data.nickname, data.avatar);
            // отмечаем, что пользователь в чате
            document.getElementById(data.send_user_id).classList.add('div-chat-user-onchat');
            // отмечаем, что есть сообщение
            document.getElementById(data.send_user_id).classList.add('div-chat-user-onmessage');
            break;
        case 'privateMessage':
            // вызываем функцию вывода сообщений
            showMessage(data, 'private');
            break;
        case 'replay':
            // добавлена отправка сообщения отправителю после отправки сообщения адресату
            // для того чтобы получить id, дату, время сообщения из БД и вывести это в сообщении
            // вызываем функцию для вывода себе сообщения, отправленного адресату
            let divUserMessages = document.querySelector('.div-user-messages');
            outputMessage(divUserMessages, data, 'private');
            break;
        case 'deleteContact':
            // удаляем чат если он открыт
            document.getElementById(data.send_nickname) ? document.getElementById(data.send_nickname).remove() : null;
            // удаляем пользователя из списка контактов
            document.getElementById(data.send_user_id).remove();
            // выводим сообщение об удалении
            alertMessage(`Пользователь ${data.send_nickname} удалил Ваш контакт`);
            break;
        case 'deleteAllMessages':
            // удаляем чат если он открыт
            document.getElementById(data.send_nickname) ? document.getElementById(data.send_nickname).remove() : null;
            // выводим сообщение об удалении всей переписки
            alertMessage(`Пользователь ${data.send_nickname} удалил все сообщения`);
            break;
        case 'deleteMessage':
            // проверяем открыт ли чат с пользователем удалившим сообщение
            if (document.getElementById(data.accept_name)) {
                // заменяем текст удаленного сообщения
                let divUserMessage = document.getElementById(data.id);
                data.chat_type === 'group' ? divUserMessage.childNodes[0].textContent = data.send_nickname : null;
                divUserMessage.childNodes[1].textContent = data.text_message;
                divUserMessage.lastChild.textContent = data.status_message;
                DELETEMESSAGE.play();
            }
            break;
        case 'editMessage':
            // проверяем открыт ли чат с пользователем изменившим сообщение
            if (document.getElementById(data.accept_name)) {
                let divUserMessage = document.getElementById(data.id);
                // изменяем текст сообщение
                data.chat_type === 'group' ? divUserMessage.childNodes[0].textContent = data.send_nickname : null;
                divUserMessage.childNodes[1].textContent = data.text_message;
                divUserMessage.lastChild.textContent = data.status_message;
            }
            break;
        case 'addedToGroup':
            // выводим сообщение о добавлении в группу
            alertMessage(data.alert);
            // вызываем функцию добавления группы в левую панель у пользователя добавленного в группу 
            data.forUser ? addGroupIntoSidebar(data.group_id, data.group_name) : null;
            break;
        case 'groupMessage':
            // вызываем функцию вывода сообщения
            showMessage(data, 'group');
            break;
        case 'leaveGroup':
            // выводим сообщение, что создатель группы не может ее покинуть
            alertMessage(data.alert);
            if (data.leaveGroup) {
                alertMessage(data.alert);
                // если открыт чат с удаленной группой, закрываем его
                document.getElementById(data.group_name) ? document.getElementById(data.group_name).remove() : null;
                // скрываем текстовую область
                document.querySelector('.div-text-send-message').style.visibility = 'hidden';
                // убираем элемент группы
                document.getElementById(data.group_id).remove();
            }
            break;
        case 'deleteGroupUser':
            // выводим сообщение, что только создатель группы может удалять из нее пользователей
            alertMessage(data.alert);
            // удалеяем элемент удаленного пользователя
            data.forAdmin ? document.getElementById(`divuser_${data.contact_id}`).remove() : null;
            if (data.deleteGroupUser) {
                alertMessage(data.alert);
                // если открыт чат с удаленной группой, закрываем его
                document.getElementById(data.group_name) ? document.getElementById(data.group_name).remove() : null;
                // скрываем текстовую область
                document.querySelector('.div-text-send-message').style.visibility = 'hidden';
                // убираем элемент группы
                document.getElementById(data.group_id).remove();
            }
            break;
        case 'deleteGroup':
            // выводим сообщение об удалении
            alertMessage(data.alert);
            // удаляем группу из левой панели
            data.deleted ? document.getElementById(data.group_id).remove() : null;
            break;
        case 'disconnect':
            // если пользователь отключается, то удаляем его из списка активных пользователей
            delete connectedUsers[data.connectId];
            // проверяем есть ли у пользователя такой контакт и убираем отметку об активности пользователя
            if (document.getElementById(data.userId)) {
                let inactiveChatUser = document.getElementById(data.userId);
                inactiveChatUser.classList.remove('div-chat-user-onchat');
            }
            break;
    }
}

// обрабатываем клик на пользователях чата (выделяем пользователя, загружаем ранние сообщения из БД)
document.body.addEventListener('click', async (e) => {
    // клик на пользователе или группе
    if (e.target.classList.contains('div-chat-user') || e.target.classList.contains('div-chat-group')) {
        // определяем тип чата
        e.target.classList.contains('div-chat-user') ? chatType = 'private' : chatType = 'group';
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatUserActive = document.querySelector('.div-chat-active');
        divChatUserActive !== null ? divChatUserActive.classList.remove('div-chat-active') : null;
        e.target.classList.add('div-chat-active');
        // вызываем функцию закрытия окон
        closeWindow();
        // при клике на пользователе/группе проверяем есть ли открытый чат или, если это не чат 
        // с пользователем/группой на котором кликнули создаем новый с кликнутым пользователем
        if (!document.querySelector('.div-user-messages') || document.querySelector('.div-user-messages').id !== e.target.innerText) {
            // если у пользователя есть полученные и непрочитанные сообщения от других пользователей - убираем выделение цветом
            document.getElementById(e.target.id).classList.remove('div-chat-user-onmessage');
            // создаем див в котором будут отображаться принятые/отправленные сообщения этого пользователя/группы
            createDivUserMessages(e.target.innerText, chatType);
            // выводим ранние сообщения из БД
            // готовим данные для отправки на бэкенд
            // если чат приватный
            if (chatType === 'private') {
                data = {
                    action: 'getUserMessages',
                    send_user_id: USER_ID,
                    accept_user_id: e.target.id,
                    chat_type: 'private'
                };
                // если чат групповой
            } else if (chatType === 'group') {
                data = {
                    action: 'getUserMessages',
                    send_user_id: USER_ID,
                    accept_group_id: e.target.id,
                    chat_type: 'group'
                };
            }
            // отправляем запрос на бэкенд для загрузки ранних сообщений и выводим сообщения               
            getUserMessages(data, chatType);
            // активируем поле ввода сообщения
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
                // готовим сообщение
                // если чат приватный
                if (chatType === 'private') {
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
                    message = JSON.stringify({
                        command: 'privateMessage',
                        to: to,
                        accept_user_id: e.target.id,
                        accept_nickname: e.target.innerText,
                        send_user_id: USER_ID,
                        send_nickname: USER_NICKNAME,
                        text_message: textSendMessage
                    });
                    // если чат групповой
                } else if (chatType === 'group') {
                    message = JSON.stringify({
                        command: 'groupMessage',
                        group_id: e.target.id,
                        group_name: e.target.innerText,
                        send_user_id: USER_ID,
                        send_nickname: USER_NICKNAME,
                        text_message: textSendMessage
                    });
                }
                // посылаем сообщение
                WS.send(message);
                TEXT_AREA_MESSAGE.focus();
            }
        }
        // }
    }
    // если клик по крестику в хидере чата - закрываем чат
    if (e.target.id === 'spanchatclose') {
        document.querySelector('.div-user-messages').remove();
        document.querySelector('.div-chat-active').classList.remove('div-chat-active');
        document.querySelector('.div-text-send-message').style.visibility = 'hidden';
    }
});