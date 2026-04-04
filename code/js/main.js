const BUTTON_ADD_USER = document.querySelector('#btnadduser')
const DIV_LIST_USERS = document.querySelector('#divlistusers')
const DIV_USER_CHATS = document.querySelector('#divuserchats')
let textareaMessage = document.querySelector('#textareatextmessage')
let actions = ['input', 'cut', 'paste', 'drop']

actions.forEach((e) => {
    textareaMessage.addEventListener(e, () => {
        textareaMessage.style.height = 'auto'
        textareaMessage.style.height = textareaMessage.scrollHeight + 'px'
    })
})

BUTTON_ADD_USER.addEventListener('click', async (e) => {

    data = { action: 'getAllUsers' }
    try {
        let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(data)
        })

        let result = await response.json()
        console.log('Успех: ', result)
        if (result) {
            result.forEach(item => {
                let userId = document.querySelector('#userid').value
                // console.log(userId)
                if (`${item.id}` !== userId) {
                    let divUser = document.createElement('div')
                    divUser.setAttribute('id', 'divuser')
                    divUser.classList.add('div-user')
                    DIV_LIST_USERS.appendChild(divUser)
                    divUser.onclick = function () { addUser(`${item.id}`, `${item.nickname}`, `${item.avatar}`) }

                    let divUserAvatar = document.createElement('div')
                    divUser.appendChild(divUserAvatar)

                    let imgUserAvatar = document.createElement('img')
                    imgUserAvatar.src = URL + '/avatars/' + `${item.avatar}`
                    imgUserAvatar.alt = 'Аватар'
                    imgUserAvatar.width = '40'
                    divUserAvatar.appendChild(imgUserAvatar)

                    let divUserNickname = document.createElement('div')
                    divUserNickname.classList.add('div-user-nickname')
                    divUser.appendChild(divUserNickname)

                    let pUserNickname = document.createElement('p')
                    divUserNickname.appendChild(pUserNickname)
                    pUserNickname.textContent = `${item.nickname}`

                    if (`${item.hideemail}` === '0') {
                        let pUserEmail = document.createElement('p')
                        divUserNickname.appendChild(pUserEmail)
                        pUserEmail.textContent = `${item.email}`
                    }
                    BUTTON_ADD_USER.setAttribute('disabled', '')
                }
            });

        }
    } catch (error) {
        console.log('Ошибка: ', error)
    }
});

function addUser(id, nickname, avatar) {

    // здесь отправляем данные на бэк для записи в базу

    // здесь добавляем пользователя в боковую панель
    if (!document.getElementById(nickname)) {
        let divChatUser = document.createElement('div')
        divChatUser.setAttribute('id', 'divchatuser')
        divChatUser.classList.add('div-chat-user')
        DIV_USER_CHATS.appendChild(divChatUser)

        let divChatUserAvatar = document.createElement('div')
        divChatUser.appendChild(divChatUserAvatar)
        let imgChatUserAvatar = document.createElement('img')
        imgChatUserAvatar.src = URL + '/avatars/' + avatar
        imgChatUserAvatar.alt = 'Аватар'
        imgChatUserAvatar.width = '35'
        divChatUserAvatar.appendChild(imgChatUserAvatar)

        let divChatUserNickname = document.createElement('div')
        divChatUserNickname.classList.add('div-user-nickname')
        divChatUser.appendChild(divChatUserNickname)

        let pChatUser = document.createElement('p')
        pChatUser.setAttribute('id', nickname)
        divChatUserNickname.appendChild(pChatUser)
        pChatUser.textContent = nickname
    } else {
        let pAlert = document.createElement('p')
        pAlert.setAttribute('id', 'alert')
        DIV_ALERT.appendChild(pAlert)
        pAlert.textContent = 'Пользователь ' + nickname + ' уже в списке чатов'
        // убираем надпись по таймеру (3 секунды)
        setTimeout(() => 
            pAlert.remove(), 3000
        )
    }
}
