const { Tedis } = require("tedis");

const DEFAULT_PORT = 6379;
const DEFAULT_HOST = "localhost";
const PORT_ENV_VAR = "REDIS_PORT";
const HOST_ENV_VAR = "REDIS_HOST";

const tedis = new Tedis({
    port: process.env[PORT_ENV_VAR] ? +process.env[PORT_ENV_VAR] : DEFAULT_PORT,
    host: process.env[HOST_ENV_VAR] ? +process.env[HOST_ENV_VAR] : DEFAULT_HOST,
});

tedis.on("error", (err) => {
    console.error(err);
});

module.exports = tedis;