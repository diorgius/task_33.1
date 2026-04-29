const BUTTON_ADD_USER = document.querySelector('#btnadduser');
const BUTTON_CREATE_GROUP = document.querySelector('#btncreategroup');
const DIV_LIST_USERS = document.querySelector('#divlistusers');
const DIV_USER_CHATS = document.querySelector('#divuserchats');
const MAIN_WINDOW = document.querySelector('#mainwindow');
const TEXT_AREA_MESSAGE = document.querySelector('#textsendmessage');
const USER_ID = document.querySelector('.div-user-avatar').id;
const USER_NICKNAME = document.querySelector('.p-nickname').innerText;


// !!! БЫЛА ОСНОВНАЯ КОНЦЕПЦИЯ
// если пользователь активен (в чате), то ему можно отправлять сообщения иначе выводится сообщение, 
// что пользователь не в чате и ему нет возможности отправить сообщение
// при поступлении сообщения, если не открыт чат с пользователем который отправил сообщения или 
// открыты какие либо другие окна (добавление пользователей и т.д.) или открыт чат с другим пользователем,
// отправивший сообщение пользователь в левой панели выделяется цветом, если не открыто ничего,
// то сам открывается чат, происходит загрузка ранних сообщений из БД и новые поступающие и отправляемые
// сообщения выводятся в реальном времени,
// если было что-то открыто и пришло собщение, то при клике на пользователе отправившем сообщение
// (выделенным цветом) открывается с ним чат, загружаются сообщения из БД и далее сообщения 
// отправляются и принимаются в реальном времени
//
// ПО ПОВОДУ ОПОВЕЩЕНИЯ В ТЗ ОПИСАНО НЕ ОДНОЗНАЧНО (!!!ПО КРАЙНЕЙ МЕРЕ Я НЕ СОВСЕМ ПОНЯЛ)
// ОПОВЕЩЕНИЕ О ПРИХОДЕ СООБЩЕНИЙ ОТКЛЮЧАЕТСЯ ВООБЩЕ ИЛИ ТОЛЬКО ЗВУКОВОЕ
// ЕСЛИ ТОЛЬКО ЗВУКОВОЕ, ТО НАДО ЛИ ОТКРЫВАТЬ С НИМ ЧАТ ПРИ ПОСТУПЛЕНИИ СООБЩЕНИЯ???
// БЫЛО ТАК:
// если пользователь отключает оповещением на каком-либо из свох контактов, то
// он не принимает сообщения от него в реальном времени и пользователь 
// отпавивший сообщение не выделяется цветом, но при клике на этого пользователя открывается чат, ранние сообщения 
// загружаются из БД, но новые сообщения не приходят в режиме реального времени, !?! но отправляются
//
// !!! 29.04.2026 ПОМЕНЯЛ ОСНОВНУЮ КОНЦЕПЦИЮ
// неважно активен (в чате) или нет пользователь ему все равно можно отправлять сообщения
// (изменил потому, что думаю так более логично),
// если он в чате, то все как было описано ранее он в зависимости от открытых у него окон
// открывает чат или он открывается сам при получении сообщения, загружаются сообщения из БД
// и далее происходит обмен сообщениями в реальном времени, если пользователь не активен, то
// направленное ему сообщение записывается в БД, а пользователь при подключении к чату и выборе
// контакта направившего сообщение его получит из БД
// 
// ПО ПОВОДУ ОПОВЕЩЕНИЯ
// !!! ??? если отключено оповещение, все будет как обычно, только без звукового оповещения
// и автоматического открытия чата
// 
// ПО ГРУППОВЫМ ЧАТАМ
// в группу можно отправлять сообщения в любом случае, те пользователи которые активны,
// если у них не открыто ничего, то при получении сообщения откроется групповой чат, загрузятся 
// ранние сообщения из БД и далее переписка в реальном времени, если что-то открыто, то при поступлении
// сообщения группа будет выделена цветом, при клике на нее тот же процесс как и с пользователем,
// если пользователь не активен, то когда он подключится и выберет группу все сообщения загрузятся из БД
//


// !!!TO DO
// !!!СДЕЛАНО 1. изменить добавление nickname, при регистрации не задавать nickname автоматически 
// (у разных почтовиков могут быть одинаковые nickname)
// только если пользователь сам его добавляет, при этом учитывать скрытие email, 
// если не задан nickname, то не давать возможность скрыть email
// при выводе списка пользователей и добавленных пользователей вывод nickname/email
//
// !!!СДЕЛАНО 2. разобраться с отправкой сообщений только выбранному пользователю и 
// при открытии чата задавать id divusermessages уникальным 
// (??? nickname? emai? id - уже нельзя, занят в списке добавленных пользоватей)
// !!! для дива задается id с ником или емайл(если нет ника)
// или как-то комбинировать, чтобы потом закрывать и открывать
// в зависимости от того с кем чат
//
// !!! СДЕЛАНО 3. если у пользователя нет открытого чата,
// активировать пользователя из списка контактов (имитировать клик), 
// активировать divusermessages писать в заголовке с кем чат (от кого пришло сообщение)
// и примать сообщения в него 
// 
// !!! СДЕЛАНО 4. если у пользователя уже открыт чат с другим пользователем
// выдать сообщение о приходе сообщения от другого пользователя (этот пользователь выделяется желтым цветом)
// ??? или просто делать оповещение в любом случае, а чат пусть пользователь открывает сам
//
// !!! СДЕЛАНО 5. запись сообщений в БД
//
// !!! СДЕЛАНО 6. при активации пользователя загружать из БД ранние сообщения от этого пользователя
//
// !!! СДЕЛАНО 6.1 при получение сообщения от другого пользователя когда открыт чат, при активации также загружать 
// направленные ему сообщения
//
// !!! СДЕЛАНО 7. выдавать звуковое оповещение о приходе сообщения 
// (воспроизводится только если пользователь повзаимодействовал со страницей)
//
// !!! СДЕЛАНО 8. вкл/выкл оповещения и отображение этого
//
// !!! ПОКА НЕ РАЗОБРАЛСЯ 9. проверить выделение бордером при левом клике после кликов правой кнопкой
//
// !!! СДЕЛАНО 10. добавить к сообщению дату и время отправки
//
// !!! СДЕЛАНО 11. добавить возможность закрытия чата
//
// 12. сделать автозапуск wsserver.php в контейнере
// 
// !!! СДЕЛАНО 13. 
//          (
//            // добавлена отправка сообщения самому себе после отправки сообщения адресату
//            // для того чтобы получить message_id из БД и дату и время сообщения
//            // для присвоения div id для однозначной идентификации
//            // сообщения и вывода даты и времени
//          )
// как идентифицировать сообщение на стороне отправителя??? в момент его отправки???
// на стороне получателя мы при записе в БД получаем message_id и пересылаем его адресату
// уже с уникальным id, а на стороне отправителя??? id нет и как потом его идентифицировать
// если пользователь захочет его переслать???
// при открытии чата сообщения будут загружены из БД и тут проблем нет т.к. id будет
//
// !!! СДЕЛАНО 14. сделать удаление всей переписки с пользователем
//
// !!! СДЕЛАНО 14.1 при удалении пользователя из списка контактов ??? НАДО ЛИ удалять переписку с ним
//
// !!! СДЕЛАНО 15. удаление конкретного сообщения
//
// !!! СДЕЛАНО 16. редактирование сообщения
//
// !!! СДЕЛАНО 17. пересылка сообщения ??? НАДО ЛИ У СЕБЯ ДЕЛАТЬ ОТМЕТКУ О ПЕРЕСЫЛКЕ ???
//
// 18. !!! ??? ВОЗМОЖНО ПЕРЕДЕЛАТЬ ??? запись отправленного сообщения не от кого кому, а по id контакта !!!
//
// !!! СДЕЛАНО 19. создание группы и добавление пользователей в группу
//
// !!! СДЕЛАНО 20. вывод списка пользователей
// 
// !!! СДЕЛАНО 21. рассылка групповых сообщений
//
// !!! СДЕЛАНО 22. удаление пользователя из группы
//
// !!! СДЕЛАНО 23. удаление группы
// 
// !!! СДЕЛАНО 24. при добавлении пользователя в список своих контактов
// добавлять себя в список его контактов с отправкой ему сообщения об этом
//
// 25. правый клик не только на див сообщения, а на всей области сообщения
//
// 26. !!! ??? НАДО ПОДУМАТЬ о статусе сообщения прочитано/непрочитано, чтобы пользователь
// при входе мог видеть, что ему поступили новые сообщения и от кого, пока он был неактивен
// 
// !!! СДЕЛАНО 27. !!! ??? при удалении контакта ??? тоже удалять себя у него
//
// !!! СДЕЛАНО 28. НАДО еще подумать над вкл/выкл оповещения сейчас оно отключает не только беззвучный режим,
// но и полностью оповещение о приходе сообщений, при этом если при отключенном оповещении
// кликнуть на пользователя, выводится сообщение, что пользователь не в чате (ЭТО надо поправить
// чтобы пользователь мог загружать сообщения),
// ПОКА я не понял вкл/выкл оповещения ЭТО только беззвучный режим или ВООБЩЕ 
// отключение оповещения о приходе новых сообщений
//
// 29. сортировка пользователей чата при входе в соответствии с полученными последними сообщениями
// И ВОЗМОЖНО перемещение пользователя вверх при поступлении сообщения
//
// !!! СДЕЛАНО 30. !!! ??? НАДО ПОДУМАТЬ И ПЕРЕДЕЛАТЬ ДОБАВЛЕНИЕ ПОЛЬЗОВАТЕЛЕЙ сделать добавление только через сокет
// сейчас очень запутанная схема надо ее упростить
//
// !!! СДЕЛАНО 31. !!! ??? отправка сообщений только активным пользователям ???
//
// !!! СДЕЛАНО 32. !!! ??? разобраться с выделением цветами и рамками групп ???
//
// !!! СДЕЛАНО 33. вывод nickname отправившего пользователя в сообщении
//
// 34. удаление/редактирование сообщений в группе и в привате, ??? сейчас когда добавил
// имя отправителя берется не тот текст для редактирования
// 
// 35. вылез косяк с именами отправителей в групповом чате, если у пользователя нет каких-то контактов,
// то в чате вылазит ошибка при отображении имени





// маштабируем текстовую область сообщений
let actions = ['input', 'cut', 'paste', 'drop', 'onchange'];
if (TEXT_AREA_MESSAGE) {
    actions.forEach((e) => {
        TEXT_AREA_MESSAGE.addEventListener(e, () => {
            TEXT_AREA_MESSAGE.style.height = 'auto';
            TEXT_AREA_MESSAGE.style.height = TEXT_AREA_MESSAGE.scrollHeight + 'px';
        });
    });
}

// выводим список пользователей для добавления в свои контакты
if (BUTTON_ADD_USER) {
    BUTTON_ADD_USER.addEventListener('click', async () => {
        // если список уже выведен  - убираем его и меняем надпись на кнопке
        if (document.querySelector('#divaddusers')) {
            BUTTON_ADD_USER.textContent = 'Добавить пользователей';
            document.querySelector('#divaddusers').remove();
        } else {
            // меняем надпись на кнопке
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // если открыто окно создание группы - убираем его
            if (document.querySelector('#divcreategroup')) {
                BUTTON_CREATE_GROUP.textContent = 'Создать группу';
                document.querySelector('#divcreategroup').remove();
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';            
            // отправляем запрос в БД, получаем список пользователей
            data = { action: 'getAllUsers' };
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.json();
                // console.log('Успех: ', result);

                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция добавления пользователя                
                showUsersList(result, 'addUserToPrivate');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    });
}

if (BUTTON_CREATE_GROUP) {
    BUTTON_CREATE_GROUP.addEventListener('click', () => {
        // если уже вывено окно создания группы - убираем его и меняем надпись на кнопке
        if (document.querySelector('#divcreategroup')) {
            BUTTON_CREATE_GROUP.textContent = 'Создать группу';
            document.querySelector('#divcreategroup').remove();
        } else {
            // меняем надпись на кнопке
            BUTTON_CREATE_GROUP.textContent = 'Убрать создание группы';
            // если открыто окно добавления пользователей - убираем его
            if (document.querySelector('#divaddusers')) {
                document.querySelector('#divaddusers').remove();
                BUTTON_ADD_USER.textContent = 'Добавить пользователей';
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';            
            // добавляем окно создания группы
            document.querySelector('#divwrappercreategroup').innerHTML =
                `<div class="div-create-group" id="divcreategroup">
                <div class="div-create-group-header" id="divcreategroupheader">
                    <p>Создание группы пользователей</p>
                </div>
                <label for="inputgroupname">Введите название группы</label>
                <input class="input-group-name" type="text" id="inputgroupname" name="inputgroupname" />
                <button class="btn-add" id="btnaddgroup" name="btnaddgroup">Создать</button>
            </div>`;
            let inputGroupName = document.querySelector('#inputgroupname');
            // проверяем уникальность имени группы
            inputGroupName.onchange = (e) => { validation(e) }
            const BUTTON_ADD_GROUP = document.querySelector('#btnaddgroup');
            // ловим нажатие кнопки создания группы
            BUTTON_ADD_GROUP.onclick = async () => {
                let inputGroupName = document.querySelector('#inputgroupname');
                if (inputGroupName.value === '') {
                    alertMessage('Введите название группы');
                } else {
                    // отправляем данные в БД для записи
                    data = {
                        action: 'createGroup',
                        group_name: inputGroupName.value,
                        creator: USER_ID
                    };
                    try {
                        let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json;charset=utf-8'
                            },
                            body: JSON.stringify(data)
                        });
                        let result = await response.text();
                        // console.log('Успех: ', result);

                        // вызываем функцию создания элемента группы в левой панели
                        addGroupIntoSidebar(result, inputGroupName.value);
                        // убираем окно создания группы
                        document.querySelector('#divcreategroup').remove();
                        BUTTON_CREATE_GROUP.textContent = 'Создать группу';

                    } catch (error) {
                        console.log('Ошибка: ', error);
                    }
                }
            }
        }
    });
}

// обрабатываем меню по клику правой кнопки 
window.oncontextmenu = (e) => {
    // выводим контекстное меню на пользователях чата
    if (e.target.classList.contains('div-chat-user')) {
        // console.log(e.target.id);
        e.preventDefault();
        // если открыто меню сообщения, убираем его
        document.querySelector('.ul-message-menu') ? document.querySelector('.ul-message-menu').style.display = 'none' : null;
        document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
        // если открыто меню группы, убираем его
        document.querySelector('.ul-chat-group-menu') ? document.querySelector('.ul-chat-group-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-user-menu');
        CHAT_USER_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_USER_MENU.style.top = positionY + 'px';
        CHAT_USER_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatUserActive = document.querySelector('.div-chat-active');
        divChatUserActive !== null ? divChatUserActive.classList.remove('div-chat-active') : null;
        e.target.classList.add('div-chat-active');

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotificationuser');
        offNotification.onclick = () => {
            // console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            // chatUserWithoutNotice.classList.contains('div-chat-user-onchat') ? chatUserWithoutNotice.classList.remove('div-chat-user-onchat') : null;
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotificationuser');
        onNotification.onclick = () => {
            // console.log(e.target.id);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
        }

        // удаляем переписку с пользователем
        let deleteUserChats = document.querySelector('#deleteuserchats');
        deleteUserChats.onclick = () => {
            // console.log(e.target.id);
            // отправляем сообщение в сокет для удаления всей переписки с пользователем и
            // если пользователь активен отправляем сообщение пользователю, что переписка удалена
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
            WS.send(JSON.stringify({
                command: 'deleteAllMessages',
                user_id: e.target.id,
                to: to,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
            // если открыт чат с удаленным пользователем, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // выводим сообщение, что переписка удалена
            alertMessage(`Вся переписка с пользователем ${e.target.innerText} удалена`);
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';

        }

        // удаляем пользователя из списка контактов с удалением всей переписки и удаляем у него свой контакт
        let deleteChatUser = document.querySelector('#deletechatuser');
        deleteChatUser.onclick = () => {
            // console.log(e);
            // отправляем сообщение в сокет для удаления контакта пользователя и
            // если пользователь активен отправляем сообщение пользователю, что его контакт удален
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === e.target.id);
            WS.send(JSON.stringify({
                command: 'deleteContact',
                user_id: e.target.id,
                to: to,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
            // если открыт чат с удаленным пользователем, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // выводим сообщение, что данный пользователь удален из списка контактов
            alertMessage(`Пользователь ${e.target.innerText} удален из списка контактов`);
            // удаляем пользователя из списка контактов
            document.getElementById(e.target.id) ? document.getElementById(e.target.id).remove() : null;
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';

        }
    }

    // выводим контекстное меню на группе
    if (e.target.classList.contains('div-chat-group')) {
        // console.log(e);
        e.preventDefault();
        // если открыто меню сообщения, убираем его
        document.querySelector('.ul-message-menu') ? document.querySelector('.ul-message-menu').style.display = 'none' : null;
        document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
        // если открыто меню пользователя, убираем его
        document.querySelector('.ul-chat-user-menu') ? document.querySelector('.ul-chat-user-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_USER_MENU = document.querySelector('.ul-chat-group-menu');
        CHAT_USER_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_USER_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_USER_MENU.style.top = positionY + 'px';
        CHAT_USER_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом пользователе
        let divChatGroupActive = document.querySelector('.div-chat-active');
        divChatGroupActive !== null ? divChatGroupActive.classList.remove('div-chat-active') : null;
        e.target.classList.add('div-chat-active');

        // отключаем оповещение
        let offNotification = document.querySelector('#offnotificationgroup');
        offNotification.onclick = () => {
            // console.log(e);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.add('div-chat-user-without-notice');
        }

        // включаем оповещение
        let onNotification = document.querySelector('#onnotificationgroup');
        onNotification.onclick = () => {
            // console.log(e);
            let chatUserWithoutNotice = document.getElementById(e.target.id);
            chatUserWithoutNotice.classList.remove('div-chat-user-without-notice');
        }

        // добавляем пользователя в группу
        let addGroupChatUser = document.querySelector('#addgroupchatuser');
        addGroupChatUser.onclick = async () => {
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // если выведен список добавления пользователей - убираем его и меняем надпись на кнопке
            if (document.querySelector('#divaddusers')) {
                BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
                document.querySelector('#divaddusers').remove();
            }
            // если открыто окно создание группы - убираем его
            if (document.querySelector('#divcreategroup')) {
                BUTTON_CREATE_GROUP.textContent = 'Создать группу';
                document.querySelector('#divcreategroup').remove();
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
            // получаем список пользователей из своих контактов для добавления в группу
            data = {
                action: 'getUserContacts',
                user_id: USER_ID
            }
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.json();
                // console.log('Успех: ', result);

                // добавляем id группы
                result.group_id = e.target.id;
                result.group_name = e.target.innerText;
                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция добавления пользователя
                showUsersList(result, 'addUserToGroup');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // выводим список группы
        let showGroupUsers = document.querySelector('#showgroupchatuser');
        showGroupUsers.onclick = async () => {
            BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
            // если выведен список добавления пользователей - убираем его и меняем надпись на кнопке
            if (document.querySelector('#divaddusers')) {
                BUTTON_ADD_USER.textContent = 'Убрать список пользователей';
                document.querySelector('#divaddusers').remove();
            }
            // если открыто окно создание группы - убираем его
            if (document.querySelector('#divcreategroup')) {
                BUTTON_CREATE_GROUP.textContent = 'Создать группу';
                document.querySelector('#divcreategroup').remove();
            }
            // если есть открытый чат - убираем его
            document.querySelector('.div-user-messages') ? document.querySelector('.div-user-messages').remove() : null
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';            
            // получаем список пользователей из своих контактов для добавления в группу
            data = {
                action: 'getUserGroupContacts',
                user_id: USER_ID,
                contact_group_id: e.target.id
            }
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.json();
                // console.log('Успех: ', result);
                // добавляем id группы
                result.group_id = e.target.id;
                result.group_name = e.target.innerText;
                // вызываем функцию вывода списка пользователей
                // в которой при клике на пользователе вызывается функция добавления пользователя
                showUsersList(result, 'deleteGroupUser');
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }

        // покидаем группу
        let leaveGroup = document.querySelector('#leavegroupchatuser');
        leaveGroup.onclick = () => {
            // console.log(e.target.id);
            // покидаем группу и послаем сообщение пользователям об этом
            WS.send(JSON.stringify({
                command: 'leaveGroup',
                group_id: e.target.id,
                group_name: e.target.innerText,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME
            }))
        }

        // удаляем группу
        let deleteGroup = document.querySelector('#deletegroup');
        deleteGroup.onclick = () => {
            // удаляем группу и послаем сообщение пользователям группы об ее удалении
            WS.send(JSON.stringify({
                command: 'deleteGroup',
                group_id: e.target.id,
                send_user_id: USER_ID,
                send_nickname: USER_NICKNAME,
                group_name: e.target.innerText
            }))
            // если открыт чат с удаленной группой, закрываем его
            document.getElementById(e.target.innerText) ? document.getElementById(e.target.innerText).remove() : null;
            // скрываем текстовую область
            document.querySelector('.div-text-send-message').style.visibility = 'hidden';
        }
    }

    // выводим контекстное меню на сообщении
    if (e.target.classList.contains('div-send-message')
        || e.target.classList.contains('div-accept-message')
        // || e.target.classList.contains('div-text-message')
        // || e.target.classList.contains('div-datetime-message')
    ) {
        // console.log(e.target.id);
        e.preventDefault();
        // если открыто меню пользователя, убираем его
        document.querySelector('.ul-chat-user-menu') ? document.querySelector('.ul-chat-user-menu').style.display = 'none' : null;
        // если открыто меню группы, убираем его
        document.querySelector('.ul-chat-group-menu') ? document.querySelector('.ul-chat-group-menu').style.display = 'none' : null;
        // выводим меню
        const CHAT_MESSAGE_MENU = document.querySelector('.ul-message-menu');
        CHAT_MESSAGE_MENU.style.display = 'block';
        positionY = e.pageY - CHAT_MESSAGE_MENU.offsetHeight; // чтобы меню выводилось вверх от курсора
        CHAT_MESSAGE_MENU.style.top = positionY + 'px';
        CHAT_MESSAGE_MENU.style.left = `${e.pageX}px`;
        // добавляем/удаляем выделение элемента border на кликнутом сообщении
        let divMessageActive = document.querySelector('.div-message-active');
        divMessageActive !== null ? divMessageActive.classList.remove('div-message-active') : null;
        e.target.classList.add('div-message-active');

        // !!! переделываю чтобы можно было удалять и групповые сообщения
        // удаляем выбранное сообщение
        let deleteMessage = document.querySelector('#deletemessage');
        deleteMessage.onclick = () => {
            // определяем тип чата
            document.querySelector('.div-chat-active').classList.contains('div-chat-user') ? chatType = 'private' : chatType = 'group';
            // получаем id пользователя/группы
            let chatId = document.querySelector('.div-chat-active').id;
            // получаем название чата
            chatType === 'private' ? chatName = USER_NICKNAME : chatName = document.querySelector('.div-user-messages').id;
            to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatId);
            message = JSON.stringify({
                command: 'deleteMessage',
                id: e.target.id,
                to: to,
                accept_id: chatId,
                accept_name: chatName,
                send_user_id: USER_ID,
                chat_type: chatType
            });
            // отправляем сообщение пользователю, для удаления у него удаленного сообщения и удаления из БД
            console.log(message);
            WS.send(message);
            // выводим сообщение, что сообщение удалено
            // document.getElementById(`${e.target.id}`).textContent = 'Сообщение удалено'
            e.target.classList.remove('div-message-active');
            DELETEMESSAGE.play();
        }

        // редактируем выбранное сообщение
        let editMessage = document.querySelector('#editmessage');
        editMessage.onclick = () => {
            // console.log(e);
            // выводим текст сообщения в текстовую область для редактирования
            TEXT_AREA_MESSAGE.value = e.target.firstChild.innerText;
            // убираем выделение сообщения
            document.getElementById(e.target.id).classList.remove('div-message-active');
            // отправка измененного сообщения
            const MESSAGE_SEND = document.querySelector('#sendmessage');
            let chatUser = document.querySelector('.div-chat-active').id
            MESSAGE_SEND.onclick = () => {
                let textSendMessage = TEXT_AREA_MESSAGE.value;
                // проверить не пусто ли сообщение
                if (textSendMessage === '') {
                    alertMessage('Введите текст сообщения');
                } else {
                    TEXT_AREA_MESSAGE.value = '';
                    to = Object.keys(connectedUsers).find(key => connectedUsers[key] === chatUser);
                    message = JSON.stringify({
                        command: 'editMessage',
                        id: e.target.id,
                        to: to,
                        send_user_id: USER_ID,
                        accept_user_id: chatUser,
                        send_nickname: USER_NICKNAME,
                        text_message: textSendMessage
                    });
                    WS.send(message);
                    TEXT_AREA_MESSAGE.focus();
                    // выводим текст измененного сообщение
                    e.target.firstChild.textContent = textSendMessage;
                    // делаем пометку на сообщении
                    e.target.lastChild.textContent = 'edited';
                }
            }
        }

        // пересылаем выбранное сообщение
        let forwardMessage = document.querySelector('#forwardmessage');
        forwardMessage.onclick = async (event) => {
            // console.log(event);
            // получаем список пользователей из своих контактов для пересылки сообщения
            data = {
                action: 'getUserContacts',
                user_id: USER_ID
            }
            try {
                let response = await fetch(URL + '/app/core/ActionsWithUsers.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify(data)
                });
                let result = await response.json();
                // console.log('Успех: ', result);

                // выводим список контактов
                let sectionMain = document.querySelector('#mainwindow');
                let ulChatUsers = document.createElement('ul');
                ulChatUsers.classList.add('ul-users-menu');
                ulChatUsers.setAttribute('id', 'ulforwardmessagemenu')
                let divUserMessages = document.querySelector('.div-user-messages');
                result.forEach((item) => {
                    // если это контакт с которым открыт чат, не выводим этот контакт для пересылки
                    if (divUserMessages.id !== item.nickname && divUserMessages.id !== item.email) {
                        // выводим список пользователей
                        let liChatUser = document.createElement('li');
                        liChatUser.classList.add('li-users-menu');
                        let spanUserNickname = document.createElement('span');
                        spanUserNickname.classList.add('span-forward-user');
                        item.nickname !== null ? spanUserNickname.textContent = item.nickname : spanUserNickname.textContent = item.email;
                        let spanCheckbox = document.createElement('span');
                        spanCheckbox.classList.add('span-forward-user');
                        let checkbox = document.createElement('input');
                        checkbox.setAttribute('type', 'checkbox');
                        checkbox.classList.add('checkbox-forward-user');
                        checkbox.setAttribute('id', item.contact_user_id);
                        spanCheckbox.appendChild(checkbox);
                        liChatUser.append(spanUserNickname, spanCheckbox);
                        ulChatUsers.appendChild(liChatUser);
                    }
                });
                // добавляем кнопку пересылки
                let btnForwardMessage = document.createElement('button');
                btnForwardMessage.setAttribute('id', 'btnforwardmessage');
                btnForwardMessage.classList.add('btn-forward-message');
                btnForwardMessage.textContent = 'Переслать';
                ulChatUsers.append(btnForwardMessage);
                // выводим меню
                sectionMain.append(ulChatUsers);
                ulChatUsers.style.display = 'block';
                // если позиция на эране меньше половины экрана, то выводим меню вниз
                if (event.clientY < 500) {
                    ulChatUsers.style.top = `${event.clientY}px`;
                    // иначе выводим меню вверх
                } else {
                    positionY = event.clientY - ulChatUsers.offsetHeight;
                    ulChatUsers.style.top = positionY + 'px';
                }
                ulChatUsers.style.left = `${event.clientX}px`;
                // обрабатываем пересылку сообщения
                btnForwardMessage.onclick = async () => {
                    // получаем отмеченные чекбоксы
                    let checkedCheckboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                    // записываем их в массив
                    let usersToForward = Array.from(checkedCheckboxes).map(checkbox => checkbox.id);
                    // console.log(userToForward);
                    // отправляем данные в сокет для записи в БД и отправки сообщения
                    // активным пользователям из числа тех кому пересылается сообщение
                    // определяем от кого пересылаем
                    e.target.classList.contains('div-accept-message') ?
                        forwardUser = document.querySelector('.div-chat-user-active').lastElementChild.innerText :
                        forwardUser = USER_NICKNAME;
                    message = JSON.stringify({
                        command: 'forwardMessage',
                        id: e.target.id,
                        send_user_id: USER_ID,
                        usersToForward: usersToForward,
                        send_nickname: USER_NICKNAME,
                        text_message: e.target.firstChild.innerText,
                        status_message: `forwarded from ${forwardUser}`
                    });
                    WS.send(message);
                    // убираем контекстное меню
                    document.querySelector('.ul-message-menu').style.display = 'none';
                    document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
                }
            } catch (error) {
                console.log('Ошибка: ', error);
            }
        }
    }

    // убираем меню по клику в любом месте документа
    window.addEventListener('click', (elem) => {
        document.querySelector('.ul-chat-user-menu').style.display = 'none';
        document.querySelector('.ul-chat-group-menu').style.display = 'none';
        // !!! если здесь убирать выделение кликнутого пользователя рамкой,
        // то потом при клике левой кнопкой пользователь не выделяется
        // пока не понял почему
        // e.target.classList.remove('div-chat-user-active');

        // console.log(elem.target);
        // если клики не на пункте меню или пользователе или чекбоксе, то убираем меню
        if (!elem.target.classList.contains('li-users-menu')
            && !elem.target.classList.contains('span-forward-user')
            && !elem.target.classList.contains('checkbox-forward-user')) {
            document.querySelector('#ulforwardmessagemenu') ? document.querySelector('#ulforwardmessagemenu').remove() : null;
            document.querySelector('.ul-message-menu').style.display = 'none';
        }
    });

    // убираем меню по клавише escape
    window.addEventListener('keydown', (press) => {
        if (press.key === 'Escape') {
            document.querySelector('.ul-chat-user-menu').style.display = 'none';
            document.querySelector('.ul-chat-group-menu').style.display = 'none';
            // аналогично
            // e.target.classList.remove('div-chat-user-active');
            // по клавише убираем все меню
            document.querySelector('.ul-message-menu').style.display = 'none';
            document.querySelector('#ulusersmenu') ? document.querySelector('#ulusersmenu').remove() : null;
        }
    });
}