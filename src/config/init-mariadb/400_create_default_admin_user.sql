USE rpgdb;
/* create an admin user */
CALL sp_create_player_login_return_playerid_admin('xx@gmail.no', 1, 'xx');