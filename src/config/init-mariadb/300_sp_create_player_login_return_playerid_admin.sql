USE rpgdb;
DROP PROCEDURE IF EXISTS sp_create_player_login_return_playerid_admin;
delimiter //

CREATE PROCEDURE sp_create_player_login_return_playerid_admin(IN var_email VARCHAR(255), IN var_is_admin TINYINT(4), IN var_player_name VARCHAR(255))
          BEGIN
               IF
                     (
                         SELECT
                              EXISTS
                              (
                                   SELECT
                                        1
                                   FROM
                                        `login`
                                   WHERE
                                        `login_email` = var_email
                                   LIMIT 1)     = 0)
               THEN
                    /* login entries doesn't exists. need to create them */
                    START transaction;
                    INSERT INTO
                         `player`
                              (
                                   `player_name`
                              )
                    VALUES
                         (
                              var_player_name
                         )
                    ;
                    INSERT INTO
                         `login`
                              (
                                   `login_email`
                                 , `login_is_admin`
                                 , `player_id`
                              )
                    VALUES
                         (
                              var_email
                            , var_is_admin
                            , last_insert_id()
                         )
                    ;
                    COMMIT;
               END IF;
               /* create return data */
               SELECT
                    `player_id`
                  , `login_is_admin`
               FROM
                    `login`
               WHERE
                    `login_email` = var_email;
          END //
     delimiter ;