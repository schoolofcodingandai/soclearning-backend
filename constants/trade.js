/**
 * @description Different trade types
 */
const TRADE_TYPE = {
    BUY: "buy",
    SELL: "sell"
};

/**
 * @description Different types of coins
 */
const TRADE_COINS = {
    BTC: "bitcoin",
    META: "metaland",
    ETH: "ethereum"
};

/**
 * @description Types of status
 */
const TRADE_STATUS = {
    CREATED: 0,
    COMPLETED: 1
};

module.exports = {
    TRADE_TYPE,
    TRADE_COINS,
    TRADE_STATUS
}