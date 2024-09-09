import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { MAIN_ADDRESS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";
import { swap, unWrapNeons } from "../swap";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { main } from "../main";
import winston, { Logger } from "winston";


const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});

export const loggers: Logger[] = [];
export const queues: Queue[] = []; 
const workers: Worker[] = [];

for(let i = 0; i < MAIN_ADDRESS.length; i++) {
    queues.push(new Queue(`tdt${i}`));
}

for(let i = 0; i < MAIN_ADDRESS.length; i++) {
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
              filename: `${MAIN_ADDRESS[i]}.addresses.log`,
            }),
          ],
    }));
}

for (let i = 0; i < MAIN_ADDRESS.length; i++) {
    const name = `tdt${i}`;
    const worker = new Worker(name, async (job: Job) => {
        const token: ITokens = job.data.token;
        const account: string = job.data.account;
        const dex: IDEX = job.data.dex;
        const amount = job.data.amount;
        const nonce = job.data.nonce;

        if(!account) {
            throw new Error("Invalid account");
        }

        try {
            const otherToken = token.name === TOKENS.WNEON ? USDT_TOKEN : WRAPPED_NEON_TOKEN;
            const decimal = token.name === TOKENS.WNEON ? WRAPPED_NEON_TOKEN.decimal : USDT_TOKEN.decimal;  
            const amountToSwap = parseUnits(String(amount), decimal);

            const rcpt = await swap(dex, token, otherToken, account, amountToSwap, nonce);

            return rcpt;

        } catch (error) {
            console.error(error);
            throw error;
        }
    }, { connection: redis, removeOnFail: {
        count: 0,
    }, concurrency: 1});

    workers.push(worker);
}

for (let i = 0; i < workers.length; i++) {
    workers[i].on('completed', async (job: Job, result: any) => {
        const count = result.count;
        console.log('job completed, ', job.data);

        if(count >= 2) {
            await unWrapNeons(job.data.account);
        } else {
            if(job.data.i === 6) {
                console.log("starting a new job");
                await main(count + 1);
            }
        }
    })
}

export default redis;