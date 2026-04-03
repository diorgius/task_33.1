<?php 
if(!empty($data)):
    $data['hideemail'] != 0 ? $checked = 'checked' : $checked = '';
    !empty($data['avatar']) ? $image = URL . 'avatars/' . $data['avatar'] : $image = URL . 'img/avatar_0.jpg' . $data['avatar'];
?>
<div class="div-back">
    <button class="btn-back" onclick="location.href='/'">&nbspНазад</button>
</div>
<div class="div-alert"></div>
<div class="div-profile-header">
    <p>Пользователь: <?= $data['nickname']?></p>
</div>
<div class="div-image-conteiner">
    <img src = "<?= $image; ?>" width = "70px" height = "70px"/>
</div>
<div class="div-editprofile">
    <div class="div-editprofile-form">
        <form class="form-editprofile" action="/profile/updateuser" method="post" enctype="multipart/form-data">
            <label for="email">Email:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile input-short" type="email" id="email" name="email" value="<?= $data['email'] ?>" readonly />&nbsp&nbsp
                <input class="input-checkbox-hideemail" name="hideemail" type="checkbox" <?= $checked ?>/>&nbsp&nbspСкрыть email
            </label>
            <label for="password">Пароль:&nbsp&nbsp&nbsp
                <input class="input-editprofile" type="password" id="password" name="password" value="<?= $data['password'] ?>" />
            </label>
            <label for="nickname">Ник:&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile" type="text" id="nickname" name="nickname" value="<?= $data['nickname'] ?>" />
            </label>
            <label for="fileavatar">Аватар:&nbsp&nbsp&nbsp&nbsp
                <input class="input-editprofile input-file" type="file" id="fileavatar" name="fileavatar" />
            </label>
            <p>Максимальный размер файла: <?= UPLOAD_MAX_SIZE / 1000; ?> Кб<br>
                Допустимые форматы: <?= implode(', ', ALLOWED_TYPES) ?></p>
            <button class="btn-editprofile" type="submit" name="send" id="send">Записать</button>
        </form>
        <button class="btn-editprofile" type="submit" onclick="location.href='/profile/deleteuser/<?= $data['id'] ?>'">Удалить профиль</button>
    </div>
</div>
<?php endif; ?>