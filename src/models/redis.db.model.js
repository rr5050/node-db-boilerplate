import { Redis } from 'ioredis'

// Create a Redis instance.
// By default, it will connect to localhost:6379.
// We are going to cover how to specify connection options soon.
export const redis = new Redis({
	port: 6379, // Redis port
	host: '127.0.0.1', // Redis host
	username: 'default', // needs Redis >= 6
	password: '1234',
	db: 0, // Defaults to 0
})

redis.set('mykey', '56789') // Returns a promise which resolves to "OK" when the command succeeds.

// ioredis supports the node.js callback style
redis.get('mykey', (err, result) => {
	if (err) {
		console.error(err)
	} else {
		console.log(result)
	}
})

// Or ioredis returns a promise if the last argument isn't a function
redis.get('mykey').then((result) => {
	console.log(result)
})

redis.zadd('sortedSet', 1, 'one', 2, 'dos', 4, 'quatro', 3, 'three')
redis.zrange('sortedSet', 0, 2, 'WITHSCORES').then((elements) => {
	// ["one", "1", "dos", "2", "three", "3"] as if the command was `redis> ZRANGE sortedSet 0 2 WITHSCORES`
	console.log(elements)
})

// All arguments are passed directly to the redis server,
// so technically ioredis supports all Redis commands.
// The format is: redis[SOME_REDIS_COMMAND_IN_LOWERCASE](ARGUMENTS_ARE_JOINED_INTO_COMMAND_STRING)
// so the following statement is equivalent to the CLI: `redis> SET mykey hello EX 10`
redis.set('mykey', 'hello', 'EX', 10)

//------------------------------------------------------------------------

// temporary copy/paste from
// https://facsiaginsa.com/nodejs/redis-cache-tutorial-nodejs
// using ioredis

// const getCache = async (key) => {
// 	let result = JSON.parse(await redis.get(key))
// 	return result
// }

// const setCache = async (key, value) => {
// 	let stringifiedValue = JSON.stringify(value)
// 	return await redis.setex(key, cacheExpired, stringifiedValue)
// }
