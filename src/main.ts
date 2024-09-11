import { MAIN_ADDRESS } from "./config";
import { IAccount } from "./core/interfaces";
import { startNEONSwap } from "./swap";
import { getTransactionCount } from "./utils/contract.helpers";
import {  delay } from "./utils/helpers";

export async function main(txCount: IAccount, accIndex: number, count: number = 1) {
     await startNEONSwap(txCount, accIndex, count);
}

export async function start() {
     try {
          // await wrapNeons();
          
          // comment this after the first time...
          // console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
          // await ensureAllowance();
          // await delay(10000); //adding delays to ensure the transaction nonce is updated...
          // console.log("...TOKEN APPROVALS DONE...");

          // for (let accountIndex = 0; accountIndex < MAIN_ADDRESS.length; accountIndex++) {
          //      const txCount = await getTransactionCount(accountIndex);
          //      console.log(txCount);
          //      main(txCount, accountIndex);
          // }
     } catch (error) {
          console.error('APPLICATION ERROR: ', error);
     }
}

process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     process.exit();
});

process.on('uncaughtException', (reason, promise) => {
     console.error('Unhandled Exception at:', promise, 'reason:', reason);
     process.exit();
});

start();