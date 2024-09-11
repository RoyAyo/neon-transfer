import { AMOUNT_NEON_TO_START_WITH, NEON_AMOUNT, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { Job } from "bullmq";

import { loggers, MAIN_ADDRESS, provider, queues, wallets } from "../config";
import { IAccount, IDEX, ITokens } from "../core/interfaces";
import { swapTokens, unwrapNeon, wrapNeon } from "./neon";
import { getBalance } from "../utils/contract.helpers";

export async function startNEONSwap(account: IAccount, accIndex: number, count: number = 1) {
    if(account.balance.lte(0)) {
        loggers[accIndex].error("Not Enough Wrapped Neon To Transact");
        console.error(`${MAIN_ADDRESS[accIndex]} has 0 wNeon and cannot continue...`);
        return;
    }
    queues[accIndex].add(`${MAIN_ADDRESS[accIndex]}-neon-job`, {
        token: WRAPPED_NEON_TOKEN,
        amount: NEON_AMOUNT,
        count,
        accountIndex: accIndex,
    });
};

export async function swapUSDT(accIndex: number, count?: number) {
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
    });
};

export async function wrapNeons(): Promise<void> {
    for(let i = 0; i < MAIN_ADDRESS.length; i++) {
        const amountToSwap = parseUnits(String(3), WRAPPED_NEON_TOKEN.decimal);
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
        console.log(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal));
        if(balance.gt(0)) {
            await unwrapNeon(wallets[accIndex], balance);
            console.log("UNWRAPPED MY REMAINING NEON ", balance);
        }
}
