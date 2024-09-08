import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { DEXS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";
import { swap, unWrapNeons } from "../swap";
import { BigNumber } from "@ethersproject/bignumber";

const redis = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
});

export const queues: Queue[] = []; 
const workers: Worker[] = [];

for(let i = 0; i < DEXS.length; i++) {
    queues.push(new Queue(`${DEXS[i].name}`));
}

for (let i = 0; i < DEXS.length; i++) {
    const name = DEXS[i].name;
    const worker = new Worker(name, async (job: Job) => {
        try {
            const token: ITokens = job.data.token;
            const account: string = job.data.account;
            const dex: IDEX = job.data.dex;
            const amountToSwap: BigNumber = job.data.amount;

            const otherToken = token.name === TOKENS.WNEON ? USDT_TOKEN : WRAPPED_NEON_TOKEN;        
            console.log(`SENDING ${token} FROM account ${account}...amount: ${amountToSwap}`);

            const rcpt = await swap(dex, token, otherToken, amountToSwap);

            console.log(`${rcpt.transactionHash}: Swap successful...`);
        } catch (error) {
            if(job.data.done) {
                await unWrapNeons();
            }
            throw error;
        }
    }, { connection: redis});

    workers.push(worker);
}

export default redis;