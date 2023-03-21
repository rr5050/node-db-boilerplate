'use strict'
import readyController from '../controllers/ready.controller.js'
import { readFiles } from '../utils/files.util.js'

const readyControllerWaitForEvent = 'query.db.model'
const pathToSQLfiles = './src/config/sql-queries/'

const querySettings = async (folder) => {
	try {
		const allFileContent = await readFiles(folder)

		const sqlfile = (filename) => {
			const fileContent = allFileContent[filename]
			if (fileContent === undefined) {
				console.error('query.db.model - Could not read the file:', filename)
				readyController.emit(readyControllerWaitForEvent + ':error')
				throw new Error('query.db.model - Could not read a file')
			} else return fileContent
		}

		/* Query setup for MariaDB and Redis, inlcuding cache handling between them
		 * name of the query: this is used directly in the cachedb function in 'cache.db.model.js'. Example below here: 'create_player_login_return_playerid_admin:'
		 * 		sql: and valid MariaDB (MySQL) query. Use question marks (?) for params.
		 * 			You can use the function 'sqlfile' to use as query (folder specified above here). Example...
		 * 				sql: sqlfile('filename.sql')
		 *
		 * 		redis: and only if a section is filled out (i.e. you don't need to fill out read, write and delete. you can pick which you want to fill out)
		 *   		read: check redis first, and if found will not execute query against MariaDB.
		 * 				keypos: default 1 if not specified. which array position in the 'cmd' where the Redis key is.
		 *   			cmd: the command to be executed vs redis. Can contain wildcards: ? to be replaced by params (as sql above)
		 *
		 *   		write: write result from MariaDB to redis for future cache
		 * 				keypos: default 1 if not specified. which array position in the 'cmd' where the Redis key is.
		 *				valuepos: default 2 if not specified. which array position in the 'cmd' where the Redis value is
		 *   			cmd: the command to be executed vs redis. Can contain wildcards: ? to be replaced by params (as sql above)
		 *
		 *   		delete: delete keys from redis to invalidate part of cache. This will be done BEFORE 'write' to redis above.
		 * 				keys: array of keys to be deleted from redis. Each can contain wildcards: * and characters of any length, ? to be replaced by params (as sql above)
		 */
		const tmpQuery = {
			create_player_login_return_playerid_admin: {
				sql: `call sp_create_player_login_return_playerid_admin(?,?,?)`, // params: email, is_admin, player_name. Output: players_id, is_admin
				redis: {
					read: {
						// keypos: 1, // Skip this line if you want default 1
						cmd: ['get', 'login|?'],
					},
					write: {
						// keypos: 1, // Skip this line if you want default 1
						// valuepos: 2, // Skip this line if you want default 2
						cmd: ['set', 'login|?', '', 'ex', '500'],
					},
					delete: {
						keys: ['test*', 'login|*'],
					},
				},
			},
		}
		readyController.emit(readyControllerWaitForEvent)
		return tmpQuery
	} catch (error) {
		console.error(error)
		readyController.emit(readyControllerWaitForEvent + ':error')
	}
}

const QUERY = await querySettings(pathToSQLfiles)

export default QUERY
