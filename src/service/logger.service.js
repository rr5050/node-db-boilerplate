'use strict'
import log from 'simple-node-logger'
import { isStringAndGreaterThanLength } from '../utils/misc.utils.js'

/*
	import:
		import logger from './service/logger.service.js'

	Usage:
		logger.trace('<message>')
		logger.debug('<message>')
		logger.info('<message>')
		logger.warn('<message>')
		logger.error('<message>')
		logger.fatal('<message>')

	Set environment variables:
		LOG_TO_SINGLEFILE_PATHFILE=<path and file for logfile>
		LOG_TO_ROLLINGFILES_PATH=<path for logfiles>
		LOG_TO_CONSOLE=true
		LOG_LEVEL=all

	- Path(s) must exist and writable
	- 'LOG_TO_...' variables: skip/or set blank to not execute that part

	Log levels: (setting : what is logged) (if not set, 'info' will be used) (set in environment variables)
		'all'   : all
		'trace' : all
		'debug' : debug, info, warn, error, fatal
		'info'  : info, warn, error, fatal
		'warn'  : warn, error, fatal
		'error' : error, fatal
		'fatal' : fatal
*/

const logOptions = {
	logFilePath: process.env.LOG_TO_SINGLEFILE_PATHFILE, // path must exist and writable
	timestampFormat: 'YYMMDD HHmmss',
	logDirectory: process.env.LOG_TO_ROLLINGFILES_PATH, // path must exist and writable
	fileNamePattern: 'steds-server-<DATE>.log',
	dateFormat: 'YYYY.MM.DD',
}

function createLogger(opts) {
	const manager = new log(opts)

	if (process.env.LOG_TO_CONSOLE === 'true') {
		manager.createConsoleAppender(opts)
	}

	if (isStringAndGreaterThanLength(process.env.LOG_TO_SINGLEFILE_PATHFILE, 0)) {
		manager.createFileAppender(opts)
	}

	if (isStringAndGreaterThanLength(process.env.LOG_TO_ROLLINGFILES_PATH, 0)) {
		manager.createRollingFileAppender(opts)
	}

	return manager.createLogger()
}

const logger = createLogger(logOptions)
logger.setLevel(process.env.LOG_LEVEL)

export default logger
