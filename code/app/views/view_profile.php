<?php if(!empty($data)): ?>
<div class="div-back">
    <button class="btn-back" onclick="location.href='/'">&nbspНазад</button>
</div>
<div class="div-profile-header">
    <p>Пользователь: <?= $data['nickname']?></p>
</div>
    <!-- <div class="div-alert">
    </div> -->
<div class="div-editprofile">
    <div class="div-editprofile-form">
        <form class="form-editprofile" action="/profile/updateuser" method="post">
            <label for="email">Email:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
            <input type="email" id="email" name="email" value="<?= $data['email'] ?>" readonly></label>
            <label for="password">Пароль:&nbsp&nbsp&nbsp
            <input type="text" id="password" name="password" value="<?= $data['password'] ?>"></label>
            <label for="nickname">Ник:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
            <input type="text" id="nickname" name="nickname" value="<?= $data['nickname'] ?>"></label>
            <label for="avatar">Аватар:&nbsp&nbsp&nbsp&nbsp
            <input class="input-file" type="file" id="avatar" name="avatar"></label>
            <p>Максимальный размер файла: <?= UPLOAD_MAX_SIZE / 1000; ?> Кб<br>
                Допустимые форматы: <?= implode(', ', ALLOWED_TYPES) ?></p>
            <button class="btn-editprofile" type="submit">Записать</button>
        </form>
        <button class="btn-editprofile" type="submit" onclick="location.href='/profile/deleteuser/<?= $data['id'] ?>'">Удалить профиль</button>
        </div>
</div>
<?php endif; ?>