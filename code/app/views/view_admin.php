<h1>Страница администрирования</h1>
<div class="div-admin-btn-group">
    <button class="btn-admin-action" onclick="location.href='/admin/getusers'">Список пользователей</button>
    <button class="btn-admin-action" onclick="location.href='/admin/adduser'">Добавить пользователя</button>
</div>


<?php if(!empty($data)): ?>
<table class="table-users">
    <tr>
        <th>id</th>
        <th>email</th>
        <th>nickname</th>
        <th>avatar</th>
        <th>role</th>
        <th>created</th>
    </tr>
    
    <?php foreach($data as $key => $value): ?>
        <tr onclick="location.href='/admin/edituser/<?= $value['id'] ?>'">
        <?php foreach($value as $k => $v): ?>
            <?php if($k == 'password' || $k == 'cookiehash') continue; ?>
            <td><?= $v; ?></td>
        <?php endforeach; ?>
        </tr>
    <?php endforeach; ?>
    
</table>
<?php endif; ?>