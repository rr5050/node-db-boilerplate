'use strict'
// import this file as the entry point in your Node.js app
import * as dotenv from 'dotenv'

// setting the env variables. Accecible from now on everywhere as: process.env.<VARIABLE_NAME>
dotenv.config()

// This makes 'JSON.stringify' able to handle Bigints (but only upto 53bit). If needed above, use the function in 'misc.utils.js': toJson
BigInt.prototype['toJSON'] = function () {
	return parseInt(this.toString())
}
