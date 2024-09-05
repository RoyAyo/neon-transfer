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
exports.transferNeonToSolana = transferNeonToSolana;
exports.transferSolanaToNeon = transferSolanaToNeon;
const web3_js_1 = require("@solana/web3.js");
const providers_1 = require("@ethersproject/providers");
const wallet_1 = require("@ethersproject/wallet");
const token_transfer_core_1 = require("@neonevm/token-transfer-core");
const token_transfer_ethers_1 = require("@neonevm/token-transfer-ethers");
const bs58_1 = require("bs58");
const utils_1 = require("./utils");
require('dotenv').config({});
const NEON_PRIVATE = process.env.NEON_PRIVATE;
const PHANTOM_PRIVATE = process.env.PHANTOM_PRIVATE;
const proxyUrl = `https://devnet.neonevm.org`;
const solanaUrl = `https://api.devnet.solana.com`;
const connection = new web3_js_1.Connection(solanaUrl, 'confirmed');
const provider = new providers_1.JsonRpcProvider(proxyUrl);
const neonWallet = new wallet_1.Wallet(NEON_PRIVATE, provider);
const solanaWallet = web3_js_1.Keypair.fromSecretKey((0, bs58_1.decode)(PHANTOM_PRIVATE));
const neonEvmProgram = new web3_js_1.PublicKey(`eeLSJgWzzxrqKv1UxtRVVH8FX3qCQWUs9QuAjJpETGU`);
const neonTokenMint = new web3_js_1.PublicKey(`89dre8rZjLNft7HoupGiyxu3MNftR577ZYu8bHe2kK7g`);
const chainId = parseInt(`0xe9ac0ce`);
const neonToken = {
    chainId,
    address_spl: '89dre8rZjLNft7HoupGiyxu3MNftR577ZYu8bHe2kK7g',
    address: '',
    decimals: token_transfer_core_1.NEON_TOKEN_MINT_DECIMALS,
    name: 'Neon',
    symbol: 'NEON',
    logoURI: 'https://raw.githubusercontent.com/neonlabsorg/token-list/main/neon_token_md.png'
};
function transferNeonToSolana(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield (0, token_transfer_ethers_1.neonNeonTransactionEthers)(provider, neonWallet.address, token_transfer_core_1.NEON_TRANSFER_CONTRACT_DEVNET, solanaWallet.publicKey, amount);
        const hash = yield (0, utils_1.sendNeonTransactionEthers)(transaction, neonWallet);
        console.log(hash);
        // keep track of the hash just to ensure all your transaction hashes
    });
}
function transferSolanaToNeon(amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield (0, token_transfer_core_1.solanaNEONTransferTransaction)(solanaWallet.publicKey, neonWallet.address, neonEvmProgram, neonTokenMint, neonToken, amount, chainId);
        transaction.recentBlockhash = (yield connection.getLatestBlockhash('finalized')).blockhash;
        const signature = yield (0, utils_1.sendSolanaTransaction)(connection, transaction, [(0, utils_1.toSigner)(solanaWallet)]);
        console.log(signature);
    });
}
