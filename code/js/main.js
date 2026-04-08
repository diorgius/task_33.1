const SIDEBAR = document.querySelector('#aside-sidebar')
const BUTTON_ADD_USER = document.querySelector('#btnadduser')
const DIV_LIST_USERS = document.querySelector('#divlistusers')
const DIV_USER_CHATS = document.querySelector('#divuserchats')
const TEXT_AREA_MESSAGE = document.querySelector('#textareatextmessage')


// маштабируем текстовую область сообщений
let actions = ['input', 'cut', 'paste', 'drop']
if (TEXT_AREA_MESSAGE) {
    actions.forEach((e) => {
        TEXT_AREA_MESSAGE.addEventListener(e, () => {
            TEXT_AREA_MESSAGE.style.height = 'auto'
            TEXT_AREA_MESSAGE.style.height = TEXT_AREA_MESSAGE.scrollHeight + 'px'
        })
    })
}

// выводим список пользователей для добавления в свои контакты
if (BUTTON_ADD_USER) {
    BUTTON_ADD_USER.addEventListener('click', async () => {
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

                let divAddUsers = document.createElement('div')
                DIV_LIST_USERS.appendChild(divAddUsers)
                divAddUsers.setAttribute('id', 'divaddusers')

                result.forEach((item) => {
                    let userId = document.querySelector('#userid').value
                    if (`${item.id}` !== userId) {

                        let divUser = document.createElement('div')
                        divUser.classList.add('div-user')
                        divUser.setAttribute('id', 'divuser_' + `${item.id}`)
                        divAddUsers.appendChild(divUser)
                        divUser.onclick = function () { addUser(userId, item.id, item.nickname, item.avatar) }

                        let divUserAvatar = document.createElement('div')
                        divUser.appendChild(divUserAvatar)
                        let imgUserAvatar = document.createElement('img')
                        let image = item.avatar !== null ? URL + '/avatars/' + item.avatar : URL + '/img/avatar_0.jpg'
                        imgUserAvatar.src = image
                        imgUserAvatar.alt = 'Аватар'
                        imgUserAvatar.width = '40'
                        divUserAvatar.appendChild(imgUserAvatar)

                        let divUserNickname = document.createElement('div')
                        divUserNickname.classList.add('div-user-nickname')
                        divUser.appendChild(divUserNickname)

                        let pUserNickname = document.createElement('p')
                        divUserNickname.appendChild(pUserNickname)
                        pUserNickname.textContent = item.nickname

                        if (item.hideemail === 0) {
                            let pUserEmail = document.createElement('p')
                            divUserNickname.appendChild(pUserEmail)
                            pUserEmail.textContent = item.email
                        }
                    }
                });
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        }
    });
}

// добавляем пользователя в список своих контактов
async function addUser(userId, contactUserId, nickname, avatar) {
    if (!document.getElementById(contactUserId)) {

        // отправляем данные на бэкенд для записи в базу
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

            // добавляем пользователя в боковую панель
            let divChatUser = document.createElement('div')
            divChatUser.classList.add('div-chat-user')
            divChatUser.setAttribute('id', contactUserId)
            DIV_USER_CHATS.appendChild(divChatUser)

            let divChatUserAvatar = document.createElement('div')
            divChatUser.appendChild(divChatUserAvatar)
            let imgChatUserAvatar = document.createElement('img')
            let image = avatar !== null ? URL + '/avatars/' + avatar : URL + '/img/avatar_0.jpg'
            imgChatUserAvatar.src = image
            imgChatUserAvatar.alt = 'Аватар'
            imgChatUserAvatar.width = '35'
            divChatUserAvatar.appendChild(imgChatUserAvatar)

            let divChatUserNickname = document.createElement('div')
            divChatUserNickname.classList.add('div-user-nickname')
            divChatUser.appendChild(divChatUserNickname)

            let pChatUser = document.createElement('p')
            divChatUserNickname.appendChild(pChatUser)
            pChatUser.textContent = nickname

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

// обрабатываем клик на пользователях чата (выделяем пользователя, открываем переписку)
document.body.addEventListener('click', (e) => {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e)

        // варианты переключения классов при клике на #divchatuser
        // 1. с условиями
        // let active = null // объявляем переменную вне функции, чтобы не обнулялась
        // if (active === e.target) {
        //     e.target.classList.toggle('div-chat-user-active');
        // } else {
        //     active === null ? null : active.classList.remove('div-chat-user-active');
        //     e.target.classList.add('div-chat-user-active');
        //     active = e.target;
        //     console.log(active)
        // }
        // 2. цикл forEach
        // elements = document.querySelectorAll('.div-chat-user'); // перебираем все элементы верхнего класса
        // elements = document.querySelectorAll('.div-chat-user-active'); // сразу ищем нужный класс
        // elements.forEach(elem => {elem.classList.remove('div-chat-user-active')})
        // console.log(elements)
        // 3. то же с циклом for...of
        // for (const element of elements) {
        //      element.classList.remove('div-chat-user-active')
        // }

        // остановился на этом варианте,  думаю в данном случае самый оптимальный 
        let divChatUserActive = document.querySelector('.div-chat-user-active');
        divChatUserActive != null ? divChatUserActive.classList.remove('div-chat-user-active') : null 
        // console.log(element)
        e.target.classList.add('div-chat-user-active');



    }
});

// обрабатываем меню по клику правой кнопки на пользователях чата
document.body.addEventListener('contextmenu', (e) => {
    // document.body.addEventListener('contextmenu', function contextMenu(e) {
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e.target.id)
        e.preventDefault()
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
        CHAT_USER_MENU.display = 'block'
        CHAT_USER_MENU.top = `${e.layerY}px`
        CHAT_USER_MENU.left = `${e.layerX}px`
        e.target.setAttribute('style', 'border: .1rem solid #007bff')

        // удаляем пользователя из списка чатов
        let delChatUser = document.querySelector('#deletechatuser')
        delChatUser.addEventListener('click', async () => {
            // delChatUser.addEventListener('click', async function clickDeleteChatUser() {
            let userId = document.querySelector('#userid').value
            // console.log(e.target.id)

            // при клике на меню deletechatuser на разных пользователях накапливались события и происходило
            // последовательное самостоятельное удаление всех пользователей на которых был сделан клик
            // для того что бы при клике события не накапливались (данные не дублировались, не происходило удаление),
            // надо после каждого клика (считанного события) удалять EventListener, но удалить его можно только если на событие 
            // вызывается именованая функция или можно использовать опцию once
            // после вызываемой функции добавляем третьим аргументом ,{ capture: false, once: true })

            // !!! (ПРОБЛЕММА ПОКА НЕ РЕШЕНА) выяснилась еще одна проблемма, теперь еще и просто при клите правой кнопкой на deletechatuser
            // и при последующем удаление пользователя
            // также происходит и удаление тех пользователей на которые был просто клик правой кнопкой,
            // если добавить в функцию клика contextmenu опцию once, то дальнейшие клики по элементам не отрабатываются

            // delChatUser.removeEventListener('click', clickDeleteChatUser)

            data = {
                action: 'deleteContact',
                'userId': userId,
                'contactUserId': e.target.id
            }

            // e.target.removeEventListener('contextmenu', contextMenu)

            // console.log(data)
            // return

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
                let nickname = e.target.lastElementChild.lastElementChild.innerHTML
                document.getElementById(`${e.target.id}`) ? document.getElementById(`${e.target.id}`).remove() : null
                let pAlert = document.createElement('p')
                pAlert.setAttribute('id', 'alert')
                DIV_ALERT.appendChild(pAlert)
                pAlert.textContent = `Пользователь ${nickname} успешно удален из списка чатов`

                // убираем надпись по таймеру (2 секунды)
                setTimeout(() =>
                    pAlert.remove(), 2000
                )
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        },
            // для остановки EventListener опция once: true
            {
                capture: false, once: true
            })

        // удаляем чаты с пользователем
        let delUserChats = document.querySelector('#deleteuserchats')
        delUserChats.addEventListener('click', () => {
            console.log(e.target.id)
            // здесь будем удалять чаты пользователя


        },
            // для остановки EventListener опция once: true
            {
                capture: false, once: true
            })

        // убираем меню по клику в любом месте документа
        window.addEventListener('click', () => {
            document.querySelector('.ul-chat-user-menu').style.display = 'none'
            e.target.setAttribute('style', 'border: .1rem solid #cccccc')

        });

        // убираем меню по клавише escape
        window.addEventListener('keydown', (press) => {
            if (press.key === 'Escape') {
                document.querySelector('.ul-chat-user-menu').style.display = 'none'
                e.target.setAttribute('style', 'border: .1rem solid #cccccc')
            }
        });
    }
    // },
    // // для остановки EventListener опция once: true
    // // если добавляем здесь, то меню срабатывает только 1 раз
    // {
    //     capture: false, once: true 
})


// if (document.querySelector('.div-chat-user')) {

//     let divChatUser = document.querySelectorAll('.div-chat-user')
//     console.log(divChatUser)

//     divChatUser.forEach(elem => {elem.addEventListener('click', (e) => {
//         e.preventDefault()
//         console.log(elem)
//     })})

//      // при таком подходе не отрабатывается на вновь добавленных элементах,
//      // только на тех которые были на момент загрузки страницы

//     divChatUser.forEach(elem => {elem.addEventListener('contextmenu', (e) => {
//         e.preventDefault()
//         console.log(e)
//         const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu').style
//         CHAT_USER_MENU.display = 'block'
//         CHAT_USER_MENU.top = `${e.layerY}px`
//         CHAT_USER_MENU.left = `${e.layerX}px`

//         let delChatUser = document.querySelector('#deletechatuser')
//         delChatUser.addEventListener('click', async () => {
//             let userId = document.querySelector('#userid').value
//             console.log(e)
//             deleteChatUser(userId, `${e.target.id}`)

//             // data = {
//             //     action: 'deleteContact',
//             //     'userId': userId,
//             //     'contactUserId': `${e.target.id}`
//             // }
//             // try {
//             //     let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
//             //         method: 'POST',
//             //         headers: {
//             //             'Content-Type': 'application/json;charset=utf-8'
//             //         },
//             //         body: JSON.stringify(data)
//             //     })
//             //     let result = await response.text()
//             //     // console.log('Успех: ', result)
//             //     document.getElementById(`${e.target.id}`).remove()
//             //     let pAlert = document.createElement('p')
//             //     pAlert.setAttribute('id', 'alert')
//             //     DIV_ALERT.appendChild(pAlert)
//             //     pAlert.textContent = 'Пользователь успешно удален'
//             //     // убираем надпись по таймеру (2 секунды)
//             //     setTimeout(() =>
//             //         pAlert.remove(), 2000
//             //     )
//             // } catch (error) {
//             //     console.log('Ошибка: ', error)
//             // }
//         })
//     })})
// }