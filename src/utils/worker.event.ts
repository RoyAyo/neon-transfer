import { EventEmitter } from "stream";
import { events, loggers, MAIN_ADDRESS, queues } from "../config";
import { Job } from "bullmq";
import { JOB_RETRIES, NEON_MOVED_PER_SET, NO_OF_SETS } from "./constants";
import { swapUSDT } from "../swap";
import { main } from "../main";
import { TimeoutError } from "./errors";
import { delay } from "./helpers";
import { getTransactionCount } from "./contract.helpers";

class WorkerEvent extends EventEmitter{
    count: number = 0;

    getCount() {
        return this.count || 0;
    }
}

export function addEvents(event: EventEmitter) {
    event.on('neon_completed', NEON_COMPLETED);

    event.on('usdt_completed', USDT_Completed);

    event.on('jobs_completed', JOBS_COMPLETED);

    event.on('job_failed', JOB_FAILED)
}


async function NEON_COMPLETED(job: Job) {
    console.log("Neon COMPLETED", job.data.count);

    if(job.data.count % NEON_MOVED_PER_SET === 0) {
        console.log("SWAPPING USDT BACK");
        await swapUSDT(job.data.accountIndex, job.data.count);
    } else {
        // repeat job and increase count
        await queues[job.data.accountIndex].add(job.name, {
            ...job.data,
            count: job.data.count + 1
        });
    }
}

async function USDT_Completed(job: Job) {
    console.log("BATCH COMPLETE...");

    if(job.data.count >= (NEON_MOVED_PER_SET * NO_OF_SETS)) {
        events[job.data.accountIndex].emit('jobs_completed',job);
    } else {
        await delay(5000); // wait 5s before starting a new batch
        console.log("Starting New Batch..");
        const txCount = await getTransactionCount(job.data.accountIndex);
        console.log(txCount);
        await main(txCount, job.data.accountIndex, job.data.count + 1);
    }
}

async function JOBS_COMPLETED(job: Job) {
    const {
        accountIndex,
        count
    } = job.data;
    console.log(`Total Transactions For Account: ${MAIN_ADDRESS[accountIndex]} is  ${count + NO_OF_SETS}`);
    loggers[accountIndex].info(`completed ${count + NO_OF_SETS}`);
}

async function JOB_FAILED(job: Job, error: Error) {
    const {
        accountIndex,
        count,
        retry
    } = job.data;
    
    console.error("SWAP FAILED for: ", MAIN_ADDRESS[accountIndex], error.message);
    
    try {
        // automatically just fail if retries are enough
        if (job.data.retry >= JOB_RETRIES) {
            throw new Error("Retries Maxed out...");
        }

        // Restart job if it happens to timeout
        if(error instanceof TimeoutError) {
            await queues[accountIndex].add(job.name, {
                ...job.data,
                retry: (retry ?? 0) + 1
            });
            return;
        }

        // if job is a replacement job error OR cannot estimate gas... Increase the gas fee and manually include
        if(error.message.split(" ")[0] === 'replacement' || error.message.split(" ")[1] === 'estimate') {
            await queues[accountIndex].add(job.name, {
                ...job.data,
                increase: job.data.increase + 1,
                retry: (retry ?? 0) + 1,
            });
            return;
        }

        // if it's a nonce error / CALL_DATA ERROR/ or just reverted, delay and reque job
        if( error.message.split(" ")[0] === 'nonce' || error.message.split(" ")[1] === 'revert' || (error.message.split(" ")[0] === 'transaction' && error.message.split(" ")[1] === 'failed' )) {
            await queues[accountIndex].add(job.name, {
                ...job.data,
                retry: (retry ?? 0) + 1,
            });
            return;
        }

        throw new Error(error?.message);
    } catch (error: any) {
        console.log(`Unable To Automatically RESTART due to ${error?.message}, ${MAIN_ADDRESS[accountIndex]}, Jobs Done: ${count}`);
    }
}


export default WorkerEvent;