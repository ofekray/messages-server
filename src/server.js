const redisClient = require("./services/redis");
const express = require('express');
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

app.post('/echoAtTime', (req, res) => {
    addMessage(req.body.time, req.body.message)
        .then(() => res.json({status: "OK"}))
        .catch((err) => {
            console.error("Error while adding a message", err.stack);
            res.status(500).json({status: "BAD"});
        });
});

const port = 3000;
app.listen(port, () => console.log(`Messages server started on port ${port}`));

const MESAGGES_KEY = "messages";

const checkMessage = async() => {
    try {
        const messageItem = await fetchMessage();
        if (messageItem) {
            const {id, message, time} = messageItem;
            const now = new Date().getTime();
            if (time <= now) { 
               const lock = await lockMessage(id);
               if (lock) {
                   console.log(message);
                   await deleteMessage(id, message);
                   await unlockMessage(id);
               }
            }
        }
    }
    catch(err) {
        console.error("Error while checking message", err);
    }
};


const addMessage = async (time, message) => {
    const id = uuidv4();
    time = +time;
    const item = JSON.stringify({ id, message });
    await redisClient.zadd(MESAGGES_KEY, { [item]: time});
};

const fetchMessage = async () => {
    const zrangeResult = await redisClient.zrange(MESAGGES_KEY, 0, 0, "WITHSCORES");
    if (zrangeResult && Object.keys(zrangeResult) && Object.keys(zrangeResult).length) {
        const item = Object.keys(zrangeResult)[0];
        const time = +zrangeResult[item];
        const { id, message } = JSON.parse(item);
        return { id, message, time };
    }
    return null;
};

const deleteMessage = (id, message) => {
    return redisClient.zrem(MESAGGES_KEY, JSON.stringify({ id, message }));
};

const LOCK_TIMEOUT = 3;

const lockMessage = async (messageId) => {
    // try to acquire a lock on the message
    const lockId = uuidv4();
    const lockName = `message_lock:${messageId}`;
    const locked = await redisClient.setnx(lockName, lockId);
    if (locked) {
        // If we acquired the lock we will set a reasonable expiration time and return true
        await setLockExpiration(lockName);
    }
    else {
        const lockExpiration = await getLockExpiration(lockName);
        if (!ttl) {
            // The lock has no expiration date beacuse the server that locked the message crashed before we could set one.
            // We will set an expiration date so other server will be able to lock the message again
            await setLockExpiration(lockName);
        }
    }
    return locked;
};

const unlockMessage = (messageId) => {
    const lockName = `message_lock:${messageId}`;
    return redisClient.del(lockName);
};

const setLockExpiration = (lockName) => {
    return redisClient.expire(lockName, LOCK_TIMEOUT);
}

const getLockExpiration = (lockName) => {
    return redisClient.ttl(lockName);
};

setInterval(checkMessage, 1000);