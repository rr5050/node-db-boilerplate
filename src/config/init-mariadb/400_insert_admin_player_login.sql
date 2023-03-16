USE rpgdb;

INSERT INTO
     `rpgdb`.`players`
          (
               `player_name`
          )
VALUES
     (
          'xx'
     )
;
INSERT INTO
     `rpgdb`.`logins`
          (
               `email`
             , `admin`
             , `players_id`
          )
VALUES
     (
          'xx@gmail.com'
        , 1
        , LAST_INSERT_ID()
     )
;