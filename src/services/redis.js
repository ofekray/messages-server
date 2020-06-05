const { Tedis } = require("tedis");

const tedis = new Tedis({
    port: 6379,
    host: "localhost"
});

tedis.on("error", (err) => {
    console.error(err);
});

module.exports = tedis;