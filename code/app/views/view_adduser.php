<h2>Новый пользователь</h2>
<div class="div-edituser-form">
    <form class="form-edituser" action="/admin/createuser" method="post">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" value="example@example.com" required>
        <label for="password">Пароль</label>
        <input type="text" id="password" name="password" required>
        <label for="nickname">Ник</label>
        <input type="text" id="nickname" name="nickname" required>
        <label for="avatar">Аватар</label>
        <input type="text" id="avatar" name="avatar">
        <label for="role">Роль</label>       
        <select id="role" name="role" required>
            <option selected disabled></option>
            <option value="admin">Администратор</option>
            <option value="user">Пользователь</option>
        </select>
        <button class="btn-edituser" type="submit">Записать</button>
    </form>
</div>