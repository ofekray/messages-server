const { mockRedis, resetRedisMock } = require("../testUtils");
const { ValidationError } = require('../../src/services/errors');

jest.mock('../../src/services/redis', () => mockRedis);

let mockId = 0;
jest.mock('uuid', () => {
    return {
        v4: jest.fn(() => `very-random-id-${mockId++}`)
    }
});

const messagesService = require("../../src/services/messageService");

beforeEach(async() => {
    resetRedisMock();
    idCounter = 0;
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
        let error;
        try {
            await messagesService.addMessage(new Date().getTime() - 1, "valid message");
        }
        catch(err) {
            error = err;
        }
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message.startsWith("Parameter time")).toBe(true);
    });
});
