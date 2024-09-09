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
exports.queues = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const bullmq_1 = require("bullmq");
const constants_1 = require("../utils/constants");
const interfaces_1 = require("../core/interfaces");
const swap_1 = require("../swap");
const units_1 = require("@ethersproject/units");
const main_1 = require("../main");
const redis = new ioredis_1.default({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
exports.queues = [];
const workers = [];
for (let i = 0; i < constants_1.DEXS.length; i++) {
    exports.queues.push(new bullmq_1.Queue(`tdt${i}`));
}
for (let i = 0; i < constants_1.DEXS.length; i++) {
    const name = `tdt${i}`;
    const worker = new bullmq_1.Worker(name, (job) => __awaiter(void 0, void 0, void 0, function* () {
        const token = job.data.token;
        const account = job.data.account;
        const dex = job.data.dex;
        const amount = job.data.amount;
        const nonce = job.data.nonce;
        if (!account) {
            throw new Error("Invalid account");
        }
        try {
            const otherToken = token.name === interfaces_1.TOKENS.WNEON ? constants_1.USDT_TOKEN : constants_1.WRAPPED_NEON_TOKEN;
            const decimal = token.name === interfaces_1.TOKENS.WNEON ? constants_1.WRAPPED_NEON_TOKEN.decimal : constants_1.USDT_TOKEN.decimal;
            const amountToSwap = (0, units_1.parseUnits)(String(amount), decimal);
            const rcpt = yield (0, swap_1.swap)(dex, token, otherToken, account, amountToSwap, nonce);
            return rcpt;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }), { connection: redis, removeOnFail: {
            count: 0,
        }, concurrency: 1 });
    workers.push(worker);
}
for (let i = 0; i < workers.length; i++) {
    workers[i].on('completed', (job, result) => __awaiter(void 0, void 0, void 0, function* () {
        const count = result.count;
        console.log('job completed, ', job.data);
        if (count >= 2) {
            yield (0, swap_1.unWrapNeons)(job.data.account);
            console.log('job finished');
        }
        else {
            if (job.data.i === 6) {
                console.log("starting a new job");
                yield (0, main_1.main)(count + 1);
            }
        }
    }));
}
exports.default = redis;
