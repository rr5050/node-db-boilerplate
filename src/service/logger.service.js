'use strict'
import * as dotenv from 'dotenv'
import log from 'simple-node-logger'
import { isStringAndGreaterThanLength } from '../utils/misc.utils.js'

/*
	import:
		import { logger } from './service/logger.service.js'

	Usage:
		logger.trace('<message>')
		logger.debug('<message>')
		logger.info('<message>')
		logger.warn('<message>')
		logger.error('<message>')
		logger.fatal('<message>')
*/

dotenv.config()

const logOptions = {
	logFilePath: process.env.LOG_PATHFILE,
	timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
}

// remove logging to file if a pathfile was not provided in environemt variables
if (!isStringAndGreaterThanLength(process.env.LOG_PATHFILE, 0)) {
	delete logOptions.logFilePath
}

export const logger = log.createSimpleLogger(logOptions)

/*
	Log levels: (setting : what is logged) (if not set, 'info' will be used) (set in environment variables)
	'all'   : all
	'trace' : all
	'debug' : debug, info, warn, error, fatal
	'info'  : info, warn, error, fatal
	'warn'  : warn, error, fatal
	'error' : error, fatal
	'fatal' : fatal
*/
logger.setLevel(process.env.LOG_LEVEL)
