'use strict'
import mariadb from '../models/mariadb.db.model.js'
import redis from '../models/redis.db.model.js'
import QUERY from '../models/query.db.model.js'
import logger from '../service/logger.service.js'
import SqlString from 'sqlstring'

const cachedb = async (myQuery, params) => {
	let mariadbResult = await mariadb.asyncQuery(QUERY[myQuery].sql, params)
	mariadbResult = JSON.stringify(mariadbResult[0])

	// let redisQuery = SqlString.format(QUERY[myQuery].redis.get, params)

	let redisQuery = ['rino', 'rabex12']

	let redisResult = await redis.customCall(redisQuery)

	console.log(redisResult)

	return mariadbResult
}

const myQuery = 'create_player_login_return_playerid_admin'
const params = ['max3@hei.hopp', 1, 'test og nissen2']
const dbresult = await cachedb(myQuery, params)
console.log(dbresult)

export default cachedb

// // convert string to Buffer
// const buff = Buffer.from(str, "utf-8");

// // convert buffer to string
// const resultStr = buff.toString();
