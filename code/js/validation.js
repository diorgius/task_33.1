const URL = window.location.protocol + '//' + window.location.host
const FILE_SIZE = 100000
const FILE_TYPE = ['image/jpeg', 'image/png', 'image/gif', 'image/avif']
const INPUTE_MAIL = document.querySelector('#email')
const INPUT_PASSWORD = document.querySelector('#password')
const INPUT_PASSWORD_AGAIN = document.querySelector('#passwordagain')
const BUTTON_SEND = document.querySelector('#send')
const DIV_ALERT = document.querySelector('.div-alert')
const INPUT_NICKNAME = document.querySelector('#nickname')
const INPUT_FILE_AVATAR = document.querySelector('#fileavatar')

if (INPUTE_MAIL !== null) {
    INPUTE_MAIL.addEventListener('change', (e) => {
        if (document.querySelector('#alert') !== null) pAlert.remove()
        validation(e)
    })
}

if (INPUT_PASSWORD !== null) {
    INPUT_PASSWORD.addEventListener('change', (e) => {
        if (document.querySelector('#alert') !== null) pAlert.remove()
        validation(e)
    })
}

if (INPUT_PASSWORD_AGAIN !== null) {
    INPUT_PASSWORD_AGAIN.addEventListener('change', (e) => {
        if (document.querySelector('#alert') !== null) pAlert.remove()
        validation(e)
    })
}

if (INPUT_NICKNAME !== null) {
    INPUT_NICKNAME.addEventListener('change', (e) => {
        if (document.querySelector('#alert') !== null) pAlert.remove()
        validation(e)
    })
}

if (INPUT_FILE_AVATAR !== null) {
    INPUT_FILE_AVATAR.addEventListener('change', (e) => {
        if (document.querySelector('#alert') !== null) pAlert.remove()
        validation(e)
    })
}

async function validation(e) {
    if (e.target.id === 'email') {
        email = e.target.value
        const emailregexp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailregexp.test(email)) {
            INPUTE_MAIL.classList.add('wrong-data')
            let pAlert = document.createElement('p')
            pAlert.setAttribute('id', 'alert')
            BUTTON_SEND.setAttribute('disabled', '')
            DIV_ALERT.appendChild(pAlert)
            pAlert.textContent = 'Email не валидный'
        } else {
            INPUTE_MAIL.classList.remove('wrong-data')
            BUTTON_SEND.removeAttribute('disabled')

            // посылаем email на бэкенд и проверяем на есть ли уже такой в базе

            data = { email: email }
            try {
                let response = await fetch(URL + '/app/core/CheckData.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/jsoncharset=utf-8'
                    },
                    body: JSON.stringify(data)
                })

                let result = await response.text()
                // console.log('Успех: ', result)
                if (result) {
                    INPUTE_MAIL.classList.add('wrong-data')
                    pAlert = document.createElement('p')
                    pAlert.setAttribute('id', 'alert')
                    BUTTON_SEND.setAttribute('disabled', '')
                    DIV_ALERT.appendChild(pAlert)
                    pAlert.textContent = result
                } else {
                    INPUTE_MAIL.classList.remove('wrong-data')
                    BUTTON_SEND.removeAttribute('disabled')
                }
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        }

    } else if (e.target.id === 'password') {
        pass = e.target.value
        if (pass.length < 8 || pass.length > 20) {
            INPUT_PASSWORD.setAttribute('style', 'border: .1rem solid #ff0000')
            // INPUT_PASSWORD.classList.add('wrong-data')
            let pAlert = document.createElement('p')
            pAlert.setAttribute('id', 'alert')
            BUTTON_SEND.setAttribute('disabled', '')
            DIV_ALERT.appendChild(pAlert)
            pAlert.textContent = 'Пароль меньше 8 символов или больше 20'
        } else {
            INPUT_PASSWORD.classList.remove('wrong-data')
            BUTTON_SEND.removeAttribute('disabled')
        }

    } else if (e.target.id === 'passwordagain') {
        passagain = e.target.value
        if (pass !== passagain) {
            INPUT_PASSWORD_AGAIN.classList.add('wrong-data')
            let pAlert = document.createElement('p')
            pAlert.setAttribute('id', 'alert')
            BUTTON_SEND.setAttribute('disabled', '')
            DIV_ALERT.appendChild(pAlert)
            pAlert.textContent = 'Пароли не совпадают'
        } else {
            INPUT_PASSWORD_AGAIN.classList.remove('wrong-data')
            BUTTON_SEND.removeAttribute('disabled')
        }
    } else if (e.target.id === 'nickname') {
        nickname = e.target.value
        data = { nickname: nickname }
        try {
            let response = await fetch(URL + '/app/core/CheckData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/jsoncharset=utf-8'
                },
                body: JSON.stringify(data)
            })

            let result = await response.text()
            if (result) {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #ff0000')
                let pAlert = document.createElement('p')
                pAlert.setAttribute('id', 'alert')
                BUTTON_SEND.setAttribute('disabled', '')
                DIV_ALERT.appendChild(pAlert)
                pAlert.textContent = result
            } else {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #007bff')
                BUTTON_SEND.removeAttribute('disabled')
            }
        } catch (error) {
            console.log('Ошибка: ', error)
        }
    } else if (e.target.id === 'fileavatar') {
        fileavatar = e.target.files[0].name
        if (e.target.files[0].size > FILE_SIZE) {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #ff0000')
            let pAlert = document.createElement('p')
            pAlert.setAttribute('id', 'alert')
            BUTTON_SEND.setAttribute('disabled', '')
            DIV_ALERT.appendChild(pAlert)
            pAlert.textContent = 'Файл больше возможного для загрузки размера'
        } else if (!FILE_TYPE.includes(e.target.files[0].type)) {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #ff0000')
            let pAlert = document.createElement('p')
            pAlert.setAttribute('id', 'alert')
            BUTTON_SEND.setAttribute('disabled', '')
            DIV_ALERT.appendChild(pAlert)
            pAlert.textContent = 'Неподдерживаемый тип изображения'
        } else {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #007bff')
            BUTTON_SEND.removeAttribute('disabled')
        }
    }
}