USE rpgdb;
DROP PROCEDURE IF EXISTS `create_player_login_return_playerid_admin`;
delimiter //

CREATE PROCEDURE create_player_login_return_playerid_admin(IN player_name VARCHAR(255), IN email VARCHAR(255), IN admin TINYINT(4))
          BEGIN
               INSERT INTO
                    `rpgdb`.`players`
                         (
                              `player_name`
                         )
               VALUES
                    (
                         player_name
                    )
               ;
               SET @player_id = last_insert_id();
               INSERT INTO
                    `rpgdb`.`logins`
                         (
                              `email`
                            , `admin`
                            , `players_id`
                         )
               VALUES
                    (
                         email
                       , admin
                       , @player_id
                    )
               ;
               SELECT
                    @player_id AS player_id
                  , admin;
          END //
delimiter ;