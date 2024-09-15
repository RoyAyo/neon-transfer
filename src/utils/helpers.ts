import { COMPLETE_QUEUE, jobsFinishedWorker, MAIN_ADDRESS, workers } from "../config";
import { TimeoutError } from "./errors";

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function withTimeout(promise: Promise<any>, timeoutMs: number): Promise<any> {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Transaction timed out after ${timeoutMs} ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}

export function findAccountIndexByPublicKey(pubKey: string[]): number[] {
    const accounts: number[] = [];
    for(let i = 0; i < pubKey.length; i++) {
        const accountIndex = MAIN_ADDRESS.findIndex((address) => address === pubKey[i]);
        if(accountIndex === -1) {
            console.error(`Public Key '${pubKey[i]}' not found in JSON file, add to private_keys.json`);
            process.exit();
        }
        accounts.push(accountIndex);
    }
     
    return accounts;
}

export function addErrorToCompleteQueue(address: string, count: number) {
    COMPLETE_QUEUE.add(`${address}-complete`, {
        address,
        count,
    });
}

export async function shutdown(done: boolean = true) {
    for(let worker of workers) {
        await worker.close(false);
    }
    await jobsFinishedWorker.close();
    done ? console.log('----DONE!!!----') : console.log('----Shutdown!!!--');
    process.exit();
}