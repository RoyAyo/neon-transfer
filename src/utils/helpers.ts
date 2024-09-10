import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { EventEmitter } from "stream";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

import { ERC20_ABI, FIXED_TOKENS_TO_APPROVE, NEON_MOVED_PER_SET, NO_OF_SETS, slippage, swapDeadline, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./constants";
import { IDEX, ITokens } from "../core/interfaces";
import { events, loggers, MAIN_ADDRESS, queues, wallets } from "../config";
import { getTransactionCount, swapUSDT, unWrapNeons } from "../swap";
import { main } from "../main";
import { Job } from "bullmq";

class TimeoutError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'TimeoutError';
    }
  }

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function swapTokens(accountIndex: number, TOKEN_ADDRESS_FROM: ITokens, TOKEN_ADDRESS_TO: ITokens, dex: IDEX, amountIn: BigNumber, nonce: number = 0, count: number = 0, job?: Job): Promise<void> {
    const wallet = wallets[accountIndex];

    const amountOutMinInTokenFrom: BigNumber = amountIn.mul(slippage).div(100);
    const amountOutMinInTokenTo: BigNumber = await checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);
    const parsedAmount = formatUnits(amountIn, TOKEN_ADDRESS_FROM.decimal);

    const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];

    const router = new Contract(dex.router, dex.abi, wallet);
    try {
        // const gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(150)).div(100);

        console.log(`Transaction STARTED... Address: ${wallet.address}, Amount: ${parsedAmount} Nonce: ${nonce} From: ${TOKEN_ADDRESS_FROM.name}`);

        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMinInTokenTo,
            path,
            wallet.address,
            swapDeadline,
            {
                nonce,
            }
        );

        withTimeout(tx.wait(), 60000)
            .then((receipt: any) => {
                console.log(`swap successful for ${MAIN_ADDRESS[accountIndex]} hash: ${receipt.transactionHash}`);
                if(TOKEN_ADDRESS_FROM.address === USDT_TOKEN.address) {
                    events[accountIndex].emit('usdt_complete', accountIndex, count);
                } else {
                    events[accountIndex].emit('neon_complete', nonce, accountIndex, count);
                }
                loggers[accountIndex].info(`swap successful: ${receipt.transactionHash}`)
            }).catch((error: any) => {
                events[accountIndex].emit('job_failed', job, error, accountIndex, nonce, count);
                loggers[accountIndex].error(`Transaction with nonce ${nonce} failed:`, error);
                console.error(error);
            });

    } catch (error: any) {
        loggers[accountIndex].error(`Transaction with nonce ${nonce} failed:`, error);
        events[accountIndex].emit('job_failed', job, error, accountIndex, nonce, count);
    }
}

function withTimeout(promise: Promise<any>, timeoutMs: number): Promise<any> {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Transaction timed out after ${timeoutMs} ms`));
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
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

export async function wrapNeon(wallet: Wallet, amountToWrap: BigNumber): Promise<void> {
    const wrapContract = new Contract(WRAPPED_NEON_TOKEN.address, ERC20_ABI, wallet);
    try {
        console.log("Wrapping Neon ...")
        const tx = await wrapContract.deposit({
            value: amountToWrap
        });
        await tx.wait();
        console.log("Wrapped NEON successfully: ", tx.hash);
    } catch (error) {
        console.error(error);
    }
}

export async function unwrapNeon( wallet: Wallet, amountToUnwrap: BigNumber, nonce?: number): Promise<void> {
    const wrapContract = new Contract(WRAPPED_NEON_TOKEN.address, ERC20_ABI, wallet);
    try {
        console.log("Unwrapping Neon...")
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
}

export async function getAllowance(wallet: Wallet, dexRouterAddress: string, TOKEN_ADDRESS: string): Promise<BigNumber> {
    const tokenContract = new Contract(TOKEN_ADDRESS, ERC20_ABI, wallet);
    const allowance = await tokenContract.allowance(wallet.address, dexRouterAddress);

    return allowance;
}

export function addEvents(event: EventEmitter, i: number) {
    event.on('neon_complete', async (nonce: number, accIndex: number, count: number) => {
        console.log("Neon completed", count);
        if(count % NEON_MOVED_PER_SET === 0) {
            console.log("SWAPPING USDT BACK");
            await swapUSDT(nonce + 1, accIndex, count);
        }
    });

    event.on('usdt_complete', async (accIndex: number, count: number) => {
        if(count >= NEON_MOVED_PER_SET * NO_OF_SETS) {
            event.emit('job_complete', accIndex, count);
        } else {
            console.log("BATCH COMPLETED...");
            delay(10000);
            const nonce = await getTransactionCount(accIndex);
            await main(nonce, accIndex, count + 1);
        }
    })

    event.on('job_complete', async (accIndex: number, count: number) => {
        try {
            console.log(`Total Transactions For Account: ${MAIN_ADDRESS[accIndex]} is  ${count + NO_OF_SETS}`);
            await unWrapNeons(MAIN_ADDRESS[i], i);
            loggers[accIndex].info(`completed ${count + NO_OF_SETS}`);
        } catch (error) {
            console.error(error);
        }
    });

    event.on('job_failed', async (job: Job, error: any, accIndex: number, nonce: number, count: number) => {
        try {
            console.log("SWAP FAILED for: ", nonce, MAIN_ADDRESS[accIndex], count);

            if(error instanceof TimeoutError) {
                await queues[accIndex].add(job.name, job.data);
            } else {
                if(error.message.split(" ")[0] === 'nonce' || error.message.split(" ")[0] === 'replacement') {
                    delay(4000);
                    const nonce = await getTransactionCount(accIndex);
                    main(nonce, accIndex, count);
                } else {
                    console.error("Please restart server for address, ", MAIN_ADDRESS[accIndex], error);
                }
            }
        } catch (error) {
            console.error("Please restart server for address, ", MAIN_ADDRESS[accIndex], error);
        }
    });
}