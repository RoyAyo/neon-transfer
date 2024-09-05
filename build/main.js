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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transfer_1 = require("./transfer");
const token_list_json_1 = __importDefault(require("./utils/token-list.json"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const chainId = parseInt(`0xe9ac0ce`);
        const supportedTokens = ['USDT', 'USDC'];
        const tokens = ((_a = token_list_json_1.default === null || token_list_json_1.default === void 0 ? void 0 : token_list_json_1.default.tokens) !== null && _a !== void 0 ? _a : []).filter(t => t.chainId === chainId).filter(t => supportedTokens.includes(t.symbol));
        yield runTransfers(tokens);
    }
    catch (error) {
        console.error("Error...", error);
    }
});
const runTransfers = (tokens) => __awaiter(void 0, void 0, void 0, function* () {
    // await transferNeonToSolana(1);
    // await transferSolanaToNeon(0.5);
    // await transferERC20TokenToSolana(tokens[0], 0.1);
    yield (0, transfer_1.transferSPLTokenToNeonEvm)(tokens[0], 0.1);
    console.log("completed");
});
main();
console.log("started");
