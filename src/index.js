'use strict'
import * as config from './config/misc.config.js'
import readyController from './controllers/ready.controller.js'
import express from 'express'
import cachedb from './models/cache.db.model.js'
import logger from './service/logger.service.js'

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

// examples below here..........................................................
let myQuery = null
let params = null
let dbresult = null
//
//
// executing a sql statement (select from table) with no parameters, and no cache. The sql statement is stored in a file.
console.log('-----get_login_table_without_cache----')
myQuery = 'get_login_table_without_cache'
dbresult = await cachedb(myQuery, [])
console.log(dbresult)
//
//
// executing a sql statement (select from table) with no parameters, WITH cache. The sql statement is stored in a file.
console.log('-----get_login_table_with_cache----')
myQuery = 'get_login_table_with_cache'
dbresult = await cachedb(myQuery, [])
console.log(dbresult)
//
//
// calling a stored procedure that both writes and reads sql. the read part is cached on future calls
console.log('-----create_player_login_return_playerid_admin----')
myQuery = 'create_player_login_return_playerid_admin'
params = ['xx@gmail.com103', 1, 'xx']
dbresult = await cachedb(myQuery, params)
console.log(dbresult)
