'use strict'
// Lists event to wait for in the array: eventsToWaitFor
// To trigger a successfull event: readyController.emit('eventName')
// To trigger an error event:      readyController.emit('eventName:error')
// As the first import on any file that needs to be ready before server start:
//   import readyController from './controller/ready.controller.js'
//
// To start the Node server, use this:
//    readyController.on('allReady', () => {
//		app.listen(3000, () => logger.info(`Server is running on port 3000`))
//    })
//    readyController.emit('StartServer')

import { EventEmitter } from 'node:events'
import { logger } from '../service/logger.service.js'

class MyEmitter extends EventEmitter {}

const readyController = new MyEmitter()

const eventsToWaitFor = ['readyToListen', 'mariadb.db.model', 'redis.db.model', 'query.db.model']

const waitEvent = (event) => {
	return new Promise((resolve, reject) => {
		readyController.once(event, () => {
			setImmediate(() => {
				logger.info('readyController - Event resolved: ' + event)
				resolve()
			})
		})
		readyController.once(event + ':error', () => {
			setImmediate(() => {
				logger.warn('readyController - Event rejected: ' + event)
				reject()
			})
		})
		readyController.once('error', () => {
			setImmediate(() => {
				logger.warn('readyController - An unknown event was rejected')
				reject()
			})
		})
	})
}

const waitForAll = async () => {
	let pendingEvents = []
	logger.info('readyController - Waiting for events: ' + eventsToWaitFor.join(', '))
	eventsToWaitFor.forEach((event) => {
		pendingEvents.push(waitEvent(event))
	})
	await Promise.all(pendingEvents)
}

waitForAll()
	.then(() => {
		logger.info('readyController - All events resolved')
		readyController.emit('allReady')
	})
	.catch(() => {
		logger.fatal('readyController - Some events was rejected. Server will not start')
		setTimeout(() => {
			process.exit() // exit process after a timeout - to let logger log to file and console
		}, 5000)
	})

export default readyController
