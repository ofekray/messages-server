let fakeCache = {};
let expirationTimes = {};

const resetRedisMock = () => {
    fakeCache = {};
    expirationTimes = {};
};

const mockRedis = {
    async zadd(key, item) {
        const jsonMessage = Object.keys(item)[0];
        const time = item[jsonMessage];
        if (fakeCache[key]) {
            fakeCache[key].push({ jsonMessage, time });
        }
        else {
            fakeCache[key] = [{ jsonMessage, time }];
        }
    },
    async zrange(key) {
        if (fakeCache[key] &&  fakeCache[key].length > 0) {
            const sortedSet = fakeCache[key].sort((a, b) => a.time - b.time);
            const { jsonMessage, time } = sortedSet[0];
            return {
                [jsonMessage]: time
            }
        }
        else {
            return {};

        }
    },
    async zrem(key, jsonMessage) {
        if (fakeCache[key]) {
            fakeCache[key] = fakeCache[key].filter(x => x.jsonMessage !== jsonMessage);
        }
    },
    async setnx(key, value) {
        if (fakeCache[key]) {
            return 0;
        }
        else {
            fakeCache[key] = value;
            return 1;
        }
    },
    async del(key) {
        delete fakeCache[key];
    },
    async expire(key, ttl) {
        expirationTimes[key] = ttl;
    },
    async ttl(key) {
        return expirationTimes[key];
    }
};

module.exports = {
    mockRedis,
    resetRedisMock
};