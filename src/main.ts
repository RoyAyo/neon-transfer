import { ensureAllowance, getTransactionCounts, swap, swapNEON, wrapNeons } from "./swap";
import { delay } from "./utils/helpers";

export async function main(n: number = 1) {
     
     const nonce = await getTransactionCounts();

     // await swapNEON(nonce, n);
}

export async function start() {
     // WRAP NEONS
     // await wrapNeons();

     // console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
     // await ensureAllowance();
     // await delay(20000); //adding delays to ensure the transaction nonce is updated...
     // console.log("...DONE...");
     
     
     await main();
}

start();

process.on('unhandledRejection', (reason, promise) => {
     console.error('Unhandled Rejection at:', promise, 'reason:', reason);
     process.exit();
});