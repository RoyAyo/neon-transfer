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
const swap_1 = require("./swap");
const constants_1 = require("./utils/constants");
const helpers_1 = require("./utils/helpers");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("process starting");
        const skip = yield (0, swap_1.wrapNeons)();
        const sum = skip.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        console.log(sum);
        if (sum === constants_1.MAIN_ADDRESS.length) {
            console.log("No wallet has enough balance, ending");
            console.log("process ending...");
            process.exit();
        }
        for (let i = 0; i < 3; i++) {
            yield (0, swap_1.swap_Neon_To)(skip);
            console.log("WAITING 5 SECONDS BEFORE SWAPPING NEON BACK");
            (0, helpers_1.delay)(5000);
            yield (0, swap_1.swap_USDT_To)(skip, i);
            console.log("FINSHIED SET ", i);
            (0, helpers_1.delay)(10000);
        }
    });
}
main();
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com
