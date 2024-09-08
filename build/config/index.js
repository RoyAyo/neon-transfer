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
const redis = new ioredis_1.default({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
exports.queues = [];
const workers = [];
for (let i = 0; i < constants_1.DEXS.length; i++) {
    exports.queues.push(new bullmq_1.Queue(`${constants_1.DEXS[i].name}`));
}
for (let i = 0; i < constants_1.DEXS.length; i++) {
    const name = constants_1.DEXS[i].name;
    const worker = new bullmq_1.Worker(name, (job) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const token = job.data.token;
            const account = job.data.account;
            const dex = job.data.dex;
            const amountToSwap = job.data.amount;
            const otherToken = token.name === interfaces_1.TOKENS.WNEON ? constants_1.USDT_TOKEN : constants_1.WRAPPED_NEON_TOKEN;
            console.log(`SENDING ${token} FROM account ${account}...amount: ${amountToSwap}`);
            const rcpt = yield (0, swap_1.swap)(dex, token, otherToken, amountToSwap);
            console.log(`${rcpt.transactionHash}: Swap successful...`);
        }
        catch (error) {
            if (job.data.done) {
                yield (0, swap_1.unWrapNeons)();
            }
            throw error;
        }
    }), { connection: redis });
    workers.push(worker);
}
exports.default = redis;
