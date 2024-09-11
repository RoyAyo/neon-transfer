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
