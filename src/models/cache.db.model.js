'use strict'
import mariadb from '../models/mariadb.db.model.js'
import redis from '../models/redis.db.model.js'
import QUERY from '../models/query.db.model.js'
import logger from '../service/logger.service.js'
import SqlString from 'sqlstring'

const buildRedisQuery = (command, myQuery, params, value) => {
	// make a true array copy of the redis command so we don't change the original later on
	let query = [...QUERY[myQuery].redis[command].cmd]

	if (command === 'read' || command === 'write') {
		// change array for KEY: replace each question (?) with params
		let keypos = QUERY[myQuery].redis[command].keypos ?? 1 // if no keypos is set, default to 1
		query[keypos] = SqlString.format(query[keypos], params)
	}

	if (command === 'write') {
		// change array for VALUE
		let valuepos = QUERY[myQuery].redis[command].valuepos ?? 2 // if no valuepos is set, default to 2
		query[valuepos] = value
	}
	return query
}

// Setup Queries in 'query.db.model.js'
// Flow pattern: read redis (stop if result) -> read mariadb -> delete redis -> write redis -> return result
const cachedb = async (myQuery, params) => {
	console.time('cachedb_total_timer')

	let result = null

	// check redis first
	if (QUERY[myQuery].redis && QUERY[myQuery].redis.read) {
		console.time('cachedb_redis_read')
		result = JSON.parse(await redis.customCall(buildRedisQuery('read', myQuery, params)))
		console.timeEnd('cachedb_redis_read')
	}

	if (result === null) {
		// redis didn't have any data. Check with mariadb instead
		console.time('cachedb_mariadb')
		result = await mariadb.asyncQuery(QUERY[myQuery].sql, params)

		// keep only select data from mariadb. Other result data is stripped away
		if (Array.isArray(result[0])) {
			result = result[0]
		}

		console.timeEnd('cachedb_mariadb')

		// delete redis keys based on pattern (and finish this before writing new data to redis)
		if (QUERY[myQuery].redis && QUERY[myQuery].redis.delete) {
			console.time('cachedb_redis_delete')
			await redis.customDelete(QUERY[myQuery].redis.delete.keys, params)
			console.timeEnd('cachedb_redis_delete')
		}

		// store the result from mariadb in redis for future cache
		if (QUERY[myQuery].redis && QUERY[myQuery].redis.write) {
			console.time('cachedb_redis_write')
			await redis.customCall(
				buildRedisQuery('write', myQuery, params, JSON.stringify(result))
			)
			console.timeEnd('cachedb_redis_write')
		}
	}

	console.timeEnd('cachedb_total_timer')
	return result
}

export default cachedb

// TODO: remove console timers above
