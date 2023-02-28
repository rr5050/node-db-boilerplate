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
			'Mariadb: error suppressed (Node not crashing) (check credentials: host, port):',
			err.code
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
		await tmpConn.query('SELECT 1 as val')
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

export const asyncQuery = async (myQuery, params) => {
	console.time('Query timer')
	let conn
	try {
		if (!pool) {
			logger.info('Mariadb: pool unavailable. Creating a new one.')
			pool = await createPool()
		}
		console.log('Here')
		conn = await pool.getConnection()
		const rows = await conn.query('SELECT 1 as val')
		console.log(rows)
		const res = await conn.query(myQuery, params)
		console.log(res)
	} catch (err) {
		console.log(err)
		// throw err
	} finally {
		console.timeEnd('Query timer')
		if (conn) return conn.release()
	}
}

// TODO: return query results
// TODO: validate the 'select 1 as val' query before next line
// TODO: remove/cleanup console logging
// TODO: check the catch(err) block for errors
// TODO: setup readyController

// const myQuery = 'SELECT * FROM patientsdb.patients where id = ? '
// const params = [1]
// asyncQuery()

/* 
var pool = await createPool()


console.log('Total connections: ', pool.totalConnections())
console.log('Active connections: ', pool.activeConnections())
console.log('Idle connections: ', pool.idleConnections())
*/
