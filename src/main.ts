import { MAIN_ADDRESS } from "./config";
import { IAccount } from "./core/interfaces";
import { startNEONSwap, wrapNeons } from "./swap";
import { ensureAllowance, getTransactionCount } from "./utils/contract.helpers";

const command = process.argv[2] ?? 'main';

export async function main(txCount: IAccount, accIndex: number, count: number = 1) {
     await startNEONSwap(txCount, accIndex, count);
}

async function startWrap() {
     await wrapNeons();
}

async function startAllowance() {
     console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
     await ensureAllowance();
     console.log("...TOKEN APPROVALS DONE...");
}

async function start() {
     try {

          for (let accountIndex = 0; accountIndex < MAIN_ADDRESS.length; accountIndex++) {
               const txCount = await getTransactionCount(accountIndex);
               console.log(txCount);
               main(txCount, accountIndex);
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


switch (command.toLowerCase()) {
     case "wrap":
          startWrap();
          break;
     case "allowance":
          startAllowance();
          break;
     default:
          start();
          break;
}