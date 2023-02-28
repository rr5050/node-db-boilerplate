'use strict'
import * as dotenv from 'dotenv'
import { logger } from '../service/logger.service.js'
import readyController from '../controllers/ready.controller.js'
import mariadb from 'mariadb'

dotenv.config()

const clientOptions = {
	host: process.env.DB_HOST,
	// host: '192.168.0.0',
	port: process.env.DB_PORT,
	// port: '1000',
	user: process.env.DB_USER,
	// user: 'wronguser',
	password: process.env.DB_PASSWORD,
	// password: 'passwordwrong',
	database: process.env.DB_NAME,
	// database: 'wrongdatabase',
	connectionLimit: process.env.DB_CONNECTION_LIMIT,
}

const dbErrorHandling = (err) => {
	const errorsThatWeWantToCrashNode = ['ER_DBACCESS_DENIED_ERROR', 'ER_ACCESS_DENIED_ERROR']
	if (errorsThatWeWantToCrashNode.includes(err.code)) {
		logger.info(
			'Mariadb: access denied. Check credentials: user, password, database: ',
			err.code
		)
		setTimeout(() => {
			process.exit(1)
		}, 3000)
	} else {
		logger.warn(
			'Mariadb: error suppressed (Node not crashing) (check credentials: host, port): ',
			err.code,
			err.message
		)
	}
}

const interceptFuturePoolErrors = (newPool) => {
	newPool.on('error', (err) => {
		dbErrorHandling(err)
	})
}

const createPool = async () => {
	let tmpConn
	try {
		tmpConn = await mariadb.createConnection(clientOptions)

		const rows = await tmpConn.query('SELECT 1 as ok')
		if (!(rows[0].ok === 1)) {
			throw new Error('test connection query failed while creating pool')
		}

		const newPool = mariadb.createPool(clientOptions)
		interceptFuturePoolErrors(newPool)
		return newPool
	} catch (err) {
		dbErrorHandling(err)
	} finally {
		if (tmpConn) tmpConn.end()
	}
}

var pool = null

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
export const asyncQuery = async (myQuery, params) => {
	console.time('Query timer')
	let conn
	let res = null
	try {
		// create a pool if it's unavailable. Get a connection from the pool
		if (!pool) {
			logger.info('Mariadb: pool unavailable. Creating a new one.')
			pool = await createPool()
		}
		conn = await pool.getConnection()

		// test the connection before we send the actual query
		const rows = await conn.query('SELECT 1 as ok')
		if (!(rows[0].ok === 1)) {
			throw new Error('test connection query failed')
		}

		// send the actual query
		res = await conn.query(myQuery, params)
	} catch (err) {
		logger.error('Mariadb: ', err.message)
	} finally {
		console.timeEnd('Query timer')
		if (conn) conn.release()
		return res // will contain null or result
	}
}

// Will be resolved as asyncQuery function, except that the result-set will be an array
// input and output is otherwise same as that function
export const asyncQueryArray = async (myQuery, params) => {
	myQuery = { rowsAsArray: true, sql: myQuery }
	return await asyncQuery(myQuery, params)
}

// TODO: setup readyController with createpool

/* 
var pool = await createPool()


console.log('Total connections: ', pool.totalConnections())
console.log('Active connections: ', pool.activeConnections())
console.log('Idle connections: ', pool.idleConnections())
*/
