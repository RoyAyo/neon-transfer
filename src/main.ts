import { MAIN_ADDRESS, wallets } from "./config";
import { ensureAllowance, getTransactionCount, swapNEON, wrapNeons } from "./swap";
import { checkPrice, delay } from "./utils/helpers";
import { IAccount } from "./core/interfaces";
import { DEXS, slippage, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./utils/constants";
import { formatUnits, parseUnits } from "@ethersproject/units";

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

          for (let i = 0; i < 1; i++) {
               const nonce = await getTransactionCount(i);
               main(nonce, i);
          }

          // const p = await checkPrice(wallets[0], DEXS[1], WRAPPED_NEON_TOKEN, USDT_TOKEN, parseUnits("1", 18));
          // console.log(formatUnits(p, 6));
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