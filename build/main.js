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
const helpers_1 = require("./utils/helpers");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("process starting");
        for (let i = 0; i < 3; i++) {
            yield (0, swap_1.swap_Neon_To)();
            console.log("WAITING 5 SECONDS BEFORE SWAPPING NEON BACK");
            (0, helpers_1.delay)(5000);
            yield (0, swap_1.swap_USDT_To)();
            console.log("FINSHIED SET ", i);
            (0, helpers_1.delay)(1000);
        }
    });
}
// DEX..
// sobal.fi
// Moraswap.com
// vibr.finance
// icecreamswap.com
