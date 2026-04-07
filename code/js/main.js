const SIDEBAR = document.querySelector('#aside-sidebar')
const BUTTON_ADD_USER = document.querySelector('#btnadduser')
const DIV_LIST_USERS = document.querySelector('#divlistusers')
const DIV_USER_CHATS = document.querySelector('#divuserchats')
const TEXT_AREA_MESSAGE = document.querySelector('#textareatextmessage')
let actions = ['input', 'cut', 'paste', 'drop']

if (TEXT_AREA_MESSAGE) {
    actions.forEach((e) => {
        TEXT_AREA_MESSAGE.addEventListener(e, () => {
            TEXT_AREA_MESSAGE.style.height = 'auto'
            TEXT_AREA_MESSAGE.style.height = TEXT_AREA_MESSAGE.scrollHeight + 'px'
        })
    })
}

if (BUTTON_ADD_USER) {
    BUTTON_ADD_USER.addEventListener('click', async (e) => {
        if (document.querySelector('#divaddusers')) {
            BUTTON_ADD_USER.textContent = 'Добавить пользователей'
            document.querySelector('#divaddusers').remove()
        } else {
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей'
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
                // console.log('Успех: ', result)
                if (result) {
                    let divAddUsers = document.createElement('div')
                    DIV_LIST_USERS.appendChild(divAddUsers)
                    divAddUsers.setAttribute('id', 'divaddusers')
                    result.forEach(item => {
                        let userId = document.querySelector('#userid').value
                        if (`${item.id}` !== userId) {
                            let divUser = document.createElement('div')
                            divUser.classList.add('div-user')
                            divUser.setAttribute('id', 'divuser_' + `${item.id}`)
                            divAddUsers.appendChild(divUser)
                            divUser.onclick = function () { addUser(userId, `${item.id}`, `${item.nickname}`, `${item.avatar}`) }
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
                        }
                    });
                }
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        }
    });
}

async function addUser(userId, contactUserId, nickname, avatar) {
    if (!document.getElementById(contactUserId)) {

        // отправляем данные на бэк для записи в базу
        data = {
            action: 'createContact',
            'userId': userId,
            'contactUserId': contactUserId
        }
        try {
            let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            })
            let result = await response.text()
            // console.log('Успех: ', result)
            // надо здесь подумать над возвратом данных, такое условие не работает, потому-что в result, все равно возвращается что-то и это условие не работает
            if (result) {

                // добавляем пользователя в боковую панель
                let divChatUser = document.createElement('div')
                divChatUser.classList.add('div-chat-user')
                divChatUser.setAttribute('id', contactUserId)
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
                // pChatUser.setAttribute('id', contactUserId)
                divChatUserNickname.appendChild(pChatUser)
                pChatUser.textContent = nickname
            } else {

                // let pAlert = document.createElement('p')
                // pAlert.setAttribute('id', 'alert')
                // DIV_ALERT.appendChild(pAlert)
                // pAlert.textContent = 'Пользователь ' + nickname + ' уже в списке чатов'
                // // убираем надпись по таймеру (2 секунды)
                // setTimeout(() =>
                //     pAlert.remove(), 2000
                // )

            }
        } catch (error) {
            console.log('Ошибка: ', error)
        }
    } else {
        let pAlert = document.createElement('p')
        pAlert.setAttribute('id', 'alert')
        DIV_ALERT.appendChild(pAlert)
        pAlert.textContent = 'Пользователь ' + nickname + ' уже в списке чатов'
        // убираем надпись по таймеру (2 секунды)
        setTimeout(() =>
            pAlert.remove(), 2000
        )
    }
}

document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        e.target.setAttribute('style', 'border: .1rem solid #007bff')

        // здесь будем обрабатывать вывод чатов с пользователем

    }
});

document.body.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        e.preventDefault()
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
        CHAT_USER_MENU.display = 'block'
        CHAT_USER_MENU.top = `${e.layerY}px`
        CHAT_USER_MENU.left = `${e.layerX}px`

        let delChatUser = document.querySelector('#deletechatuser')
        delChatUser.addEventListener('click', async () => {
            let userId = document.querySelector('#userid').value
            data = {
                action: 'deleteContact',
                'userId': userId,
                'contactUserId': `${e.target.id}`
            }
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                })
                let result = await response.text()
                // console.log('Успех: ', result)
                document.getElementById(`${e.target.id}`).remove()
                let pAlert = document.createElement('p')
                pAlert.setAttribute('id', 'alert')
                DIV_ALERT.appendChild(pAlert)
                pAlert.textContent = 'Пользователь успешно удален'
                // убираем надпись по таймеру (2 секунды)
                setTimeout(() =>
                    pAlert.remove(), 2000
                )
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        })

        let delUserChats = document.querySelector('#deleteuserchats')
        delUserChats.addEventListener('click', () => {
            
            // здесь будем удалять чаты пользователя

        })
    }
});

// убираем меню по клику в любом месте документа
window.addEventListener('click', () => {
    document.querySelector('.ul-chat-user-menu').style.display = 'none'
});

// убираем меню по клавише escape
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.ul-chat-user-menu').style.display = 'none'
    }
});