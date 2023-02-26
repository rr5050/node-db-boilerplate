# Starter Boilerplate for Node.js + MariaDB +++

    setup:
    npm install
    docker-compose up -d
    npm run dev

Status: Still errors/unfinished code here, so not usable as a final product for anyone yet. But can give some ideas for how to use MariaDB for example :)

### Docker-compose

Will setup a MariaDB server with a docker volume to contain the database. If it's not present at startup, the database will be started and then initialized with files in the folder './src/db/sql/initdb' - using them in an alfabetically order.

---

### mariadb.db.model.js

Has been specifically setup to recover from most errors. You still need to write proper SQL and handle results properly.

in any back-end javascript file, import it with:

    import { asyncQuery } from './models/mariadb.db.model.js'

and call it with the async function (with await):

    asyncQuery(query, params)

---

### ready.controller.js

Makes it possible to listen for connections once all other parts of the server are ready. i.e. no database calls to router before database server is ready, etc...

in the file 'ready.controller.js' you set which events to listen for in the variable at the top: 'eventsToWaitFor'

in any back-end javascript file, import it with:

    import readyController from '../controllers/ready.controller.js'

and trigger events as following (success and fail shown):

    readyController.emit('eventName')
    readyController.emit('eventName:error')

---

### query.db.model.js

Will setup all queries needed for databases, including loading them from files.
