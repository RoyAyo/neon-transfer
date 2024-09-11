import { MAIN_ADDRESS } from "../config";
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

export function findAccountIndexByPublicKey(pubKey: string): number {
    const accountIndex = MAIN_ADDRESS.findIndex((address) => address === pubKey);
    if(accountIndex === -1) {
        console.error("Public Key not found in JSON file, add to private_keys.json");
        process.exit();
    }
    return accountIndex;
}