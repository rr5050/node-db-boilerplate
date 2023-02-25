'use strict'
// Lists event to wait for in the array: eventsToWaitFor
// To trigger a successfull event: readyController.emit('eventName')
// To trigger an error event:      readyController.emit('eventName:error')
// As the first import on any file that needs to be ready before server start:
//   import readyController from './controller/ready.controller.js'
//
// To start the Node server, use this:
//    readyController.on('allReady', () => {
// 	    app.listen(3000, () => console.log('Server Started'))
//    })
//    readyController.emit('StartServer')

import { EventEmitter } from 'node:events'

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

const eventsToWaitFor = ['readyToListen', 'query.db.model']

const waitEvent = (event) => {
	return new Promise((resolve, reject) => {
		myEmitter.once(event, () => {
			setImmediate(() => {
				console.log(new Date(), 'readyController - Event resolved: ' + event)
				resolve()
			})
		})
		myEmitter.once(event + ':error', () => {
			setImmediate(() => {
				console.error(new Date(), 'readyController - Event rejected: ' + event)
				reject()
			})
		})
		myEmitter.once('error', () => {
			setImmediate(() => {
				console.error(new Date(), 'readyController - An unknown event was rejected')
				reject()
			})
		})
	})
}

const waitForAll = async () => {
	let pendingEvents = []
	console.log(new Date(), 'readyController - Waiting for events: ' + eventsToWaitFor.join(', '))
	eventsToWaitFor.forEach((event) => {
		pendingEvents.push(waitEvent(event))
	})
	await Promise.all(pendingEvents)
}

waitForAll()
	.then(() => {
		console.log(new Date(), 'readyController - All events resolved')
		myEmitter.emit('allReady')
	})
	.catch(() => {
		console.error(
			new Date(),
			'readyController - Some events was rejected. Server will not start'
		)
	})

export default myEmitter
