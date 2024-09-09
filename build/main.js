"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const swap_1 = require("./swap");
function main() {
    return __awaiter(this, arguments, void 0, function* (n = 0) {
        //     console.log("process starting");
        const skip = yield (0, swap_1.wrapNeons)();
        // const amount = parseUnits("2", 18);
        // await swap(DEXS[0], WRAPPED_NEON_TOKEN, USDT_TOKEN, MAIN_ADDRESS[0], amount);
        // const sum = skip.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        // if(sum === MAIN_ADDRESS.length) {
        //      console.log("No wallet has enough balance, ending");
        //      console.log("process ending...");
        //      process.exit();
        // }
        // const nonce = await swap_Neon_To(skip, n);
        // await swap_USDT_To(skip, nonce, n);
    });
}
main();
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com
