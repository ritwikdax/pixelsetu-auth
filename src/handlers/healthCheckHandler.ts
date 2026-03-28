import { Request, Response } from "express";
import { getRedisClient } from "../redis.js";
import { getDb } from "../database.js";

export async function healthCheckHandler(req: Request, res: Response) {
      try {
        const db = await getDb();
        const redisClient = await getRedisClient();
        const response = await db.command({ ping: 1 });
        const redisResponse = redisClient.ping();
        res.status(200).json({ status: "ok", mongo: response, redis: redisResponse });

    } catch (err: any) {
        res.status(500).json({ reeor: true, message: "Healthcheck failed", details: JSON.stringify(err) });
    }
}       