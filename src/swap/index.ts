import { JsonRpcProvider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";

import { DEXS, MAIN_ADDRESS, NEON_PRIVATE, PROXY_URL, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "../utils/constants";
import {  getBalance, swapTokens, wrapNeon } from "../utils/helpers";
import { IDEX, ITokens } from "../core/interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import { queues } from "../config";

export const provider = new JsonRpcProvider(PROXY_URL);
const wallet = new Wallet(NEON_PRIVATE!, provider);

export async function swap(dex: IDEX, TOKEN_FROM: ITokens, TOKEN_TO: ITokens, amountToSwap: BigNumber) {
    return swapTokens(DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, amountToSwap);
};

export async function swap_Neon_To() {
    for (let i = 0; i < 10; i++) {
        const balance = await getBalance(provider, MAIN_ADDRESS[i], WRAPPED_NEON_TOKEN);
        let noTimes = Math.floor(Number(formatUnits(balance, WRAPPED_NEON_TOKEN.decimal)));
        noTimes = noTimes < 12 ? noTimes : 12; 
        for(let i = 0; i < noTimes; i++) {
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            await queues[i].add(`${DEXS[rand].name}:-${MAIN_ADDRESS[i]}:-${Date.now()}`, {
                token: WRAPPED_NEON_TOKEN,
                account: MAIN_ADDRESS[i],
                dex: DEXS[rand],
                amount: parseUnits("1", WRAPPED_NEON_TOKEN.decimal),
            }, {attempts: 2});
        }
    }
};

export async function swap_USDT_To() {
        for (let i = 0; i < 10; i++) {
            const balance = await getBalance(provider, MAIN_ADDRESS[i], USDT_TOKEN);
            const splitBalance = balance.div(4);
            const rand = Math.floor(Math.random() * DEXS.length); // use a random dex
            for (let i = 0; i < 3; i++) {
                await queues[i].add(`${DEXS[rand].name}:-${MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: USDT_TOKEN,
                    account: MAIN_ADDRESS[i],
                    dex: DEXS[rand],
                    amount: splitBalance,
                }, {attempts: 2});
            }
    }
};