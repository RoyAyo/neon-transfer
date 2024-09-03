const neonNeonEvmUrl = `https://devnet.neonevm.org`;
const solNeonEvmUrl = `https://devnet.neonevm.org/solana/sol`;
const solanaUrl = `https://api.devnet.solana.com`;

const neonProxyApi = new NeonProxyRpcApi(neonNeonEvmUrl);
const solProxyApi = new NeonProxyRpcApi(solNeonEvmUrl);
// ...
const [neonNativeToken, solNativeToken] = await neonProxyApi.nativeTokenList();

console.log(neonNativeToken)
console.log(solNativeToken)

// get native tokens for chain networks
// const neonProxyStatus = await neonProxyApi.evmParams(); // get evm params config
// const solProxyStatus = await solProxyApi.evmParams();

// // for NEON token native network
// const neonChainId = Number(neonNativeToken.tokenChainId);
// const neonTokenMint = new PublicKey(neonNativeToken.tokenMint);
// const neonEvmProgram = new PublicKey(neonProxyStatus.neonEvmProgramId);

// // for SOL token native network
// const solChainId = Number(solNativeToken.tokenChainId);
// const solTokenMint = new PublicKey(solNativeToken.tokenMint);
// const solEvmProgram = new PublicKey(solProxyStatus.neonEvmProgramId);