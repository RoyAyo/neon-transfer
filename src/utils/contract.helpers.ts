import { DEXS, ERC20_ABI, FIXED_TOKENS_TO_APPROVE, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./constants";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";

import { MAIN_ADDRESS, provider, wallets } from "../config";
import { IAccount, IDEX, ITokens } from "../core/interfaces";

export async function approveToken(wallet: Wallet, dex: IDEX, TOKEN_ADDRESS: ITokens) {
    const approvalAmount =  parseUnits(FIXED_TOKENS_TO_APPROVE, TOKEN_ADDRESS.decimal);
    const tokenContract = new Contract(TOKEN_ADDRESS.address, ERC20_ABI, wallet);
    await tokenContract.approve(dex.router, approvalAmount);
}

export async function checkPrice(wallet: Wallet, dex: IDEX, TOKEN_ADDRESS_FROM: ITokens, TOKEN_ADDRESS_TO: ITokens, amountIn: BigNumber) {
    const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
    const router = new Contract(dex.router, dex.abi, wallet);

    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error: any) {
        console.log();
        console.error(`Error getting prices from ${dex.name}:`, error);
        return BigNumber.from(0);
    }
}

export async function ensureAllowance() {
    for (let i = 0; i < MAIN_ADDRESS.length; i++) {
        try {
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
        } catch (error) {
            console.error("Unable to run approval for ", MAIN_ADDRESS[i], error);  
        }
    }
}

export async function getAllowance(wallet: Wallet, dexRouterAddress: string, TOKEN_ADDRESS: string): Promise<BigNumber> {
    const tokenContract = new Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
    const allowance = await tokenContract.allowance(wallet.address, dexRouterAddress);

    return allowance;
}

export async function getBalance(provider: JsonRpcProvider, address: string, contractAddress?: ITokens): Promise<BigNumber> {
    if(contractAddress) {
        const tokenContract = new Contract(contractAddress.address, ERC20_ABI, provider);

        const balance = await tokenContract.balanceOf(address);

        return balance;
    } else {
        const balance = await provider.getBalance(address);
        return balance;
    }
}

export async function getTransactionCount(accountIndex: number): Promise<IAccount> {
    const nonce = await provider.getTransactionCount(MAIN_ADDRESS[accountIndex], 'latest');
    const balance = await getBalance(provider, MAIN_ADDRESS[accountIndex], WRAPPED_NEON_TOKEN);
    return {
        nonce,
        balance
    };
}