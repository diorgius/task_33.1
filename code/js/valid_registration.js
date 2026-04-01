const inputemail = document.querySelector('#email')
const inputpassword = document.querySelector('#password')
const inputpasswordagain = document.querySelector('#passwordagain')
const buttonsend = document.querySelector('#send')
const divalert = document.querySelector('.div-alert')

inputemail.addEventListener('change', (e) => {
    validation(e);
});

inputpassword.addEventListener('change', (e) => {
    validation(e);
});

if (inputpasswordagain !== null) {
    inputpasswordagain.addEventListener('change', (e) => {
        validation(e);
    });
}

async function validation(e) {
    // console.log(e.target.id)
    // console.log(e.target.value)
    if (e.target.id === 'email') {
        email = e.target.value
        const emailregexp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailregexp.test(email)) {
            inputemail.classList.add('wrong-data')
            palert = document.createElement('p')
            palert.setAttribute('id', 'alert');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palert)
            palert.textContent = 'Email не валидный'
        } else {
            inputemail.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alert')) {
                palert.textContent = ''
            }

            // посылаем email на бэк и проверяем на есть ли уже такой в базе

            data = { email: email }
            try {
                let response = await fetch('../app/core/CheckData.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                })

                let result = await response.text()
                // console.log('Успех: ', result)
                if (result) {
                    inputemail.classList.add('wrong-data')
                    palert = document.createElement('p')
                    palert.setAttribute('id', 'alert');
                    buttonsend.setAttribute('disabled', '')
                    divalert.appendChild(palert)
                    palert.textContent = result
                }
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        }

    } else if (e.target.id === 'password') {
        pass = e.target.value
        if (pass.length < 8 || pass.length > 20) {
            // console.log('пароль меньше 8 символов')
            inputpassword.classList.add('wrong-data')
            palert = document.createElement('p')
            palert.setAttribute('id', 'alert');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palert)
            palert.textContent = 'Пароль меньше 8 символов или больше 20'
        } else {
            inputpassword.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alert')) {
                palert.textContent = ''
            }
        }

    } else if (e.target.id === 'passwordagain') {
        passagain = e.target.value
        if (pass !== passagain) {
            console.log('пароли не совпадают')
            inputpasswordagain.classList.add('wrong-data')
            palert = document.createElement('p')
            palert.setAttribute('id', 'alert');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palert)
            palert.textContent = 'Пароли не совпадают'
        } else {
            inputpasswordagain.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alert')) {
                palert.textContent = ''
            }
        }
    }
}
