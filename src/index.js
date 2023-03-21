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

//
// test case to see if cache of mariadb/redis is working
const myQuery = 'create_player_login_return_playerid_admin'
const params = ['xx@gmail.com79', 1, 'xx']
const dbresult = await cachedb(myQuery, params)
console.log(dbresult)
