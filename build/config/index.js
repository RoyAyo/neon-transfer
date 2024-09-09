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
const constants_1 = require("../utils/constants");
const interfaces_1 = require("../core/interfaces");
const swap_1 = require("../swap");
const units_1 = require("@ethersproject/units");
const main_1 = require("../main");
const winston_1 = __importDefault(require("winston"));
const private_keys_test_json_1 = __importDefault(require("../../private_keys.test.json"));
const wallet_1 = require("@ethersproject/wallet");
const providers_1 = require("@ethersproject/providers");
const worker_event_1 = __importDefault(require("../utils/worker.event"));
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
    const wallet = new wallet_1.Wallet(keys[i].private_key, exports.provider);
    exports.MAIN_ADDRESS.push(keys[i].public_key);
    exports.wallets.push(wallet);
}
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    exports.queues.push(new bullmq_1.Queue(`xll${i}`));
}
for (let i = 0; i < exports.NO_OF_KEYS; i++) {
    const event = new worker_event_1.default();
    event.on('neon_complete', (nonce, count) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Neon completed", count);
        if (count % constants_1.NEON_MOVED_PER_SET === 0) {
            console.log("SWAPPING USDT BACK");
            yield (0, swap_1.swapUSDT)(nonce + 1, count);
            event.emit('usdt_complete', count);
        }
    }));
    event.on('usdt_complete', (count) => __awaiter(void 0, void 0, void 0, function* () {
        if (count >= constants_1.NEON_MOVED_PER_SET * constants_1.NO_OF_SETS) {
            event.emit('job_complete');
        }
        else {
            console.log("BATCH COMPLETED...");
            yield (0, main_1.main)(count + 1);
        }
    }));
    event.on('job_complete', () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Jobs Completed");
        yield (0, swap_1.unWrapNeons)(exports.MAIN_ADDRESS[i], i);
    }));
    event.on('job_failed', (nonce) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("Jobs FAILED", nonce);
        //think of retry.
    }));
    exports.events.push(event);
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
    const name = `xll${i}`;
    const worker = new bullmq_1.Worker(name, (job) => __awaiter(void 0, void 0, void 0, function* () {
        const token = job.data.token;
        const account = job.data.account;
        const amount = job.data.amount;
        const accIndex = job.data.accountIndex;
        const nonce = job.data.nonce;
        const count = job.data.count;
        if (!account) {
            throw new Error("Invalid account");
        }
        try {
            const otherToken = token.name === interfaces_1.TOKENS.WNEON ? constants_1.USDT_TOKEN : constants_1.WRAPPED_NEON_TOKEN;
            const decimal = token.name === interfaces_1.TOKENS.WNEON ? constants_1.WRAPPED_NEON_TOKEN.decimal : constants_1.USDT_TOKEN.decimal;
            const amountToSwap = (0, units_1.parseUnits)(String(amount), decimal);
            const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
            const dex = constants_1.DEXS[rand];
            yield (0, swap_1.swap)(exports.wallets[0], dex, token, otherToken, account, amountToSwap, nonce, accIndex, count);
        }
        catch (error) {
            exports.loggers[accIndex].error(error === null || error === void 0 ? void 0 : error.message); // you want to retry this
            throw error;
        }
    }), { connection: redis, concurrency: 1 });
    exports.workers.push(worker);
}
for (let i = 0; i < exports.workers.length; i++) {
    exports.workers[i].on('failed', (job, err) => __awaiter(void 0, void 0, void 0, function* () {
        console.error(err);
        if (job && job.attemptsMade < 2) {
            yield job.retry();
        }
        else {
            console.log(`Job ${job === null || job === void 0 ? void 0 : job.id} has exceeded retry attempts.`);
        }
    }));
    // workers[i].on('completed', async (job: Job) => {
    // const count = job.data.count % NEON_MOVED_PER_SET;
    // if(job.data.count >= (NEON_MOVED_PER_SET * 2)) {
    //     await unWrapNeons(job.data.account, job.data.accountIndex);
    //     process.exit();
    // } else {
    //     if(count === 0 && job.data.token.name === TOKENS.WNEON) {
    //         console.log("BATCH COMPLETED...");
    //         try {
    //             console.log("WAITING 2 MINUTES FOR OTHER TRANSACTIONS TO CONFIRM..")
    //             await delay(120000);
    //             await swapUSDT(job.data.nonce + 1, job.data.count);
    //         } catch (error) {
    //             console.error("Could not swap USDT: ", error);
    //             loggers[job.data.accIndex].error(error);
    //         }
    //         console.log("Waiting a minute seconds for batches to be completed");
    //         await delay(60000);
    //         await main(job.data.count + 1);
    // }
    //     }
    // })
}
exports.default = redis;
