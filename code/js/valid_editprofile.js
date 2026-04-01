const inputnickname = document.querySelector('#nickname')

inputnickname.addEventListener('change', (e) => {
    validation(e);
});

async function validation(e) {
    nickname = e.target.value
    console.log(nickname)

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
            // inputnickname.classList.add('wrong-data')
            // palert = document.createElement('p')
            // palert.setAttribute('id', 'alert');
            // buttonsend.setAttribute('disabled', '')
            // divalert.appendChild(palert)
            // palert.textContent = result
            console.log(result)
        }
    } catch (error) {
        console.log('Ошибка: ', error)
    }
}