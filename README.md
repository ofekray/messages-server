# messages-server
Run `npm start` to start the server, you should have a redis server running locally on port 6379.

Run `npm test` to run the unit tests

To send a message to the server, make an HTTP POST request to `http://localhost:3000/echoAtTime` with the following json:

`{ message: "example", time: 1591433633863 }`

The time should be in epoch time format

You can can use environment variables to change the server port and the redis host and port:
`SERVER_PORT`, `REDIS_PORT`, `REDIS_HOST`
