'use strict'
import readyController from '../controllers/ready.controller.js'
import logger from '../service/logger.service.js'
import { Redis } from 'ioredis'

class MyRedis extends Redis {
	constructor() {
		super({
			//TODO: add bind
			//TODO: add host
			//TODO: add username
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

		// Check connection. We signal to readyController the final status.
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

	customGet = async (...params) => {
		try {
			await this.updateConnection()
			const output = await super.get(...params)
			return output
		} catch (err) {
			logger.error('Redis: error @ customGet: ', err)
			throw err
		}
	}

	customSet = async (...params) => {
		try {
			await this.updateConnection()
			const output = await super.set(...params)
			return output
		} catch (err) {
			logger.error('Redis: error @ customSet: ', err)
			throw err
		}
	}

	customCall = async (...params) => {
		try {
			await this.updateConnection()
			// const output = await super.call('set', ...params)
			const output = await super.call(
				'set',
				'rino',
				Buffer.from(`[{"players_id":3,"is_admin":1}]`)
			)
			// const output = await super.call('get', 'rino')
			return output
		} catch (err) {
			logger.error('Redis: error @ customCall: ', err)
			throw err
		}
	}
}

const redis = new MyRedis()

export default redis

// TODO: create support for MULTI/EXEC commands:
// const replies = await client
// 	.multi()
// 	.call('JSON.SET', 'key', JSON.stringify({ field: 'value' }))
// 	.call('JSON.GET', 'key', '$')
//     .exec()
