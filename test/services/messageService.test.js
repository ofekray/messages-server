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
});
