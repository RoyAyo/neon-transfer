import { parseUnits } from "@ethersproject/units";
import { getTransactionCounts, swap, swapNEON, swapUSDT, unWrapNeons, wrapNeons } from "./swap";
import { USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./utils/constants";
import { MAIN_ADDRESS } from "./config";

export async function main(n: number = 1) {
     const nonce = await getTransactionCounts();
     console.log(nonce);

     await swapNEON(nonce, n);

     await swapUSDT(nonce, n);
}
main();

export async function test() {

     const nonce = await getTransactionCounts();
     console.log(nonce);

     // await wrapNeons();
     // await unWrapNeons(MAIN_ADDRESS[0], 0);
}

// test();