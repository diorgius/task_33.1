<div class="div-back">
    <button class="btn-back" onclick="location.href='/'">&nbspНазад</button>
</div>
<div class="div-alert"></div>
<div class="div-editprofile">
    <div class="div-editprofile-form">
        <form class="form-editprofile" action="/admin/createuser" method="post" enctype="multipart/form-data">
            <label for="email">Email:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile" type="email" id="email" name="email" />
            </label>
            <label for="password">Пароль:&nbsp&nbsp&nbsp
                <input class="input-editprofile" type="password" id="password" name="password" />
            </label>
            <label for="nickname">Ник:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile" type="text" id="nickname" name="nickname" />
            </label>
            <label for="fileavatar">Аватар:&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile input-file" type="file" id="fileavatar" name="fileavatar" />
            </label>
            <p>Максимальный размер файла: <?= UPLOAD_MAX_SIZE / 1000; ?> Кб<br>
                Допустимые форматы: <?= implode(', ', ALLOWED_TYPES) ?></p>
            <label for="role">Роль:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp     
                <select class="input-editprofile" id="role" name="role">
                    <option></option>
                    <option value="admin">Администратор</option>
                    <option value="user">Пользователь</option>
                </select>
            </label> 
            <button class="btn-editprofile" type="submit" name="send" id="send">Записать</button>
        </form>
    </div>
</div>