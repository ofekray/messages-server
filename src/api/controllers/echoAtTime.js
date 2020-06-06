const messageService = require("../../services/messageService");
const { ValidationError } = require("../../services/errors");

const echoAtTime = (req, res) => {
    messageService.addMessage(req.body.time, req.body.message)
        .then(() => res.json({ status: "success" }))
        .catch((err) => {
            if (err instanceof ValidationError) {
                res.status(400).json({ status: "error", message: err.message });
            }
            else {
                console.error("Error while adding a message", err.stack);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });
};

module.exports = {
    echoAtTime
};