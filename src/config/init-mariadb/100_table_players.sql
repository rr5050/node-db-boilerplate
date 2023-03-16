USE rpgdb;
DROP TABLE IF EXISTS `players`;
CREATE TABLE `players`
     (
          `id`          BIGINT(20)unsigned NOT NULL auto_increment
        , `player_name` VARCHAR(255)DEFAULT NULL
        , PRIMARY KEY(`id`)
     )
engine = innodb auto_increment = 2 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;