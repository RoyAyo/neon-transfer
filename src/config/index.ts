import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { DEXS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";
import { swap, unWrapNeons } from "../swap";
import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { unwrapNeon } from "../utils/helpers";
import { main } from "../main";

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});

export const queues: Queue[] = []; 
const workers: Worker[] = [];

for(let i = 0; i < DEXS.length; i++) {
    queues.push(new Queue(`tdt${i}`));
}

for (let i = 0; i < DEXS.length; i++) {
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
            console.log('job finished')
        } else {
            if(job.data.i === 6) {
                console.log("starting a new job")
                await main(count + 1);
            }
        }
    })
}

export default redis;