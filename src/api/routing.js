const { echoAtTime } = require("./controllers/echoAtTime");

const registerRoutes = (app) => {
    app.post('/echoAtTime', echoAtTime);
}

module.exports = {
    registerRoutes
};