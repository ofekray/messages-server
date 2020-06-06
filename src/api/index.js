const express = require('express');
const bodyParser = require("body-parser");
const { registerRoutes } = require("./routing");

const port = 3000;
const app = express();

app.use(bodyParser.json());
registerRoutes(app);

const startApi = () => app.listen(port, () => console.log(`Messages server listening on port ${port}`));

module.exports = {
    startApi
};