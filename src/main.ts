import { swap_Neon_To, swap_USDT_To } from "./swap";
import { delay } from "./utils/helpers";

async function main() {
    console.log("process starting");
    
   for (let i = 0; i < 3; i++) {
        await swap_Neon_To();

        console.log("WAITING 5 SECONDS BEFORE SWAPPING NEON BACK")
        delay(5000);
        
        await swap_USDT_To();

        console.log("FINSHIED SET ", i);
        delay(1000);
   }
}
// DEX..

// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com