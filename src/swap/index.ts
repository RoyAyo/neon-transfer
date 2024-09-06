import { JsonRpcProvider } from "@ethersproject/providers";
import { formatUnits, parseUnits } from "@ethersproject/units";
import { Wallet } from "@ethersproject/wallet";

import { DEXS, NEON_PRIVATE, PROXY_URL, USDT_TOKEN, WRAPPED_NEON_TOKEN, } from "./utils/constants";
import {  getBalance, swapTokens, wrapNeon } from "./utils/helpers";


const provider = new JsonRpcProvider(PROXY_URL);
const wallet = new Wallet(NEON_PRIVATE!, provider);

(async function main() {
    
    let amountToSwap = parseUnits("30", WRAPPED_NEON_TOKEN.decimal);
    const balance = await getBalance(provider, wallet.address, WRAPPED_NEON_TOKEN);
    console.log(`I have a balance of ${balance}`);
    
    await wrapNeon(wallet, amountToSwap);
    console.log("Wrapped NEON INTO wneon");

    console.log("Started sending wNeon to usdt...");
    const swapRcpt = await swapTokens(DEXS[0], wallet, WRAPPED_NEON_TOKEN, USDT_TOKEN, amountToSwap);
    if(swapRcpt) {
        console.log("Sent wNeon to usdt..., ", swapRcpt);

        amountToSwap = parseUnits("1", USDT_TOKEN.decimal)
        console.log("Started sending usdt to wneon...");
        const rcpt = await swapTokens(DEXS[0], wallet, USDT_TOKEN, WRAPPED_NEON_TOKEN, amountToSwap);
        console.log("Sent usdt..., ", rcpt);
    }
})();