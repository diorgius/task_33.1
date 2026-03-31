<?php

// можно здесь получить user_id и ключ и запросить данные пользователя с vk
// и как-то вызвать метод контроллера и передать полученные данные, но я пока не разобрался как это сделать 

   if(isset($_POST)){
      $data = file_get_contents("php://input");
      $user = json_decode($data, true);
      var_dump($user);
   }