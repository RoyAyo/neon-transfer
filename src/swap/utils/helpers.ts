import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";

import { ERC20_ABI, swapDeadline, WRAPPED_NEON } from "./constants";

export async function swapTokens(dex: any, wallet: Wallet, path1: string, path2: string, amountIn: BigNumber, amountOutMin: BigNumber) {
    const path = [path1, path2];
    const router = new Contract(dex.router, dex.abi, wallet);

    try {
        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            wallet.address,
            swapDeadline
        );

        await tx.wait();
        console.log(`${dex.name} swap executed! successfully`);

    } catch (error) {
        console.error(`Error executing trade on ${dex.name}:`, error);
    }
}

export async function getBalance(provider: JsonRpcProvider, address: string, contractAddress?: string) {
    if(contractAddress) {
        const tokenContract = new Contract(contractAddress, ERC20_ABI, provider);

        const balance = await tokenContract.balanceOf(address);

        return balance;
    } else {
        const balance = await provider.getBalance(address);
        return balance;
    }
}

export async function checkPrice(dex: any, wallet: Wallet, path1: String, path2: String, amountIn: BigNumber) {
    const path = [path1, path2];
    const router = new Contract(dex.router, dex.abi, wallet);

    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        console.error(`Error getting prices from ${dex.name}:`, error);
        return BigNumber.from(0);
    }
}

export async function wrapNeon(wallet: Wallet, amountToWrap: BigNumber) {
    const wrapContract = new Contract(WRAPPED_NEON, ERC20_ABI, wallet);
    const tx = await wrapContract.deposit({ value: amountToWrap });
    await tx.wait();

    console.log("Wrapped NEON successfully");
}

export async function unwrapNeon(wallet: Wallet, amountToUnwrap: BigNumber) {
    const wrapContract = new Contract(WRAPPED_NEON, ERC20_ABI, wallet);
    const tx = await wrapContract.withdraw(amountToUnwrap);
    await tx.wait();
  
    console.log(`Unwrapped NEON successfully: ${tx.hash}`);
}