'use strict'
import readyController from './controllers/ready.controller.js'
import express from 'express'
import { asyncQuery } from './models/mariadb.db.model.js'
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
	app.listen(3000, () => console.log(new Date(), 'Server Started'))
})
readyController.emit('readyToListen')

// TODO: add 'logger' everywhere

logger.info('Server Started')
