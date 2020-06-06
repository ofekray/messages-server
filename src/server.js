const { startApi } = require("./api");
const { startMessageChecking } = require("./services/messageService");

startApi();
startMessageChecking();