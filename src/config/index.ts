import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { DEXS, NEON_MOVED_PER_SET, NO_OF_SETS, PROXY_URL, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { ITokens, TOKENS } from "../core/interfaces";
import { swap, swapUSDT, unWrapNeons } from "../swap";
import { parseUnits } from "@ethersproject/units";
import { main } from "../main";
import winston, { Logger } from "winston";
import Jsonkeys from "../../private_keys.test.json"
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { delay, unwrapNeon } from "../utils/helpers";
import { EventEmitter } from "stream";
import WorkerEvent from "../utils/worker.event";

export const provider = new JsonRpcProvider(PROXY_URL);
const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});
const keys = Jsonkeys.keys;

export const loggers: Logger[] = [];
export const queues: Queue[] = []; 
export const wallets: Wallet[] = [];
export const MAIN_ADDRESS: string[] = [];
export const workers: Worker[] = [];
export const events: EventEmitter[] = [];
export const NO_OF_KEYS = keys.length;


for(let i = 0; i < NO_OF_KEYS; i++) {
    const wallet = new Wallet(keys[i].private_key, provider);
    MAIN_ADDRESS.push(keys[i].public_key);
    wallets.push(wallet);
}

for(let i = 0; i < NO_OF_KEYS; i++) {
    queues.push(new Queue(`xll${i}`));
}

for(let i = 0; i < NO_OF_KEYS; i++) {
    const event = new WorkerEvent();

    event.on('neon_complete', async (nonce: number, count: number) => {
        console.log("Neon completed", count);
        if(count % NEON_MOVED_PER_SET === 0) {
            console.log("SWAPPING USDT BACK");
            await swapUSDT(nonce + 1, count);
            event.emit('usdt_complete', count);
        }
    });

    event.on('usdt_complete', async (count) => {
        if(count >= NEON_MOVED_PER_SET * NO_OF_SETS) {
            event.emit('job_complete');
        } else {
            console.log("BATCH COMPLETED...");
            await main(count + 1);
        }
    })

    event.on('job_complete', async () => {
        console.log("Jobs Completed");
        await unWrapNeons(MAIN_ADDRESS[i], i);
    });

    event.on('job_failed', async (nonce: number) => {
        console.log("Jobs FAILED", nonce);
        //think of retry.
    });

    events.push(event);
}

for(let i = 0; i < NO_OF_KEYS; i++) {
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
}

for (let i = 0; i < NO_OF_KEYS; i++) {
    const name = `xll${i}`;
    const worker = new Worker(name, async (job: Job) => {
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
    workers[i].on('failed', async (job: Job<any, any, string> | undefined, err: Error) => {
        console.error(err);
        if (job && job.attemptsMade < 2) {
            await job.retry();
          } else {
            console.log(`Job ${job?.id} has exceeded retry attempts.`);
          }
    });

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

export default redis;