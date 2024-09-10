import { MAIN_ADDRESS, wallets } from "./config";
import { ensureAllowance, getTransactionCount, swap, swapNEON, wrapNeons } from "./swap";
import { delay, swapTokens } from "./utils/helpers";
import { IAccount } from "./core/interfaces";
import { DEXS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./utils/constants";
import { parseUnits } from "@ethersproject/units";

export async function main(nonce: IAccount, accIndex: number, n: number = 1) {
     await swapNEON(nonce, accIndex, n);
}

export async function start() {
     // WRAP NEONS
     await wrapNeons();
     
     console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
     await ensureAllowance();
     await delay(10000); //adding delays to ensure the transaction nonce is updated...
     console.log("...DONE...");

     for (let i = 0; i < MAIN_ADDRESS.length; i++) {
          const nonce = await getTransactionCount(i);
          console.log(nonce);
          main(nonce, i);
     }
}

start();

process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     process.exit();
});

process.on('uncaughtException', (reason, promise) => {
     console.error('Unhandled Exception at:', promise, 'reason:', reason);
     process.exit();
});