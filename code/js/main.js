const BUTTON_ADD_USER = document.querySelector('#btnadduser')
const DIV_LIST_USERS = document.querySelector('#divlistusers')
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
                    divUser.setAttribute('onclick', 'addUser()')
                    divUser.classList.add('div-user')
                    DIV_LIST_USERS.appendChild(divUser)

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

function addUser() {
    console.log('click')
}