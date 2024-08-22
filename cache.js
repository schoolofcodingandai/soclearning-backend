// Redis
const Redis = require("ioredis");

/**
 * @description Connects to the cache
 */
const client = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    // username: process.env.REDIS_USERNAME
});
console.log("Connected to cache");

/**
 * @description Pings Redis
 */
const pingRedis = async () => {
    // Test the connection
    await client.ping((err, result) => {
        if (err) {
            console.error("Failed to connect to Redis:", err);
        } else {
            console.log("Connected to Redis:", result);
        }
    });
}

/**
 * @description Gets data from cache using
 * provided key
 * @param {String} key
 * @returns {Object}
 */
const getData = async (key) => {
    let user;

    await client.get(key, (error, reply) => {
        if (error) throw new Error(`error fetching cache: ${error}`);
        user = JSON.parse(reply);
    });

    return user;
}

/**
 * @description Sets data to cache using
 * provided key
 * @param {String} keys
 * @param {Object} data
 * @returns {Boolean}
 */
const setData = async (key, data) => {
    const dataString = JSON.stringify(data);

    await client.set(key, dataString, (error, reply) => {
        if (error) throw new Error(`error setting cache: ${error}`);
        console.log(reply);
    });

    return true;
}

/**
 * @description Deletes data from cache using
 * provided key
 * @param {String} key
 * @returns
 */
const deleteData = async (key) => {
    await client.del(key, (error, reply) => {
        if (error) throw new Error(`error deleting cache: ${error}`);
    });

    return true;
}

module.exports = {
    pingRedis,
    getData,
    setData,
    deleteData
};