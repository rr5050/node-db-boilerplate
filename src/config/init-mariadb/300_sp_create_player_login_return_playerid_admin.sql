USE rpgdb;
DROP PROCEDURE IF EXISTS sp_create_player_login_return_playerid_admin;
delimiter //

CREATE PROCEDURE sp_create_player_login_return_playerid_admin(IN var_player_name VARCHAR(255), IN var_email VARCHAR(255))
          BEGIN
               IF
                     (
                         SELECT
                              EXISTS
                              (
                                   SELECT
                                        1
                                   FROM
                                        `logins`
                                   WHERE
                                        `email` = var_email
                                   LIMIT 1)     = 0)
               THEN
                    /* login entries doesn't exists. need to create them */
                    START transaction;
                    INSERT INTO
                         `players`
                              (
                                   `player_name`
                              )
                    VALUES
                         (
                              var_player_name
                         )
                    ;
                    INSERT INTO
                         `logins`
                              (
                                   `email`
                                 , `is_admin`
                                 , `players_id`
                              )
                    VALUES
                         (
                              var_email
                            , 0
                            , last_insert_id()
                         )
                    ;
                    COMMIT;
               END IF;
               /* create return data */
               SELECT
                    `players_id`
                  , `is_admin`
               FROM
                    `logins`
               WHERE
                    `email` = var_email;
          END //
     delimiter ;