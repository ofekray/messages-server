const express = require('express');
const bodyParser = require("body-parser");
const { registerRoutes } = require("./routing");

const DEFAULT_PORT = 3000;
const PORT_ENV_VAR = "SERVER_PORT";

const port = process.env[PORT_ENV_VAR] ? +process.env[PORT_ENV_VAR] : DEFAULT_PORT;
const app = express();

app.use(bodyParser.json());
registerRoutes(app);

const startApi = () => app.listen(port, () => console.log(`Messages server listening on port ${port}`));

module.exports = {
    startApi
};