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
exports.transferSPLTokenToNeonEvm = transferSPLTokenToNeonEvm;
exports.transferERC20TokenToSolana = transferERC20TokenToSolana;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const token_transfer_core_1 = require("@neonevm/token-transfer-core");
const token_transfer_ethers_1 = require("@neonevm/token-transfer-ethers");
const providers_1 = require("@ethersproject/providers");
const wallet_1 = require("@ethersproject/wallet");
const bs58_1 = require("bs58");
const utils_1 = require("./utils");
require('dotenv').config({});
const NEON_PRIVATE = process.env.NEON_PRIVATE;
const PHANTOM_PRIVATE = process.env.PHANTOM_PRIVATE;
if (!NEON_PRIVATE || !PHANTOM_PRIVATE) {
    throw new Error("Invalid WALlET KEYS PROVIDED");
}
const proxyUrl = `https://devnet.neonevm.org`;
const solanaUrl = `https://api.devnet.solana.com`;
const connection = new web3_js_1.Connection(solanaUrl, 'confirmed');
const provider = new providers_1.JsonRpcProvider(proxyUrl);
const neonWallet = new wallet_1.Wallet(NEON_PRIVATE, provider);
const solanaWallet = web3_js_1.Keypair.fromSecretKey((0, bs58_1.decode)(PHANTOM_PRIVATE));
const neonEvmProgram = new web3_js_1.PublicKey(`eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU`);
const chainId = parseInt(`0xe9ac0ce`);
const neonProxyRpcApi = new token_transfer_core_1.NeonProxyRpcApi(proxyUrl);
function transferSPLTokenToNeonEvm(token, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield (0, token_transfer_ethers_1.neonTransferMintTransactionEthers)(connection, neonProxyRpcApi, neonEvmProgram, solanaWallet.publicKey, neonWallet.address, neonWallet, token, amount, chainId);
        const signature = yield (0, utils_1.sendSolanaTransaction)(connection, transaction, [(0, utils_1.toSigner)(solanaWallet)]);
        console.log(signature);
    });
}
function transferERC20TokenToSolana(token, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const mint = new web3_js_1.PublicKey(token.address_spl);
        const associatedToken = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, solanaWallet.publicKey);
        try {
            yield (0, spl_token_1.getAccount)(connection, associatedToken);
        }
        catch (e) {
            console.log("e: -------", e);
            const solanaTransaction = (0, token_transfer_core_1.createAssociatedTokenAccountTransaction)(solanaWallet.publicKey, mint, associatedToken);
            const signature = yield (0, utils_1.sendSolanaTransaction)(connection, solanaTransaction, [(0, utils_1.toSigner)(solanaWallet)]);
            console.log(signature);
        }
        console.log("token---", associatedToken);
        const transaction = yield (0, token_transfer_ethers_1.createMintNeonTransactionEthers)(provider, neonWallet.address, associatedToken, token, amount);
        const hash = yield (0, utils_1.sendNeonTransactionEthers)(transaction, neonWallet);
        console.log(hash);
    });
}
