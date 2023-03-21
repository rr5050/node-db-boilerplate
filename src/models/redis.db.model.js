'use strict'
import readyController from '../controllers/ready.controller.js'
import logger from '../service/logger.service.js'
import { Redis } from 'ioredis'
import SqlString from 'sqlstring'

class MyRedis extends Redis {
	constructor() {
		super({
			//TODO: add bind
			//TODO: add host
			//TODO: add username
			//TODO: add lazy delete (unlink)
			port: process.env.REDIS_PORT,
			host: '127.0.0.1',
			username: 'default',
			password: process.env.REDIS_PASSWORD,
			db: 0,
			lazyConnect: true,
			connectTimeout: 3000,
			enableReadyCheck: true,
			enableAutoPipelining: true,
			// enableOfflineQueue: false,
			retryStrategy: function (times) {
				if (times % 4 == 0) {
					// Initial + retry = 4 times we try to connect. Giving up after that. Data access functions below will retry when we try to access Redis again
					logger.warn('Redis: retryStrategy - reconnect exhausted')
					return null
				}
				return 200
			},
			reconnectOnError(err) {
				const targetError = 'READONLY'
				if (err.message.includes(targetError)) {
					// according to ioredis docs, this is a good thing to have on AWS services (not tested by me)
					logger.warn('Redis: reconnectOnError - READONLY: ', err.message)
					return true
				}
			},
		})

		super.on('connect', () => {
			logger.debug('Redis: status = connecting')
		})

		super.on('ready', () => {
			logger.debug('Redis: status = ready')
		})

		super.on('error', (err) => {
			logger.error('Redis: Error @ ', err.message)
		})

		super.on('close', () => {
			logger.debug('Redis: status = close')
		})

		super.on('reconnecting', (time) => {
			logger.debug(`Redis: status = reconnecting - ${time}ms`)
		})

		super.on('end', () => {
			logger.debug('Redis: status = end')
		})

		super.on('wait', () => {
			logger.debug('Redis: status = wait')
		})

		// Check connection. Signal to readyController the final status.
		super
			.ping()
			.then(() => {
				// all ok
				readyController.emit('redis.db.model')
			})
			.catch((err) => {
				logger.fatal(
					'Redis: Could not connect. Is the server up? Check credentials (host, port, username, password): ',
					err
				)
				readyController.emit('redis.db.model:error')
			})
	}

	updateConnection = async () => {
		if (this.status === 'end') {
			logger.debug('Redis: not connected. Trying to reconnect')
			await super.connect()
		}
	}

	customCall = async (params) => {
		try {
			await this.updateConnection()
			const output = await super.call(...params)
			return output
		} catch (err) {
			logger.error('Redis: error @ customCall: ', err)
			throw err
		}
	}

	customDelete = async (keyPatterns, params) => {
		try {
			await this.updateConnection()
			let keysToDelete = []
			for (let keyPattern of keyPatterns) {
				keyPattern = SqlString.format(keyPattern, params) // replace each question (?) with params
				const newKeystoDelete = await super.keys(keyPattern) // get all keys matching the pattern
				keysToDelete.push(...newKeystoDelete) // add all keys to the array
			}
			if (keysToDelete.length > 0) {
				await super.del(keysToDelete) // delete all matching keys
			}
			return
		} catch (err) {
			logger.error('Redis: error @ customDelete: ', err)
			throw err
		}
	}
}

const redis = new MyRedis()

export default redis
