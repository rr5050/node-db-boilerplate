'use strict'
import * as config from './config/misc.config.js'
import readyController from './controllers/ready.controller.js'
import express from 'express'
import mariadb from './models/mariadb.db.model.js'
import redis from './models/redis.db.model.js'
import QUERY from './models/query.db.model.js'
import cachedb from './models/cache.db.model.js'
import logger from './service/logger.service.js'
import SqlString from 'sqlstring'

const app = express()

app.get('/', (req, res) => {
	console.log('------------------------ NEW PAGE REFRESH ------------------------')
	res.send(`Home page`)
	console.log('home page')
})

app.get('/users', (req, res) => {
	console.log('======================== NEW PAGE REFRESH ========================')
	res.send('Users Page')
	console.log('Users page')
})

readyController.on('allReady', () => {
	app.listen(3000, () => logger.info(`Server is running on port 3000`))
})
readyController.emit('readyToListen')

// ---------------------------------------------------------- test mariadb with 2 queries

// setTimeout(() => {
// 	;(async () => {
// 		const myQuery = QUERY.create_player_login_return_playerid_admin.sql
// 		const params = ['test og nissen2', 'max3@hei.hopp', 1]

// 		console.time('Timer')
// 		let res = await mariadb.asyncQuery(myQuery, params)
// 		console.timeEnd('Timer')
// 		console.log(res)

// 		// 		res = await mariadb.asyncQuery(myQuery, params)
// 		res = JSON.stringify(res[0])
// 		console.log(res)

// 		// 		res = JSON.parse(res)
// 		// 		console.log(res)

// 		console.log('*************************************')

// 		let resarray = await mariadb.asyncQueryArray(myQuery, params)
// 		console.log(resarray)

// 		resarray = JSON.stringify(resarray[0])
// 		console.log(resarray)

// 		// 		resarray = JSON.parse(resarray)
// 		// 		console.log(resarray)
// 	})()
// }, 1000)

// let arr2 = [10, 20, 30, 'rino']
// let newstring4 = SqlString.format('generation 2: ?, ?, ?, ?', arr2)
// console.log(newstring4)
//
//redis testing
//
// const keyParam = 'mykey'
// const valueParam = 'redis testing: rinorabe (from index.js)#2'
// redis.call('set', keyParam, valueParam)
// redis.get('mykey').then((result) => {
// 	console.log(result)
// })
//
// redis
// 	.customGet('mykey')
// 	.then((result) => {
// 		console.log('Result from redis.get function = ', result)
// 	})
// 	.catch((error) => {
// 		console.log('Error from redis.get function = ', error)
// 	})
