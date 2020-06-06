const messageService = require("../../services/messageService");

const echoAtTime = (req, res) => {
    messageService.addMessage(req.body.time, req.body.message)
        .then(() => res.json({status: "OK"}))
        .catch((err) => {
            console.error("Error while adding a message", err.stack);
            res.status(500).json({status: "BAD"});
        });
};

module.exports = {
    echoAtTime
};