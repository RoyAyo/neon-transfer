import { queues } from "./config";
import { DEXS } from "./utils/constants";

async function main() {
    for (let i = 0; i < DEXS.length; i++) {
        await queues[i].add(`${DEXS[i].name}-`, {}, {attempts: 2});
    }

};

main();
// DEX..
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com