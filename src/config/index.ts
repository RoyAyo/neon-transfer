import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";
import Jsonkeys from "../../private_keys.test.json"

import { ITokens, TOKENS } from "../core/interfaces";
import { EventEmitter } from "stream";
import { swap } from "../swap";
import { DEXS, PROXY_URL, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { addEvents, } from "../utils/helpers";
import WorkerEvent from "../utils/worker.event";
import winston from "winston";

export const provider = new JsonRpcProvider(PROXY_URL);
const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
const keys = Jsonkeys.keys;

export const loggers: winston.Logger[] = [];
export const queues: Queue[] = []; 
export const wallets: Wallet[] = [];
export const MAIN_ADDRESS: string[] = [];
export const workers: Worker[] = [];
export const events: EventEmitter[] = [];
export const NO_OF_KEYS = keys.length;

for(let i = 0; i < NO_OF_KEYS; i++) {

    // CONFIGURE EACH WALLET
    const wallet = new Wallet(keys[i].private_key, provider);
    MAIN_ADDRESS.push(keys[i].public_key);
    wallets.push(wallet);

    // CONFIGURE EVENT EMITTERS
    const event = new WorkerEvent();
    addEvents(event, i);
    events.push(event);

    // CONFIGURE LOGGERS
    loggers.push(winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, message }) => {
              return `${timestamp}: ${message}`;
            }),
            winston.format.json(),
          ),
          transports: [
            new winston.transports.File({
              filename: `logs/info/${MAIN_ADDRESS[i]}.addresses.log`,
              level: 'info'
            }),
            new winston.transports.File({
                filename: `logs/errors/${MAIN_ADDRESS[i]}.errors.log`,
                level: 'error'
            }),
          ],
    }));

    const queueName = `x--${i}`;
    // CONFIGURE QUEUES
    queues.push(new Queue(queueName));

    // CONFIGURE WORKERS FOR  QUEUE
    const worker = new Worker(queueName, async (job: Job) => {
        const token: ITokens = job.data.token;
        const account: string = job.data.account;
        const amount = job.data.amount;
        const accIndex = job.data.accountIndex;
        const nonce = job.data.nonce;
        const count = job.data.count;

        if(!account) {
            throw new Error("Invalid account");
        }

        try {
            const otherToken = token.name === TOKENS.WNEON ? USDT_TOKEN : WRAPPED_NEON_TOKEN;
            const decimal = token.name === TOKENS.WNEON ? WRAPPED_NEON_TOKEN.decimal : USDT_TOKEN.decimal;  
            const amountToSwap = parseUnits(String(amount), decimal);
            
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            const dex = DEXS[rand];
            
            await swap(wallets[0], dex, token, otherToken, account, amountToSwap, nonce, accIndex, count);

        } catch (error: any) {
            loggers[accIndex].error(error?.message); // you want to retry this
            throw error;
        }
    }, { connection: redis, concurrency: 1});

    workers.push(worker);
}

for (let i = 0; i < workers.length; i++) {
    // FAILED EMITTERS FOR EACH EVENT
    workers[i].on('failed', async (job: Job<any, any, string> | undefined, err: Error) => {
        console.error(err);
        if (job && job.attemptsMade < 2) {
            await job.retry();
          } else {
            console.log(`Job ${job?.id} has exceeded retry attempts.`);
          }
    });
}

export default redis;