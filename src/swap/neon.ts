import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import { ERC20_ABI, slippage, swapDeadline, TRANSACTION_TIMEOUT, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "../utils/constants";
import { events, loggers, provider, wallets } from "../config";
import { Job } from "bullmq";
import { checkPrice } from "../utils/contract.helpers";
import { formatUnits } from "@ethersproject/units";
import { withTimeout } from "../utils/helpers";

export async function swapTokens(job: Job): Promise<void> {

    const {
        accountIndex,
        dex,
        TOKEN_ADDRESS_FROM,
        TOKEN_ADDRESS_TO,
        amountIn,
        increase,
    } = job.data;

    const wallet = wallets[accountIndex];

    const amountOutMinInTokenFrom: BigNumber = amountIn.mul(slippage).div(100);
    const amountOutMinInTokenTo: BigNumber = await checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);
    const parsedAmount = formatUnits(amountIn, TOKEN_ADDRESS_FROM.decimal);

    const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];

    const router = new Contract(dex.router, dex.abi, wallet);
    try {
        console.log(`Transaction STARTED... Address: ${wallet.address}, Amount: ${parsedAmount} From: ${TOKEN_ADDRESS_FROM.name}`);
        
        let gasPrice;
        
        if(increase > 0) {
            console.log("Increasing Gas price")
            // increase by 120%.. 140...
            gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(100 + (20 * increase))).div(100);
        }


        const options = increase ? {
        } : {
            gasPrice
        };

        const tx = await router.swapExactTokensForTokens(
            amountIn,
            amountOutMinInTokenTo,
            path,
            wallet.address,
            swapDeadline,
            {
                ...options
            }
        );

        withTimeout(tx.wait(), TRANSACTION_TIMEOUT).then((receipt: any) => {
            if(TOKEN_ADDRESS_FROM.address === USDT_TOKEN.address) {
                events[accountIndex].emit('usdt_complete', job);
            } else {
                events[accountIndex].emit('neon_swapped', job);
            }
            loggers[accountIndex].info(`swap successful: ${receipt.transactionHash}`)
        }).catch(e => {
            loggers[accountIndex].error(`Transaction timed-out:`);
            events[accountIndex].emit('job_failed', job, e);
        });


    } catch (error: any) {
        loggers[accountIndex].error(`Transaction failed:`, error.message);
        events[accountIndex].emit('job_failed', job, error);
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
        console.log(`Wrapped NEON successfully: ${tx.hash}`);

    } catch (error) {
        console.error(error);
    }
}

export async function unwrapNeon(wallet: Wallet, amountToUnwrap: BigNumber): Promise<void> {
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