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
            await wrapNeon(wallet, amountToSwap);
            console.log("WRAPPED 20 NEON FROM Address", MAIN_ADDRESS[i]);
        }

    }
    return skip;
}

export async function unWrapNeons() {
    for(let i = 0; i < 10; i++) {
        const balance = await getBalance(provider, MAIN_ADDRESS[i], WRAPPED_NEON_TOKEN);        
        await unwrapNeon(wallet, balance);
        console.log("UNWRAPPED MY REMAINING NEON ", balance);
        console.log("process ended...");
        process.exit();
    }
}

export async function swap(dex: IDEX, TOKEN_FROM: ITokens, TOKEN_TO: ITokens, amountToSwap: BigNumber) {
    return swapTokens(DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, amountToSwap);
};

export async function swap_Neon_To(skip: number[]) {
    for (let i = 0; i < MAIN_ADDRESS.length; i++) {
        if(skip[i] === 1) {
            continue;
        }
        const balance = await getBalance(provider, MAIN_ADDRESS[i], WRAPPED_NEON_TOKEN);
        let noTimes = Math.floor(Number(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal)));
        noTimes = noTimes < 12 ? noTimes : 12; 
        for(let i = 0; i < noTimes; i++) {
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            await queues[rand].add(`${DEXS[rand].name}:-${MAIN_ADDRESS[i]}:-${Date.now()}`, {
                token: WRAPPED_NEON_TOKEN,
                account: MAIN_ADDRESS[i],
                dex: DEXS[rand],
                amount: parseUnits("1", WRAPPED_NEON_TOKEN.decimal),
                done: false,
            }, {attempts: 2});
        }
    }
};

export async function swap_USDT_To(skip: number[], n: number) {
        for (let i = 0; i < MAIN_ADDRESS.length; i++) {
            if(skip[i] === 1) {
                continue;
            }
            const balance = await getBalance(provider, MAIN_ADDRESS[i], USDT_TOKEN);
            const splitBalance = balance.div(4);
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            for (let j = 0; j < 3; j++) {
                await queues[rand].add(`${DEXS[rand].name}:-${MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: USDT_TOKEN,
                    account: MAIN_ADDRESS[i],
                    dex: DEXS[rand],
                    amount: splitBalance,
                    done: j == 2 && n == 2,
                }, {attempts: 2});
            }
    }
};