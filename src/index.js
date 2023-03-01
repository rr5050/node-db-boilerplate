'use strict'
import readyController from './controllers/ready.controller.js'
import express from 'express'
import { asyncQuery, asyncQueryArray } from './models/mariadb.db.model.js'
import { QUERY } from './models/query.db.model.js'
import { logger } from './service/logger.service.js'

const app = express()

app.get('/', (req, res) => {
	res.send(`Home page`)
	asyncQuery()
	console.log('home page')
})

app.get('/users', (req, res) => {
	res.send('Users Page')
	console.log('Users page')
})

readyController.on('allReady', () => {
	app.listen(3000, () => logger.info(`Server is running on port 3000`))
})
readyController.emit('readyToListen')

setTimeout(() => {
	;(async () => {
		const myQuery = 'SELECT * FROM patientsdb.patients where id = ?'
		const params = [1]
		const res = await asyncQuery(myQuery, params)
		console.log(res)

		const resarray = await asyncQueryArray(myQuery, params)
		console.log(resarray)
	})()
}, 5000)
