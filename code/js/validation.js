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
const INPUT_GROUP_NAME = document.querySelector('#inputgroupname');

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

// if (INPUT_GROUP_NAME) {
    // INPUT_GROUP_NAME.addEventListener('change', (e) => {
    //     console.log(e);
    //     validation(e);
    // });

    // window.addEventListener('DOMNodeInserted', (e) => {
    //     console.log(e);

    // // if (e.target.matches(INPUT_GROUP_NAME)) {
    //     console.log(e);
    //     // validation(e); // Элемент, который мы искали
    // // }
    // });
// }

// const waitForElement = (selector, callback) => {
//   const observer = new MutationObserver(mutations => {
//     mutations.forEach(mutation => {
//       mutation.addedNodes.forEach(node => {
//         if (node.matches && node.matches(selector)) {
//           callback(node);
//           observer.disconnect();
//         }
//       });
//     });
//   });

//   observer.observe(document.body, { childList: true, subtree: true });
// };

// // Пример использования
// waitForElement('#divwrappercreategroup', element => {
//   // Код, выполняющийся после обнаружения элемента '#myElement' в DOM
//   console.log('Элемент найден:', element);
// });
  

const target = document.querySelector('#divwrappercreategroup');
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      console.log('Элемент появился!' + target.childNodes.forEach(() => { console.log (target.children)}));
      
      // Здесь можно выполнить действия с появившимся элементом
    }
  });
});

const config = { childList: true, subtree: true };

observer.observe(target, config);

// на форме редактирования профиля (и проверки поля ввода пароля на форме регистрации, т.к. используется одна проверка)
// пришлось добавлять стиль таким способом:
// INPUT_NICKNAME.setAttribute('style', 'border: .1rem solid #ff0000');
// и убирать таким:
// INPUT_PASSWORD.setAttribute('style', 'border: .1rem solid #007bff');
// хотя на форме регистрации работает работает добавление класса:
// INPUT_EMAIL.classList.add('wrong-data');
// и удаление класса:
// INPUT_EMAIL.classList.remove('wrong-data');
// если на форме регистрации он добавляется перед основным классом,
// то на форме редактирования профиля этот класс добавляется после основного класса и поэтому не срабатывает
// почему так происходит я пока не разобрался

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
            data = {
                action: 'checkUserData',
                email: email
            };
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
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
                data = {
                    action: 'checkUserData',
                    nickname: nickname
                };
                try {
                    let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/jsoncharset=utf-8'
                        },
                        body: JSON.stringify(data)
                    });
                    let result = await response.text();
                    if (result) {
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
    } else if (e.target.id === 'inputgroupname') {
        console.log('test');

    }
}