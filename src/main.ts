import { parseUnits } from "@ethersproject/units";
import { getTransactionCounts, swap, swap_Neon_To, swap_USDT_To, unWrapNeons, wrapNeons } from "./swap";
import { DEXS, MAIN_ADDRESS, USDT_TOKEN, WRAPPED_NEON_TOKEN } from "./utils/constants";
import { delay, swapTokens } from "./utils/helpers";

export async function main(n: number = 1) {
//     console.log("process starting");

     // const skip = await wrapNeons();

     // const amount = parseUnits("2", 18);
     // await swap(DEXS[0], WRAPPED_NEON_TOKEN, USDT_TOKEN, MAIN_ADDRESS[0], amount);

     const nonce = await getTransactionCounts();

     await swap_Neon_To(nonce, n);

     await swap_USDT_To(nonce, n);
}

main();
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com