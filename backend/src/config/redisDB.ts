import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis({
    lazyConnect: true,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
});
redis.on("connect", ()=>{console.log("Connected to Redis server");});
redis.on("error", (err)=>{console.error("Redis connection error:", err);});

export default redis;