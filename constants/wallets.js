/**
 * @description Wallet environments
 */
const WALLET_ENV = {
    ETH: {
        url: process.env.HEX_ETH_API_URL,
        token: process.env.HEX_WALLET_TOKEN
    }
};

module.exports = {
    WALLET_ENV
}