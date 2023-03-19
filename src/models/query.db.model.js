'use strict'
import readyController from '../controllers/ready.controller.js'
import { readFiles } from '../utils/files.util.js'

const readyControllerWaitForEvent = 'query.db.model'
const pathToSQLfiles = './src/config/init-mariadb/'

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

		const tmpQuery = {
			create_player_login_return_playerid_admin: {
				sql: `call sp_create_player_login_return_playerid_admin(?,?,?)`, // input: email, is_admin, player_name. Output: players_id, is_admin
				redis: {
					get: 'hget login ?', // input: email. Output: players_id, is_admin
					set: 'hset login ? ?', // input: email, (players_id, is_admin)
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

// TODO: fill in some queries
// TODO: change the directory to scan for files to the correct folder
