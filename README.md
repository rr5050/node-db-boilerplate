# Starter Boilerplate for Node.js + cache db (MariaDB+Redis) +++

    setup:
    npm install
    docker-compose up -d
    npm run dev

### Docker-compose

Will setup a MariaDB server with a docker volume to contain the database. If it's not present at startup, the database will be started and then initialized with files in the folder './src/config/init-mariadb' - using them in an alfabetically order.

---

### cache.db.model.js

Access both MariaDB and Redis with this module using only one function. Cache is handled by your setup in the query module, 'query.db.model.js'. This has been designed so that in most caces you would not need direct access to mariadb or redis - instead you ONLY use this one.

in any back-end javascript file, import it with one of these:

    import cachedb from './models/cache.db.model.js'

and call it like this:

    const dbresult = await cachedb(myQuery, params)

---

### query.db.model.js

Templates for queries regarding access to MariaDB and Redis, optimized to be used for caching queries with the module 'cache.db.model.js'

in any back-end javascript file, import it with one of these:

    import QUERY from './models/query.db.model.js'

---

### mariadb.db.model.js

Has been specifically setup to recover from most errors. You still need to write proper SQL and handle results properly.

in any back-end javascript file, import it with one of these:

    import mariadb from './models/mariadb.db.model.js'

and call it with one of these async functions with await:

    result = await mariadb.asyncQuery(myQuery, params)
    result = await mariadb.asyncQueryArray(myQuery, params)

---

### redis.db.model.js

Has been specifically setup to recover from most errors. Using io-redis as a client, and setup to keep connection alive.

in any back-end javascript file, import it with one of these:

    import redis from './models/redis.db.model.js'

and call it with:

    redis.<any-ioredis-commands>
    result = await redis.customCall(<any-redis-commands-spliced-up-into-an-array>)
    await redis.customDelete(<array-of-key-patterns-to-delete>,<params>)

Examples used in the code (see code for more details):

    result = JSON.parse(await redis.customCall(buildRedisQuery('read', myQuery, params)))
    await redis.customCall(buildRedisQuery('write', myQuery, params, JSON.stringify(result)))
    await redis.customDelete(QUERY[myQuery].redis.delete.keys, params)

---

### ready.controller.js

Makes it possible to listen for connections once all other parts of the server are ready. i.e. no database calls to router before database server is ready, etc...

in the file 'ready.controller.js' you set which events to listen for in the variable at the top: 'eventsToWaitFor'

in any back-end javascript file, import it with:

    import readyController from '../controllers/ready.controller.js'

and trigger events as following (success and fail shown):

    readyController.emit('eventName')
    readyController.emit('eventName:error')
