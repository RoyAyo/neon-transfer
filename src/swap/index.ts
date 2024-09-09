import { JsonRpcProvider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";

import { AMOUNT_NEON_TO_START_WITH, DEXS, MAIN_ADDRESS, NEON_PRIVATE, PROXY_URL, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import {  getBalance, swapTokens, unwrapNeon, wrapNeon } from "../utils/helpers";
import { IDEX, ITokens } from "../core/interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import { queues } from "../config";

const provider = new JsonRpcProvider(PROXY_URL);
const wallet = new Wallet(NEON_PRIVATE!, provider);

export async function wrapNeons(): Promise<number[]> {
    const skip: number[] = Array(MAIN_ADDRESS.length).fill(0);
    for(let i = 0; i < MAIN_ADDRESS.length; i++) {
        const amountToSwap = parseUnits(String(AMOUNT_NEON_TO_START_WITH), WRAPPED_NEON_TOKEN.decimal);
        const balance = await getBalance(provider, MAIN_ADDRESS[i]);
        console.log(`My total NEON BALANCE for address ${MAIN_ADDRESS[i]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
        if (Number(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal)) < AMOUNT_NEON_TO_START_WITH) {
            console.log(`Not enough Neon for the full process in ${MAIN_ADDRESS[i]}, deposit More ....`);
            skip[i] = 1;
            continue;
        } else {
            await wrapNeon(wallet, MAIN_ADDRESS[i], amountToSwap);
        }
    }
    return skip;
}

export async function unWrapNeons(address: string) {
        const balance = await getBalance(provider, address, WRAPPED_NEON_TOKEN);        
        await unwrapNeon(wallet, address, balance);
        console.log("UNWRAPPED MY REMAINING NEON ", balance);
        console.log("process ended...");
}

export async function swap(dex: IDEX, TOKEN_FROM: ITokens, TOKEN_TO: ITokens, address: string, amountToSwap: BigNumber, nonce?: number) {
    return swapTokens(DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, address, amountToSwap, nonce);
};

export async function swap_Neon_To(skip: number[], n: number = 0) {
    const txcount = await wallet.getTransactionCount();
    let nonce = txcount;

    for (let i = 0; i < MAIN_ADDRESS.length; i++) {
        if(skip[i] === 1) {
            continue;
        }
        const balance = await getBalance(provider, MAIN_ADDRESS[i], WRAPPED_NEON_TOKEN);
        let noTimes = Math.floor(Number(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal)));
        noTimes = noTimes < 6 ? noTimes : 6;
        for(let j = 0; j < noTimes; j++) {
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            nonce = (n + 1) * (j + txcount) + ( n > 0 ? 1 : 0)
            await queues[rand].add(`${MAIN_ADDRESS[i]}`, {
                token: WRAPPED_NEON_TOKEN,
                account: MAIN_ADDRESS[i],
                dex: DEXS[rand],
                amount: 1,
                count: n,
                i: j,
                nonce,
            });
        }
    }
    return nonce;
};

export async function swap_USDT_To(skip: number[], nonce: number = 0, n: number = 0) {
        for (let i = 0; i < MAIN_ADDRESS.length; i++) {
            if(skip[i] === 1) {
                continue;
            }
            const balance = await getBalance(provider, MAIN_ADDRESS[i], USDT_TOKEN);
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            await queues[rand].add(`${MAIN_ADDRESS[i]}`, {
                token: USDT_TOKEN,
                account: MAIN_ADDRESS[i],
                dex: DEXS[rand],
                amount: formatUnits(balance, USDT_TOKEN.decimal),
                count: n,
                i,
                nonce: nonce + 1,
            });
    }
};