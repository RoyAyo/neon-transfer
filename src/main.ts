import { MAIN_ADDRESS } from "./config";
import { ensureAllowance, getTransactionCount, swapNEON, wrapNeons } from "./swap";
import { delay } from "./utils/helpers";
import { IAccount } from "./core/interfaces";

export async function main(nonce: IAccount, accIndex: number, n: number = 1) {
     await swapNEON(nonce, accIndex, n);
}

export async function start() {
     try {
          await wrapNeons();
     
          console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
          await ensureAllowance();
          await delay(10000); //adding delays to ensure the transaction nonce is updated...
          console.log("...TOKEN APPROVALS DONE...");

          for (let i = 0; i < MAIN_ADDRESS.length; i++) {
               const nonce = await getTransactionCount(i);
               main(nonce, i);
          }
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