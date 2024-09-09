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
exports.NO_OF_KEYS = exports.MAIN_ADDRESS = exports.wallets = exports.queues = exports.loggers = exports.provider = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const constants_1 = require("../utils/constants");
const interfaces_1 = require("../core/interfaces");
const units_1 = require("@ethersproject/units");
const main_1 = require("../main");
const winston_1 = __importDefault(require("winston"));
const private_keys_json_1 = __importDefault(require("../../private_keys.json"));
const wallet_1 = require("@ethersproject/wallet");
const providers_1 = require("@ethersproject/providers");
exports.provider = new providers_1.JsonRpcProvider(constants_1.PROXY_URL);
const redis = new ioredis_1.default({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
exports.loggers = [];
exports.queues = [];
exports.wallets = [];
exports.MAIN_ADDRESS = [];
const workers = [];
const keys = private_keys_json_1.default.keys;
exports.NO_OF_KEYS = keys.length;
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    const wallet = new wallet_1.Wallet(keys[i].private_key, exports.provider);
    exports.MAIN_ADDRESS.push(keys[i].public_key);
    exports.wallets.push(wallet);
}
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    exports.queues.push(new bullmq_1.Queue(`tdd${i}`));
}
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    exports.loggers.push(winston_1.default.createLogger({
        format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ timestamp, message }) => {
            return `${timestamp}: ${message}`;
        }), winston_1.default.format.json()),
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
}
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    const name = `tdd${i}`;
    const worker = new bullmq_1.Worker(name, (job) => __awaiter(void 0, void 0, void 0, function* () {
        const token = job.data.token;
        const account = job.data.account;
        const amount = job.data.amount;
        const accIndex = job.data.accountIndex;
        const nonce = job.data.nonce;
        if (!account) {
            throw new Error("Invalid account");
        }
        try {
            const otherToken = token.name === interfaces_1.TOKENS.WNEON ? constants_1.USDT_TOKEN : constants_1.WRAPPED_NEON_TOKEN;
            const decimal = token.name === interfaces_1.TOKENS.WNEON ? constants_1.WRAPPED_NEON_TOKEN.decimal : constants_1.USDT_TOKEN.decimal;
            const amountToSwap = (0, units_1.parseUnits)(String(amount), decimal);
            // const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            // const dex = DEXS[rand];
            console.log('transaction starting');
            // const rcpt = await swap(wallet[accIndex], dex, token, otherToken, account, amountToSwap, nonce);
            exports.loggers[accIndex].info(job.data);
            // loggers[accIndex].info(`hash: ${rcpt.transactionHash} -- amount: $${amount} -- gasFee:`);
        }
        catch (error) {
            exports.loggers[accIndex].error(error); // you want to retry this
            throw error;
        }
    }), { connection: redis, removeOnFail: {
            count: 0,
        }, concurrency: 1 });
    workers.push(worker);
}
for (let i = 0; i < workers.length; i++) {
    workers[i].on('completed', (job) => __awaiter(void 0, void 0, void 0, function* () {
        const totalJobsPerSet = constants_1.NEON_MOVED_PER_SET + 1;
        const count = job.data.count % totalJobsPerSet;
        if (job.data.count >= (totalJobsPerSet * 3)) {
            // await unWrapNeons(job.data.account);
            console.log("Unwrapped now");
            process.exit();
        }
        else {
            if (count === 0) {
                console.log("OLD PROCESS COMPLETED STARTING NEW");
                yield (0, main_1.main)(job.data.count + 1);
            }
        }
    }));
}
exports.default = redis;
