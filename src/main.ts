import { parseUnits } from "@ethersproject/units";
import { getTransactionCounts, swap, swap_Neon_To, swap_USDT_To, unWrapNeons, wrapNeons } from "./swap";
import { DEXS, MAIN_ADDRESS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./utils/constants";
import { delay, swapTokens } from "./utils/helpers";

export async function main(n: number = 1) {
//     console.log("process starting");

     // const skip = await wrapNeons();
     const skip = [0];

     // const amount = parseUnits("2", 18);
     // await swap(DEXS[0], WRAPPED_NEON_TOKEN, USDT_TOKEN, MAIN_ADDRESS[0], amount);

     const sum = skip.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

     if(sum === MAIN_ADDRESS.length) {
          console.log("No wallet has enough balance, ending");
          console.log("process ending...");
          process.exit();
     }

     const nonce = await getTransactionCounts();
     console.log(nonce);

     await swap_Neon_To(nonce, skip, n);

     await swap_USDT_To(nonce, skip, n);
}

main();
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com