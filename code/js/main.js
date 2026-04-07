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
        // console.log('Нажатие на динамический элемент:', e);
        e.target.setAttribute('style', 'border: .1rem solid #007bff')

    }
});

document.body.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        console.log('Нажатие на динамический элемент правой кнопкой:', e.target.id)
        e.preventDefault()
        let divChatUserMenu = document.createElement('div')
        SIDEBAR.appendChild(divChatUserMenu)
        divChatUserMenu.innerHTML = 
        `<ul ul class="ul-chat-user-menu" >
            <li><a href="#" id="deletechatuser">Удалить пользователя из списка чатов</a></li>
            <li><a href="#" id="deleteuserchat">Удалить чаты с пользователем</a></li>
        </ul>`
        // let ulChatUserMenu = document.createElement('ul')
        // ulChatUserMenu.classList.add('ul-chat-user-menu')
        // SIDEBAR.appendChild(ulChatUserMenu)
        // liChatUserMenu_1 = document.createElement('li')
        // liChatUserMenu_1.setAttribute('id', 'deletechatuser')
        // liChatUserMenu_1.textContent = 'Удалить пользователя из списка чатов'
        // liChatUserMenu_1.onclick = function () { deleteChatUser(e.target.id) }
        // liChatUserMenu_2 = document.createElement('li')
        // liChatUserMenu_1.setAttribute('id', 'deleteuserchat')
        // liChatUserMenu_2.textContent = 'Удалить чаты с пользователем'
        // ulChatUserMenu.append(liChatUserMenu_1, liChatUserMenu_2)

        //<ul ul class="ul-chat-user-menu" >
        //     <li><a href="#" id="deletechatuser">Удалить пользователя из списка чатов</a></li>
        //     <li><a href="#" id="deleteuserchat">Удалить чаты с пользователем</a></li>
        // </ul>

        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
        CHAT_USER_MENU.display = 'block'
        CHAT_USER_MENU.top = `${e.layerY}px`
        CHAT_USER_MENU.left = `${e.layerX}px`
    }
});



window.addEventListener('click', () => {
    document.querySelector('.ul-chat-user-menu').style.display = 'none'
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelector('.ul-chat-user-menu').style.display = 'none'
    }
});

function deleteChatUser(contactUserId) {
    console.log(contactUserId)
}


// if (document.querySelector('.div-chat-user')) {

//     let divChatUser = document.querySelectorAll('.div-chat-user')
//     console.log(divChatUser)

//     divChatUser.forEach(elem => {elem.addEventListener('click', (e) => {
//         e.preventDefault()
//         console.log(elem)
//     })})

//     divChatUser.forEach(elem => {elem.addEventListener('contextmenu', (e) => {
//         e.preventDefault()
//         console.log(elem)

//     })})
// }