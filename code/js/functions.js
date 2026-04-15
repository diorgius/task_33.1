
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