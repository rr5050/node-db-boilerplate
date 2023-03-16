USE rpgdb;
DROP TABLE IF EXISTS `logins`;
CREATE TABLE `logins`
     (
          `id`         BIGINT(20)unsigned NOT NULL auto_increment
        , `email`      VARCHAR(255)NOT NULL
        , `admin`      TINYINT(4)NOT NULL DEFAULT 0
        , `players_id` BIGINT(20)unsigned NOT NULL
        , PRIMARY KEY(`id`, `players_id`)
        , UNIQUE KEY `uq_patients_email`(`email`)
        , KEY `fk_login_players_idx`(`players_id`)
        , CONSTRAINT `fk_login_players` FOREIGN KEY(`players_id`)REFERENCES `players`(`id`)ON
DELETE
     no action ON
UPDATE
     no action
     )
engine = innodb auto_increment = 4 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;