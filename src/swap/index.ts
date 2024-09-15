import { AMOUNT_WNEON_TO_START_WITH, NEON_AMOUNT, NEON_MOVED_PER_SET, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import { formatUnits, parseUnits } from "@ethersproject/units";

import { loggers, MAIN_ADDRESS, provider, queues, wallets } from "../config";
import { IAccount, } from "../core/interfaces";
import { unwrapNeon, wrapNeon } from "./neon";
import { getBalance } from "../utils/contract.helpers";
import { addErrorToCompleteQueue } from "../utils/helpers";

export async function startNEONSwap(account: IAccount, accountIndex: number, count: number = 1) {
    if(account.balance.lte(parseUnits(String(AMOUNT_WNEON_TO_START_WITH), WRAPPED_NEON_TOKEN.decimal))) {
        loggers[accountIndex].error("Not Enough Wrapped Neon To Transact");
        console.error(`${MAIN_ADDRESS[accountIndex]} has 0 wNeon and cannot continue...`);
        addErrorToCompleteQueue(MAIN_ADDRESS[accountIndex], count - 1);
        return;
    }
    queues[accountIndex].add(`${MAIN_ADDRESS[accountIndex]}-neon-job`, {
        TOKEN_ADDRESS_FROM: WRAPPED_NEON_TOKEN,
        amount: NEON_AMOUNT,
        count,
        accountIndex: accountIndex,
    });
};

export async function swapUSDT(accountIndex: number, count: number = NEON_MOVED_PER_SET) {
    const balance = await getBalance(provider, MAIN_ADDRESS[accountIndex], USDT_TOKEN);
    if(Number(formatUnits(balance, USDT_TOKEN.decimal)) <= 0) {
        console.log("USDT TOO SMALL FOR TRANSFER");
        addErrorToCompleteQueue(MAIN_ADDRESS[accountIndex], count - 1);
        return;
    }
    console.log("MOVING USDT WITH BALANCE ", formatUnits(balance, USDT_TOKEN.decimal), " back");
    queues[accountIndex].add(`${MAIN_ADDRESS[accountIndex]}-usdt-job`, {
        TOKEN_ADDRESS_FROM: USDT_TOKEN,
        amount: formatUnits(balance, USDT_TOKEN.decimal),
        count,
        accountIndex: accountIndex,
    });
};

export async function wrapNeons(amountToWrap: string, accountIndex: number): Promise<void> {
    const balance = await getBalance(provider, MAIN_ADDRESS[accountIndex]);
    console.log(`My total NEON BALANCE for address ${MAIN_ADDRESS[accountIndex]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
    const amountToSwap = amountToWrap === 'all' ? balance : parseUnits(amountToWrap, WRAPPED_NEON_TOKEN.decimal);
    if (balance.lt(amountToSwap)) {
        console.log(`Not enough Neon to wrap in ${MAIN_ADDRESS[accountIndex]}, deposit More ....`);
        return;
    } else {
        await wrapNeon(wallets[accountIndex], amountToSwap);
    }
}

export async function unWrapNeons(amountToUnwrap: string, accountIndex: number) {
    const balance = await getBalance(provider, MAIN_ADDRESS[accountIndex], WRAPPED_NEON_TOKEN);
    const amountToSwap = amountToUnwrap === 'all' ? balance : parseUnits(amountToUnwrap, WRAPPED_NEON_TOKEN.decimal);
    console.log(`My total WNEON BALANCE for address ${MAIN_ADDRESS[accountIndex]} is ${formatUnits(balance,WRAPPED_NEON_TOKEN.decimal)}`);
    if (balance.lt(amountToSwap)) {
        console.log(`Not enough Neon to unwrap in ${MAIN_ADDRESS[accountIndex]}, deposit More ....`);
        return;
    } else {
        await unwrapNeon(wallets[accountIndex], amountToSwap);
    }
}
