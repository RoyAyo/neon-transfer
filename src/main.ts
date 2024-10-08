import {  MAIN_ADDRESS, NO_OF_KEYS } from "./config";
import { IAccount } from "./core/interfaces";
import { startNEONSwap, unWrapNeons, wrapNeons } from "./swap";
import { unwrapNeon } from "./swap/neon";
import { DEFAULT_NEON_TO_WRAP } from "./utils/constants";
import { ensureAllowance, getTransactionCount } from "./utils/contract.helpers";
import { findAccountIndexByPublicKey, shutdown } from "./utils/helpers";

const task = process.argv[2] ?? 'main';
export let jobsToBeDone = NO_OF_KEYS;

export async function main(txCount: IAccount, accIndex: number, count: number = 1) {
     await startNEONSwap(txCount, accIndex, count);
}

async function startWrap(command: string = "wrap", amountToWrap?: string, pubKey?: string[]) {
     try {
          let amountIn = (amountToWrap !== 'all' && isNaN(Number(amountToWrap))) ? String(DEFAULT_NEON_TO_WRAP) : amountToWrap!;
          let accounts: number[] = [];
          if(pubKey && pubKey.length > 0) {
               accounts = findAccountIndexByPublicKey(pubKey);
          } else {
               accounts = Array.from({ length: MAIN_ADDRESS.length }, (_, index) => index);
          }
          for(let accountIndex of accounts) {
               if(command === 'wrap') {
                    await wrapNeons(amountIn, accountIndex);
               } else {
                    await unWrapNeons(amountIn, accountIndex)
               }
          }
          process.exit();
     } catch (error: any) {
          console.error(error.message)
     }
}

async function startAllowance() {
     console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
     await ensureAllowance();
     console.log("...TOKEN APPROVALS DONE...");
     process.exit();
}

async function start(pubKey: string[]) {
     try {
          let accounts: number[] = []
          if(pubKey && pubKey.length > 0) {
               accounts = findAccountIndexByPublicKey(pubKey);
          } else {
               accounts = Array.from({ length: MAIN_ADDRESS.length }, (_, index) => index);
          }
          jobsToBeDone = accounts.length;
          for (let accountIndex of accounts) {
               const txCount = await getTransactionCount(accountIndex);
               console.log(txCount);
               main(txCount, accountIndex);
          }
     } catch (error) {
          console.error('APPLICATION ERROR: ', error);
     }
}

process.on('unhandledRejection', async (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     await shutdown(false);
});

process.on('uncaughtException', async (reason, promise) => {
     console.error('Unhandled Exception at:', promise, 'reason:', reason);
     await shutdown(false);
});


process.on('SIGINT', async () => {
     await shutdown(false);
});
process.on('SIGTERM', async () => {
     await shutdown(false);
});

switch (task.toLowerCase()) {
     case "wrap":
     case "unwrap": {
          const arg = process.argv[3];
          const arg2 = process.argv.slice(4);
          startWrap(task, arg, arg2);
          break;
     }
     case "allowance":
          startAllowance();
          break;
     default: {
          const arg = process.argv.slice(3);
          start(arg);
          break;
     }
}