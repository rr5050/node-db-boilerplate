'use strict'
import { logger } from '../service/logger.service.js'
import readyController from '../controllers/ready.controller.js'
import Mariadb from 'mariadb'

class MyMariadb {
	constructor() {
		this.clientOptions = {
			host: process.env.MARIADB_HOST,
			port: process.env.MARIADB_PORT,
			user: process.env.MARIADB_USER,
			password: process.env.MARIADB_PASSWORD,
			database: process.env.MARIADB_NAME,
			connectionLimit: process.env.MARIADB_CONNECTION_LIMIT,
		}

		this.pool = null

		// create a pool on startup, so we can check log right away for any errors
		;(async () => {
			try {
				if (!this.pool) {
					this.pool = await this.createPool(this.clientOptions)
				}
			} catch (err) {
				this.dbErrorHandling(err)
			}
		})()
	}

	dbErrorHandling = (err) => {
		const errorsThatWeWantToCrashNode = ['ER_DBACCESS_DENIED_ERROR', 'ER_ACCESS_DENIED_ERROR']
		if (errorsThatWeWantToCrashNode.includes(err.code)) {
			logger.fatal(
				'Mariadb: access denied. Check credentials: user, password, database: ',
				err.code
			)
			setTimeout(() => {
				process.exit(1)
			}, 3000)
		} else {
			logger.error('Mariadb: error suppressed: ', err.code + ', ' + err.message)
		}
		if (err.poolCreationError === 'true') {
			logger.error(
				'Mariadb: could not create a pool. Check credentials: user, password, database, host, port: ',
				err.code
			)
			readyController.emit('mariadb.db.model:error')
		}
	}

	interceptFuturePoolErrors = (newPool) => {
		newPool.on('error', (err) => {
			this.dbErrorHandling(err)
		})
	}

	createPool = async (params) => {
		let tmpConn
		try {
			tmpConn = await Mariadb.createConnection(params)
			const rows = await tmpConn.query('SELECT 1 as ok')
			if (!(rows[0].ok === 1)) {
				throw new Error('Mariadb: test connection query failed while creating pool')
			}

			const newPool = Mariadb.createPool(params)
			this.interceptFuturePoolErrors(newPool)
			readyController.emit('mariadb.db.model')
			return newPool
		} catch (err) {
			err.poolCreationError = 'true'
			this.dbErrorHandling(err)
		} finally {
			if (tmpConn) tmpConn.end()
		}
	}

	// query the MariaDB database. Handles getting a connection.
	// input: myQuery = SQL statement to execute. Use ? for parameters.
	//        params  = parameters to pass to the SQL statement. Array of values (unless single value)
	//
	// returns: Promise that resolves to the result of the query. with a JSON object for update / insert / delete or a result - set object for result - set.
	// Any error will cause the result to be null.
	//
	// A write statement, (such as INSERT, DELETE and UPDATE), result is a JSON object with the following properties:
	// 		affectedRows:  An integer listing the number of affected rows.
	// 		insertId: 	   An integer noting the auto-increment ID of the last row written to the table.
	// 		warningStatus: An integer indicating whether the query ended with a warning.
	asyncQuery = async (myQuery, params) => {
		let conn
		let res = null
		try {
			// create a pool if it's unavailable. Get a connection from the pool
			if (!this.pool) {
				logger.info('Mariadb: pool unavailable. Creating a new one.')
				this.pool = await this.createPool(this.clientOptions)
			}
			conn = await this.pool.getConnection()

			// test the connection first
			const rows = await conn.query('SELECT 1 as ok')
			if (!(rows[0].ok === 1)) {
				throw new Error('Mariadb: test connection query failed')
			}

			// send the actual query
			res = await conn.query(myQuery, params)
		} catch (err) {
			this.dbErrorHandling(err)
		} finally {
			if (conn) conn.release()
			return res // will contain result, or null if failed
		}
	}

	// Will be resolved as asyncQuery function, except that the result-set will be an array
	// input and output is otherwise same as that function
	asyncQueryArray = async (myQuery, params) => {
		myQuery = { rowsAsArray: true, sql: myQuery }
		return await this.asyncQuery(myQuery, params)
	}
}

const mariadb = new MyMariadb()

export default mariadb
