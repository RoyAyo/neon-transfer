export enum TOKENS {
    USDT = "USDT",
    WNEON = "WNEON"
}

export interface IDEX {
    name: string,
    router: string,
    abi: string[],
};

export interface ITokens {
    name: TOKENS,
    address: string,
    decimal: number,
}