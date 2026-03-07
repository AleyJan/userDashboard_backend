const { createClient } = require("redis");

const redisClient = createClient({
  username: "default",
  password: "FvxdwhSxWBkH09uJxmR749MJZTe4Qnn1",
  socket: {
    host: "redis-16296.c90.us-east-1-3.ec2.cloud.redislabs.com",
    port: 16296,
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = { redisClient, connectRedis };
