import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { formatUnits, parseUnits } from "@ethersproject/units";

import { NEON_PRIVATE, PROXY_URL, TRANSFER_ABI, WRAPPED_NEON } from "./utils/constants";



const provider = new JsonRpcProvider(PROXY_URL);
const neonWallet = new Wallet(NEON_PRIVATE!, provider);

(async function main() {

})();


async function wrapNeon(amountToWrap: BigNumber) {
    const wrapContract = new Contract(WRAPPED_NEON, TRANSFER_ABI, neonWallet);
    const tx = await wrapContract.deposit({ value: amountToWrap });
    await tx.wait();

    console.log("Wrapped NEON successfully");
}

async function getBalance(contractAddress?: String) {
    // const tokenContract = new Contract(WRAPPED_NEON, erc20Abi, provider);

    // const balance = await tokenContract.balanceOf(neonWallet.address);

    const balance = await provider.getBalance(neonWallet.address);

    console.log(formatUnits(balance, 18));
}


const amountIn = parseUnits("10", 18);
const minAmount = amountIn.mul(98).div(100);

// swapTokens(amountIn, minAmount);

// checkPrice(amountIn);

// getBalance();

wrapNeon(amountIn);