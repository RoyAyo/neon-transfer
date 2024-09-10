import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";

import { MAIN_ADDRESS, provider, queues, wallets } from "../config";
import { IAccount, IDEX, ITokens } from "../core/interfaces";
import { AMOUNT_NEON_TO_START_WITH, DEXS, NEON_MOVED_PER_SET, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import {  approveToken, getAllowance, getBalance, swapTokens, unwrapNeon, wrapNeon } from "../utils/helpers";
import { Job } from "bullmq";

export async function wrapNeons(): Promise<void> {
    for(let i = 0; i < MAIN_ADDRESS.length; i++) {
        const amountToSwap = parseUnits(String(AMOUNT_NEON_TO_START_WITH), WRAPPED_NEON_TOKEN.decimal);
        const balance = await getBalance(provider, MAIN_ADDRESS[i]);
        console.log(`My total NEON BALANCE for address ${MAIN_ADDRESS[i]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
        if (Number(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal)) < AMOUNT_NEON_TO_START_WITH) {
            console.log(`Not enough Neon for the full process in ${MAIN_ADDRESS[i]}, deposit More ....`);
            continue;
        } else {
            await wrapNeon(wallets[i], amountToSwap);
        }
    }
}

export async function unWrapNeons(address: string, accIndex: number) {
        const balance = await getBalance(provider, address, WRAPPED_NEON_TOKEN);
        console.log(balance);
        if(balance.gt(0)) {
            await unwrapNeon(wallets[accIndex], balance);
            console.log("UNWRAPPED MY REMAINING NEON ", balance);
        }
}

export async function swap(accountIndex: number, TOKEN_FROM: ITokens, TOKEN_TO: ITokens, dex: IDEX, amountToSwap: BigNumber, nonce?: number, count?: number, job?: Job) {
    await swapTokens(accountIndex, TOKEN_FROM, TOKEN_TO, dex, amountToSwap, nonce, count, job);
};

export async function getTransactionCount(accIndex: number): Promise<IAccount> {
    const nonce = await provider.getTransactionCount(MAIN_ADDRESS[accIndex], 'latest');
    const balance = await getBalance(provider, MAIN_ADDRESS[accIndex], WRAPPED_NEON_TOKEN);
    return {
        nonce,
        balance
    };
}

export async function swapNEON(account: IAccount, accIndex: number, n: number = 1) {
    if(account.balance.lte(0)) {
        return;
    }
    let noTimes = Math.floor(Number(formatUnits(account.balance, WRAPPED_NEON_TOKEN.decimal)));
    noTimes = noTimes < NEON_MOVED_PER_SET ? noTimes : NEON_MOVED_PER_SET;
    for(let j = 0; j < noTimes; j++) {
        queues[accIndex].add(`${MAIN_ADDRESS[accIndex]}-neon-job`, {
            token: WRAPPED_NEON_TOKEN,
            amount: 1,
            count: n + j,
            accountIndex: accIndex,
            nonce: account.nonce + j,
        });
    }
};

export async function swapUSDT(nonce: number, accIndex: number, count?: number) {
    const balance = await getBalance(provider, MAIN_ADDRESS[accIndex], USDT_TOKEN);
    if(Number(formatUnits(balance, USDT_TOKEN.decimal)) <= 0) {
        console.log("USDT TOO SMALL FOR TRANSFER");;
        return;
    }
    console.log("MOVING USDT WITH BALANCE ", formatUnits(balance, 6), " back");
    queues[accIndex].add(`${MAIN_ADDRESS[accIndex]}-usdt-job`, {
        token: USDT_TOKEN,
        amount: formatUnits(balance, USDT_TOKEN.decimal),
        count,
        accountIndex: accIndex,
        nonce: nonce,
    });
};

export async function ensureAllowance() {
    for (let i = 0; i < MAIN_ADDRESS.length; i++) {
        const allowance_NEON = await getAllowance(wallets[i], DEXS[0].router, WRAPPED_NEON_TOKEN.address);
        const allowance_USDT = await getAllowance(wallets[i], DEXS[0].router, USDT_TOKEN.address);
        const minAmount_Neon = parseUnits("100", WRAPPED_NEON_TOKEN.decimal);
        const minAmount_USDT = parseUnits("100", USDT_TOKEN.decimal);

        if(allowance_NEON.lt(minAmount_Neon)) {
            console.error("INSUFFICIENT AMOUNT OF NEON ALLOWED FOR ADDRESS ", MAIN_ADDRESS[i]);
            await approveToken(wallets[i], DEXS[0], WRAPPED_NEON_TOKEN);
            console.log(`APPROVED MORE TOKENS`);
        }

        if(allowance_USDT.lt(minAmount_USDT)) {
            console.error("INSUFFICIENT AMOUNT OF USDT ALLOWED FOR ADDRESS ", MAIN_ADDRESS[i]);
            await approveToken(wallets[i], DEXS[0], USDT_TOKEN);
            console.log(`APPROVED MORE TOKENS`);
        }
    }
}