import { AMOUNT_NEON_TO_START_WITH, DEFAULT_NEON_TO_WRAP, NEON_AMOUNT, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import { formatUnits, parseUnits } from "@ethersproject/units";

import { loggers, MAIN_ADDRESS, provider, queues, wallets } from "../config";
import { IAccount, } from "../core/interfaces";
import { unwrapNeon, wrapNeon } from "./neon";
import { getBalance } from "../utils/contract.helpers";

export async function startNEONSwap(account: IAccount, accountIndex: number, count: number = 1) {
    if(account.balance.lte(0)) {
        loggers[accountIndex].error("Not Enough Wrapped Neon To Transact");
        console.error(`${MAIN_ADDRESS[accountIndex]} has 0 wNeon and cannot continue...`);
        return;
    }
    queues[accountIndex].add(`${MAIN_ADDRESS[accountIndex]}-neon-job`, {
        TOKEN_ADDRESS_FROM: WRAPPED_NEON_TOKEN,
        amount: NEON_AMOUNT,
        count,
        accountIndex: accountIndex,
    });
};

export async function swapUSDT(accountIndex: number, count?: number) {
    const balance = await getBalance(provider, MAIN_ADDRESS[accountIndex], USDT_TOKEN);
    if(Number(formatUnits(balance, USDT_TOKEN.decimal)) <= 0) {
        console.log("USDT TOO SMALL FOR TRANSFER");;
        return;
    }
    console.log("MOVING USDT WITH BALANCE ", formatUnits(balance, 6), " back");
    queues[accountIndex].add(`${MAIN_ADDRESS[accountIndex]}-usdt-job`, {
        TOKEN_ADDRESS_FROM: USDT_TOKEN,
        amount: formatUnits(balance, USDT_TOKEN.decimal),
        count,
        accountIndex: accountIndex,
    });
};

export async function wrapNeons(amountToWrap: string, accountIndex?: number): Promise<void> {
    const length = accountIndex ? accountIndex + 1 : MAIN_ADDRESS.length;
    for(let i = accountIndex ?? 0; i < length; i++) {
        const balance = await getBalance(provider, MAIN_ADDRESS[i]);
        console.log(`My total NEON BALANCE for address ${MAIN_ADDRESS[i]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
        const amountToSwap = amountToWrap === 'all' ? balance : parseUnits(amountToWrap, WRAPPED_NEON_TOKEN.decimal);
        if (balance.lt(amountToSwap)) {
            console.log(`Not enough Neon to wrap in ${MAIN_ADDRESS[i]}, deposit More ....`);
            continue;
        } else {
            await wrapNeon(wallets[i], amountToSwap);
        }
    }
}

export async function unWrapNeons(amountToUnwrap: string, accountIndex?: number) {
    const length = accountIndex ? accountIndex + 1 : MAIN_ADDRESS.length;
    for (let i = accountIndex ?? 0; i < length; i++) {
        const balance = await getBalance(provider, MAIN_ADDRESS[i], WRAPPED_NEON_TOKEN);
        const amountToSwap = amountToUnwrap === 'all' ? balance : parseUnits(amountToUnwrap, WRAPPED_NEON_TOKEN.decimal);
        console.log(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal));
        console.log(`My total WNEON BALANCE for address ${MAIN_ADDRESS[i]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
        if(balance.gt(0)) {
            await unwrapNeon(wallets[i], amountToSwap);
        }
        console.log("UNWRAPPED WNEON :", formatUnits(amountToSwap, WRAPPED_NEON_TOKEN.decimal));
    }
}
