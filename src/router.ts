import { Router } from "express";
import { logger } from "./utils/logger.js";
import { GoogleAuth } from "./auth/googleAuth.js";
import loginHandler from "./handlers/loginHandler.js";
import setSessionCookieHandler from "./handlers/setSessionCookie.handler.js";
import { getDb } from "./database.js";

const router = Router();

router.get("/health", async (req, res) => {
    const db = await getDb();
    const response = await db.command({ ping: 1 });
    res.status(200).json({ status: "ok" , mongo: response });
});


router.get('/auth/callback/google', loginHandler);

router.post('/auth/set-cookie', setSessionCookieHandler);


export default router;