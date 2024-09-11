import { MAIN_ADDRESS } from "./config";
import { IAccount } from "./core/interfaces";
import { startNEONSwap, unWrapNeons, wrapNeons } from "./swap";
import { DEFAULT_NEON_TO_WRAP } from "./utils/constants";
import { ensureAllowance, getTransactionCount } from "./utils/contract.helpers";
import { findAccountIndexByPublicKey } from "./utils/helpers";

const task = process.argv[2] ?? 'main';
const arg = process.argv[3]; // pub key for main but amount for wrapping
const arg2 = process.argv[4];  // pubKey for wrapping

export async function main(txCount: IAccount, accIndex: number, count: number = 1) {
     await startNEONSwap(txCount, accIndex, count);
}

async function startWrap(pubKey?: string, amountToWrap?: string) {
     try {
          let amountIn = (amountToWrap !== 'all' && isNaN(Number(amountToWrap))) ? String(DEFAULT_NEON_TO_WRAP) : amountToWrap!;
          let accountIndex;
          if(pubKey) {
               accountIndex = findAccountIndexByPublicKey(pubKey);
          }
          await wrapNeons(amountIn, accountIndex);
     } catch (error: any) {
          console.error(error.message)
     }
}

async function startUnwrap(amountToUnwrap?: string, pubKey?: string,) {
     try {
          let amountIn = (amountToUnwrap !== 'all' && isNaN(Number(amountToUnwrap))) ? String(DEFAULT_NEON_TO_WRAP) : amountToUnwrap!;
          let accountIndex;
          if(pubKey) {
               accountIndex = findAccountIndexByPublicKey(pubKey);
          }
          await unWrapNeons(amountIn, accountIndex);
     } catch (error) {
          console.error(error);
     }
}

async function startAllowance() {
     console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
     await ensureAllowance();
     console.log("...TOKEN APPROVALS DONE...");
}

async function start(pubKey: string) {
     try {
          if(pubKey) {
               const accountIndex = findAccountIndexByPublicKey(pubKey);
               const txCount = await getTransactionCount(accountIndex);
               console.log(txCount);
               main(txCount, accountIndex);
          } else {
               for (let accountIndex = 0; accountIndex < MAIN_ADDRESS.length; accountIndex++) {
                    const txCount = await getTransactionCount(accountIndex);
                    console.log(txCount);
                    main(txCount, accountIndex);
               }
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


switch (task.toLowerCase()) {
     case "wrap":
          startWrap(arg, arg2);
          break;
     case "unwrap":
          startUnwrap(arg, arg2);
          break;
     case "allowance":
          startAllowance();
          break;
     default:
          start(arg);
          break;
}