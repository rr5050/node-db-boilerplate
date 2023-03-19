USE rpgdb;
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player`
     (
          `id`              INT(10)unsigned NOT NULL auto_increment
        , `player_name`     VARCHAR(255)DEFAULT NULL
        , `player_modified` DATETIME DEFAULT CURRENT_TIMESTAMP() ON
UPDATE
     CURRENT_TIMESTAMP()
   , `player_created` DATETIME DEFAULT CURRENT_TIMESTAMP()
   , PRIMARY KEY(`id`)
   , UNIQUE KEY `player_id_UNIQUE`(`id`)
     )
engine = innodb DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;