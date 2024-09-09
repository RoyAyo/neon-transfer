import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

import { ERC20_ABI, FIXED_TOKENS_TO_APPROVE, slippage, swapDeadline, WRAPPED_NEON_TOKEN } from "./constants";
import { IDEX, ITokens } from "../core/interfaces";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { NEON_TOKEN_DECIMALS } from "@neonevm/token-transfer-core";

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

export async function swapTokens(wallet: Wallet, dex: IDEX, TOKEN_ADDRESS_FROM: ITokens, TOKEN_ADDRESS_TO: ITokens, address: string, amountIn: BigNumber, n: number = 0): Promise<any> {
    // keep this data in memory instead of in data..
    const allowance = await getAllowance(wallet, dex.router, TOKEN_ADDRESS_FROM.address);

    if(allowance.lt(amountIn)) {
        console.error("INSUFFICIENT AMOUNT ALLOWED");
        await approveToken(wallet, dex, TOKEN_ADDRESS_FROM);
        console.log("amount approved");
    }

    const amountOutMinInTokenFrom: BigNumber = amountIn.mul(slippage).div(100);
    const amountOutMinInTokenTo: BigNumber = await checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);

    const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];

    const router = new Contract(dex.router, dex.abi, wallet);
    try {
        console.log('transaction starting...');

        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMinInTokenTo,
            path,
            address,
            swapDeadline,
        );

        const receipt = await tx.wait();
        console.log(`swap executed! successfully, ${receipt.transactionHash}`);
        return receipt;

    } catch (error) {
        console.error(`Error executing trade on ${dex.name}:`, error);

        return null;
    }
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

export async function checkPrice(wallet: Wallet, dex: IDEX, TOKEN_ADDRESS_FROM: ITokens, TOKEN_ADDRESS_TO: ITokens, amountIn: BigNumber) {
    const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
    const router = new Contract(dex.router, dex.abi, wallet);

    try {
        const amounts = await router.getAmountsOut(amountIn, path);
        return amounts[1];
    } catch (error) {
        console.error(`Error getting prices from ${dex.name}:`, error);
        return BigNumber.from(0);
    }
}

export async function wrapNeon(provider: JsonRpcProvider, wallet: Wallet, address: string, amountToWrap: BigNumber): Promise<void> {
    const wrapContract = new Contract(address, ERC20_ABI, wallet);
    // const gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(120)).div(100);
    try {
        console.log("starting transaction...")
        const tx = await wrapContract.deposit({
            value: amountToWrap
        });
        await tx.wait();
    
        console.log("Wrapped NEON successfully: ", tx.hash);
    } catch (error) {
        console.error(error);
    }
}

export async function unwrapNeon(provider: JsonRpcProvider, wallet: Wallet, address: string, amountToUnwrap: BigNumber, nonce?: number): Promise<void> {
    const wrapContract = new Contract(address, ERC20_ABI, wallet);
    // const gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(2000)).div(100);
    try {
        console.log("starting transaction...")
        const tx = await wrapContract.withdraw(amountToUnwrap);
        await tx.wait();
      
        console.log(`Unwrapped NEON successfully: ${tx.hash}`);
    } catch (error) {
        console.error(error);
    }
}

export async function approveToken(wallet: Wallet, dex: IDEX, TOKEN_ADDRESS: ITokens) {
    const approvalAmount =  parseUnits(FIXED_TOKENS_TO_APPROVE, TOKEN_ADDRESS.decimal);
    const tokenContract = new Contract(TOKEN_ADDRESS.address, ERC20_ABI, wallet);
    await tokenContract.approve(dex.router, approvalAmount);
    console.log("approved token");
}

export async function getAllowance(wallet: Wallet, dexRouterAddress: string, TOKEN_ADDRESS: string): Promise<BigNumber> {
    const tokenContract = new Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
    const allowance = await tokenContract.allowance(wallet.address, dexRouterAddress);

    return allowance;
}
