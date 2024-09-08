import Redis from "ioredis";
import { Job, Queue, Worker } from "bullmq";
import { DEXS } from "../utils/constants";

const redis = new Redis();

export const queues: Queue[] = []; 
const workers: Worker[] = [];

for(let i = 0; i < DEXS.length; i++) {
    queues.push(new Queue(`${DEXS[i].name}`));
}

for (let i = 0; i < 3; i++) {
    const worker = new Worker(`${DEXS[i].name}`, async (job: Job) => {
        // ...

    });
    workers.push(worker);
}

export default redis;