import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { DEXS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { parseUnits } from "@ethersproject/units";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";
import { swapTokens } from "../utils/helpers";
import { swap } from "../swap";
import { BigNumber } from "@ethersproject/bignumber";

const redis = new Redis();

export const queues: Queue[] = []; 
const workers: Worker[] = [];

for(let i = 0; i < DEXS.length; i++) {
    queues.push(new Queue(`${DEXS[i].name}`));
}

for (let i = 0; i < 3; i++) {
    const worker = new Worker(`${DEXS[i].name}`, async (job: Job) => {
        const token: ITokens = job.data.token;
        const account: string = job.data.account;
        const dex: IDEX = job.data.dex;
        const amountToSwap: BigNumber = job.data.amount;

        const otherToken = token.name === TOKENS.WNEON ? USDT_TOKEN : WRAPPED_NEON_TOKEN;        
        console.log(`SENDING ${token} FROM account ${account}`);

        const rcpt = await swap(dex, token, otherToken, amountToSwap);

        console.log(`${rcpt.transactionHash}: Swap successful `);
    });
    workers.push(worker);
}

for(let i = 0; i < 3; i++) {
    workers[i].on('completed', (job: Job) => {

    });
}

export default redis;