import { swap_Neon_To, swap_USDT_To, wrapNeons } from "./swap";
import { MAIN_ADDRESS } from "./utils/constants";
import { delay } from "./utils/helpers";

async function main() {
    console.log("process starting");

    const skip = await wrapNeons();

    const sum = skip.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
     console.log(sum);

    if(sum === MAIN_ADDRESS.length) {
     console.log("No wallet has enough balance, ending");
     console.log("process ending...");
     process.exit();
    }

   for (let i = 0; i < 3; i++) {
        await swap_Neon_To(skip);

        console.log("WAITING 5 SECONDS BEFORE SWAPPING NEON BACK")
        delay(5000);

        await swap_USDT_To(skip, i);

        console.log("FINSHIED SET ", i);
        delay(10000);
   }

   
}

main();
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com