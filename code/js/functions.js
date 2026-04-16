
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
function outputMessage(location, type, msg) {
    console.log(msg);
    let divMessage = document.createElement('div');
    divMessage.classList.add(`div-${type}-message`);
    if (type === 'accept') {
        divMessage.setAttribute('id', msg.message_id);
        divMessage.textContent = msg.textMessage + msg.created;
    } else {

        divMessage.setAttribute('id', 'divsendmessage');
        divMessage.textContent = msg;
    }
    location.appendChild(divMessage);
}
