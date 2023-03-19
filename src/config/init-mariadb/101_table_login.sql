USE rpgdb;
DROP TABLE IF EXISTS `login`;
CREATE TABLE `login`
     (
          `id`             INT(10)unsigned NOT NULL auto_increment
        , `login_email`    VARCHAR(255)DEFAULT NULL
        , `login_is_admin` TINYINT(4)DEFAULT NULL
        , `login_modified` DATETIME DEFAULT CURRENT_TIMESTAMP() ON
UPDATE
     CURRENT_TIMESTAMP()
   , `login_created` DATETIME DEFAULT CURRENT_TIMESTAMP()
   , `player_id` INT(10)unsigned NOT NULL
   , PRIMARY KEY(`id`, `player_id`)
   , UNIQUE KEY `login_id_UNIQUE`(`id`)
   , UNIQUE KEY `login_email_UNIQUE`(`login_email`)
   , KEY `fk_login_player1_idx`(`player_id`)
   , KEY `email`(`login_email`)
   , CONSTRAINT `fk_login_player1` FOREIGN KEY(`player_id`)REFERENCES `player`(`id`)ON
DELETE
     CASCADE ON
UPDATE
     CASCADE
     )
engine = innodb auto_increment = 7 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;