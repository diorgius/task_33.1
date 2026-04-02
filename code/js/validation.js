const filesize = 100000
const filetype = ['image/jpeg', 'image/png', 'image/gif', 'image/avif']
const inputemail = document.querySelector('#email')
const inputpassword = document.querySelector('#password')
const inputpasswordagain = document.querySelector('#passwordagain')
const buttonsend = document.querySelector('#send')
const divalert = document.querySelector('.div-alert')
const divalertprofile = document.querySelector('.div-alert-profile')
const inputnickname = document.querySelector('#nickname')
const inputfileavatar = document.querySelector('#fileavatar')

if (inputemail !== null) {
    inputemail.addEventListener('change', (e) => {
        validation(e);
    });
}

if (inputpassword !== null) {
    inputpassword.addEventListener('change', (e) => {
        validation(e);
    });
}

if (inputpasswordagain !== null) {
    inputpasswordagain.addEventListener('change', (e) => {
        validation(e);
    });
}

if (inputnickname !== null) {
    inputnickname.addEventListener('change', (e) => {
        validation(e);
    });
}

if (inputfileavatar !== null) {
    inputfileavatar.addEventListener('change', (e) => {
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
            palertemail = document.createElement('p')
            palertemail.setAttribute('id', 'alertemail');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palertemail)
            palertemail.textContent = 'Email не валидный'
        } else {
            inputemail.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alertemail')) {
                palertemail.remove()
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
                    palertemail = document.createElement('p')
                    palertemail.setAttribute('id', 'alertemail');
                    buttonsend.setAttribute('disabled', '')
                    divalert.appendChild(palertemail)
                    palertemail.textContent = result
                } else {
                    inputemail.classList.remove('wrong-data')
                    buttonsend.removeAttribute('disabled')
                    if (document.querySelector('#alertemail')) {
                        palertemail.remove()
                    }
                }
            } catch (error) {
                console.log('Ошибка: ', error)
            }
        }

    } else if (e.target.id === 'password') {
        pass = e.target.value
        if (pass.length < 8 || pass.length > 20) {
            inputpassword.classList.add('wrong-data')
            palertpassword = document.createElement('p')
            palertpassword.setAttribute('id', 'alertpassword');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palertpassword)
            palertpassword.textContent = 'Пароль меньше 8 символов или больше 20'
        } else {
            inputpassword.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alertpassword')) {
                palertpassword.remove()
            }
        }

    } else if (e.target.id === 'passwordagain') {
        passagain = e.target.value
        if (pass !== passagain) {
            inputpasswordagain.classList.add('wrong-data')
            palertpasswordagain = document.createElement('p')
            palertpasswordagain.setAttribute('id', 'alertpasswordagain');
            buttonsend.setAttribute('disabled', '')
            divalert.appendChild(palertpasswordagain)
            palertpasswordagain.textContent = 'Пароли не совпадают'
        } else {
            inputpasswordagain.classList.remove('wrong-data')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alertpasswordagain')) {
                palertpasswordagain.remove()
            }
        }
    } else if (e.target.id === 'nickname') {
        nickname = e.target.value
        data = { nickname: nickname }
        try {
            let response = await fetch('../app/core/CheckData.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(data)
            })

            let result = await response.text()
            if (result) {
                inputnickname.setAttribute('style', 'border: .1rem solid #ff0000;')
                palertnickname = document.createElement('p')
                palertnickname.setAttribute('id', 'alertnickname');
                buttonsend.setAttribute('disabled', '')
                divalertprofile.appendChild(palertnickname)
                palertnickname.textContent = result
            } else {
                inputnickname.setAttribute('style', 'border: .1rem solid #007bff;')
                buttonsend.removeAttribute('disabled')
                if (document.querySelector('#alertnickname')) {
                    palertnickname.remove()
                }
            }
        } catch (error) {
            console.log('Ошибка: ', error)
        }
    } else if (e.target.id === 'fileavatar') {
        fileavatar = e.target.files[0].name
        // console.log(e)
        // console.log(e.target.files[0].name)
        // console.log(e.target.files[0].size)
        // console.log(e.target.files[0].type)
        // console.log(filetype)

        if (e.target.files[0].size > filesize) {
            inputfileavatar.setAttribute('style', 'border: .1rem solid #ff0000;')
            palertfileavatar = document.createElement('p')
            palertfileavatar.setAttribute('id', 'alertfileavatar');
            buttonsend.setAttribute('disabled', '')
            divalertprofile.appendChild(palertfileavatar)
            palertfileavatar.textContent = 'Файл ' + fileavatar + ' больше возможного для загрузки размера'
        } else if (!filetype.includes(e.target.files[0].type)) {
            inputfileavatar.setAttribute('style', 'border: .1rem solid #ff0000;')
            palertfileavatar = document.createElement('p')
            palertfileavatar.setAttribute('id', 'alertfileavatar');
            buttonsend.setAttribute('disabled', '')
            divalertprofile.appendChild(palertfileavatar)
            palertfileavatar.textContent = 'Неподдерживаемый тип изображения'
        } else {
            inputfileavatar.setAttribute('style', 'border: .1rem solid #007bff;')
            buttonsend.removeAttribute('disabled')
            if (document.querySelector('#alertfileavatar')) {
                palertfileavatar.remove()
            }
        }
    }
}