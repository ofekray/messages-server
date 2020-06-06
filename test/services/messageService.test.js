const { ValidationError } = require('../../src/services/errors');
const { sleep } = require("../testUtils");

let mockCache = {};
let mockExpirationTimes = {};
jest.mock('../../src/services/redis', () => {
    return {
        async zadd(key, item) {
            const jsonMessage = Object.keys(item)[0];
            const time = item[jsonMessage];
            if (mockCache[key]) {
                mockCache[key].push({ jsonMessage, time });
            }
            else {
                mockCache[key] = [{ jsonMessage, time }];
            }
        },
        async zrange(key) {
            if (mockCache[key] &&  mockCache[key].length > 0) {
                const sortedSet = mockCache[key].sort((a, b) => a.time - b.time);
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
            if (mockCache[key]) {
                mockCache[key] = mockCache[key].filter(x => x.jsonMessage !== jsonMessage);
            }
        },
        async setnx(key, value) {
            if (mockCache[key]) {
                return 0;
            }
            else {
                mockCache[key] = value;
                return 1;
            }
        },
        async del(key) {
            delete mockCache[key];
        },
        async expire(key, ttl) {
            mockExpirationTimes[key] = ttl;
        },
        async ttl(key) {
            return mockExpirationTimes[key];
        }
    };
});

let mockId = 0;
jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => `very-random-id-${mockId++}`)
    }
});

const messagesService = require("../../src/services/messageService");

afterEach(async() => {
    idCounter = 0;
    mockCache = {};
    mockExpirationTimes = {};
});

describe("testing addMessage", () => {
    test('throws ValidationError when message is empty', async() => {
        let error;
        try {
            await messagesService.addMessage(1234, "");
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter message")).toBe(true);
    });

    test('throws ValidationError when message is not a string', async() => {
        let error;
        try {
            await messagesService.addMessage(1234, 5);
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter message")).toBe(true);
    });

    test('throws ValidationError when time is not a number', async() => {
        let error;
        try {
            await messagesService.addMessage("wrong_time", "valid message");
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter time")).toBe(true);
    });

    test('throws ValidationError when time is a negative number', async() => {
        let error;
        try {
            await messagesService.addMessage(-4443413, "valid message");
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter time")).toBe(true);
    });

    test('throws ValidationError when time already passed', async() => {
        // Setup
        let error;

        // Run
        try {
            await messagesService.addMessage(new Date().getTime() - 1, "valid message");
        }
        catch(err) {
            error = err;
        }

        // Test
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter time")).toBe(true);
    });

    test('valid parameters', async() => {
        // Setup
        const message = "This is a valid message";
        const time = new Date().getTime() + (3 * 60 * 1000);
        const id = "very-random-id-0";

        // Run
        await messagesService.addMessage(time, message);

        // Test
        expect(mockCache["messages"]).toBeDefined();
        expect(mockCache["messages"]).toHaveLength(1);
        expect(mockCache["messages"][0].jsonMessage).toBe(JSON.stringify({ id, message }));
        expect(mockCache["messages"][0].time).toBe(time);
    });
});

describe("testing checkMessages", () => {
    test('prints message when time passed', async() => {
        // Setup
        const message = "This is a valid message";
        const time = new Date().getTime() - 1;
        mockCache["messages"] = [{ jsonMessage: JSON.stringify({ id: mockId++, message }), time }];
        const spy = jest.spyOn(console, 'log').mockImplementation();

        // Run
        await messagesService.checkMessages();

        // Test
        expect(console.log).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenLastCalledWith(message);

        // Clean
        spy.mockRestore();
    });

    test('doesn`t prints message when time is in the future', async() => {
        // Setup
        const message = "This is a valid message";
        const time = new Date().getTime() + (3 * 60 * 1000);
        mockCache["messages"] = [{ jsonMessage: JSON.stringify({ id: mockId++, message }), time }];
        const spy = jest.spyOn(console, 'log').mockImplementation();

        // Run
        await messagesService.checkMessages();

        // Test
        expect(console.log).toHaveBeenCalledTimes(0);

        // Clean
        spy.mockRestore();
    });
});