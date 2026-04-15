const URL = window.location.protocol + '//' + window.location.host;
const FILE_SIZE = 100000;
const FILE_TYPE = ['image/jpeg', 'image/png', 'image/gif', 'image/avif'];
const INPUTE_MAIL = document.querySelector('#email');
const INPUT_PASSWORD = document.querySelector('#password');
const INPUT_PASSWORD_AGAIN = document.querySelector('#passwordagain');
const BUTTON_SEND = document.querySelector('#send');
const DIV_ALERT = document.querySelector('.div-alert');
const INPUT_HIDE_EMAIL = document.querySelector('#hideemail');
const INPUT_NICKNAME = document.querySelector('#nickname');
const INPUT_FILE_AVATAR = document.querySelector('#fileavatar');

if (INPUTE_MAIL) {
    INPUTE_MAIL.addEventListener('change', (e) => {
        validation(e);
    });
}

if (INPUT_PASSWORD) {
    INPUT_PASSWORD.addEventListener('change', (e) => {
        validation(e);
    });
}

if (INPUT_PASSWORD_AGAIN) {
    INPUT_PASSWORD_AGAIN.addEventListener('change', (e) => {
        validation(e);
    });
}

if (INPUT_HIDE_EMAIL) {
    INPUT_HIDE_EMAIL.addEventListener('change', (e) => {
        validation(e);
    });
}

if (INPUT_NICKNAME) {
    INPUT_NICKNAME.addEventListener('change', (e) => {
        validation(e);
    });
}

if (INPUT_FILE_AVATAR) {
    INPUT_FILE_AVATAR.addEventListener('change', (e) => {
        validation(e);
    });
}

async function validation(e) {
    if (e.target.id === 'email') {
        email = e.target.value;

        // проверяем валидность email
        const emailregexp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailregexp.test(email)) {
            INPUTE_MAIL.classList.add('wrong-data');
            // выводим сообщение о не соответствии введенных данных
            alertMessage('Email не валидный');
        } else {
            INPUTE_MAIL.classList.remove('wrong-data');
            BUTTON_SEND.removeAttribute('disabled');

            // посылаем email на бэкенд и проверяем на есть ли уже такой в базе
            data = { email: email }
            try {
                let response = await fetch(URL + '/app/core/CheckData.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/jsoncharset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.text();
                // console.log('Успех: ', result);
                if (result) {
                    INPUTE_MAIL.classList.add('wrong-data');
                    // выводим сообщение о не соответствии введенных данных
                    alertMessage(result);
                } else {
                    INPUTE_MAIL.classList.remove('wrong-data');
                    BUTTON_SEND.removeAttribute('disabled');
                }
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    } else if (e.target.id === 'password') {
        pass = e.target.value;

        // проверяем длинну пароля
        if (pass.length < 8 || pass.length > 20) {
            INPUT_PASSWORD.setAttribute('style', 'border: .1rem solid #ff0000');
            // INPUT_PASSWORD.classList.add('wrong-data');
            // выводим сообщение о не соответствии введенных данных
            alertMessage('Пароль меньше 8 символов или больше 20');
        } else {
            INPUT_PASSWORD.setAttribute('style', 'border: .1rem solid #007bff');
            // INPUT_PASSWORD.classList.remove('wrong-data');
            BUTTON_SEND.removeAttribute('disabled');
        }
    } else if (e.target.id === 'passwordagain') {
        passagain = e.target.value;

        // проверяем совпадение пароля
        if (pass !== passagain) {
            INPUT_PASSWORD_AGAIN.classList.add('wrong-data');
            // выводим сообщение о не соответствии введенных данных
            alertMessage('Пароли не совпадают');
        } else {
            INPUT_PASSWORD_AGAIN.classList.remove('wrong-data');
            BUTTON_SEND.removeAttribute('disabled');
        }
    } else if (e.target.id === 'hideemail') {
        
        // проверяем nickname если хотим скрыть email 
        if (e.target.checked) {
            if (!INPUT_NICKNAME.value) {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #ff0000');
                // выводим сообщение о не соответствии введенных данных
                alertMessage('Для скрытия email введите nickname');
            } else {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #007bff');
                BUTTON_SEND.removeAttribute('disabled');
            }
        } else {
            INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #007bff');
            BUTTON_SEND.removeAttribute('disabled');
        }
    } else if (e.target.id === 'nickname') {
        nickname = e.target.value;
        if (!INPUT_NICKNAME.value) {
            INPUT_HIDE_EMAIL.checked = false;
        } else {

            // проверяем nickname на кириллицу
            if (nickname.match(/[А-яЁё]/)) {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #ff0000');
                // выводим сообщение о не соответствии введенных данных
                alertMessage('Nickname не должен содержать кириллицу');
            } else {
                INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #007bff');
                BUTTON_SEND.removeAttribute('disabled');
                
                // посылаем nickname на бэкенд и проверяем на есть ли уже такой в базе
                data = { nickname: nickname }
                try {
                    let response = await fetch(URL + '/app/core/CheckData.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/jsoncharset=utf-8'
                        },
                        body: JSON.stringify(data)
                    });
                    let result = await response.text();
                    if (result) {
                        // здесь и далее пришлось добавлять стиль таким способом
                        // почему-то если на форме регистрации работает добавление стиля через добавление класса
                        // INPUT_EMAIL.classList.add('wrong-data') и он добавляется перед основным классом,
                        // то на форме редактирования профиля этот класс добавляется после основного класса и не работает???
                        // почему так происходит я пока не разобрался
                        // и на поле ввода пароля тоже пришлось изменить, потому-что на форме редактирования это поле тоже есть,
                        // хотя на форме регистрации все отрабатывается
                        INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #ff0000');
                        // выводим сообщение о не соответствии введенных данных
                        alertMessage(result);
                    } else {
                        // убираем стиль
                        INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #007bff');
                        BUTTON_SEND.removeAttribute('disabled');
                    }
                } catch (error) {
                    console.log('Ошибка: ', error);
                }
            }
        }
    } else if (e.target.id === 'fileavatar') {
        fileavatar = e.target.files[0].name;
        // проверяем размер файла 
        if (e.target.files[0].size > FILE_SIZE) {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #ff0000');
            // выводим сообщение о не соответствии введенных данных
            alertMessage('Файл больше возможного для загрузки размера');
        // проверяем тип файла
        } else if (!FILE_TYPE.includes(e.target.files[0].type)) {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #ff0000');
            // выводим сообщение о не соответствии введенных данных
            alertMessage('Неподдерживаемый тип изображения');
        } else {
            INPUT_FILE_AVATAR.setAttribute('style', 'border: .1rem solid #007bff');
            BUTTON_SEND.removeAttribute('disabled');
        }
    }
}