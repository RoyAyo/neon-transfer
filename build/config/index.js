"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_OF_KEYS = exports.events = exports.workers = exports.MAIN_ADDRESS = exports.wallets = exports.queues = exports.loggers = exports.provider = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const providers_1 = require("@ethersproject/providers");
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const private_keys_test_json_1 = __importDefault(require("../../private_keys.test.json"));
const interfaces_1 = require("../core/interfaces");
const swap_1 = require("../swap");
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
const worker_event_1 = __importDefault(require("../utils/worker.event"));
const winston_1 = __importDefault(require("winston"));
exports.provider = new providers_1.JsonRpcProvider(constants_1.PROXY_URL);
const redis = new ioredis_1.default({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
const keys = private_keys_test_json_1.default.keys;
exports.loggers = [];
exports.queues = [];
exports.wallets = [];
exports.MAIN_ADDRESS = [];
exports.workers = [];
exports.events = [];
exports.NO_OF_KEYS = keys.length;
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    // CONFIGURE EACH WALLET
    const wallet = new wallet_1.Wallet(keys[i].private_key, exports.provider);
    exports.MAIN_ADDRESS.push(keys[i].public_key);
    exports.wallets.push(wallet);
    // CONFIGURE EVENT EMITTERS
    const event = new worker_event_1.default();
    (0, helpers_1.addEvents)(event, i);
    exports.events.push(event);
    // CONFIGURE LOGGERS
    exports.loggers.push(winston_1.default.createLogger({
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, message }) => {
            return `${timestamp}: ${message}`;
        })),
        transports: [
            new winston_1.default.transports.File({
                filename: `logs/info/${exports.MAIN_ADDRESS[i]}.addresses.log`,
                level: 'info'
            }),
            new winston_1.default.transports.File({
                filename: `logs/errors/${exports.MAIN_ADDRESS[i]}.errors.log`,
                level: 'error'
            }),
        ],
    }));
    const queueName = `x--${i}`;
    // CONFIGURE QUEUES
    exports.queues.push(new bullmq_1.Queue(queueName, {
        defaultJobOptions: {
            attempts: 2
        },
        connection: redis,
    }));
    // CONFIGURE WORKERS FOR  QUEUE
    const worker = new bullmq_1.Worker(queueName, (job) => __awaiter(void 0, void 0, void 0, function* () {
        const token = job.data.token;
        const amount = job.data.amount;
        const accountIndex = job.data.accountIndex;
        const nonce = job.data.nonce;
        const count = job.data.count;
        try {
            const otherToken = token.name === interfaces_1.TOKENS.WNEON ? constants_1.USDT_TOKEN : constants_1.WRAPPED_NEON_TOKEN;
            const decimal = token.name === interfaces_1.TOKENS.WNEON ? constants_1.WRAPPED_NEON_TOKEN.decimal : constants_1.USDT_TOKEN.decimal;
            const amountToSwap = (0, units_1.parseUnits)(String(amount), decimal);
            const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
            const dex = constants_1.DEXS[rand];
            yield (0, swap_1.swap)(accountIndex, token, otherToken, dex, amountToSwap, nonce, count, job);
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }), { connection: redis, concurrency: 2 });
    exports.workers.push(worker);
}
exports.default = redis;
