import { Router } from "express";
import loginHandler from "./handlers/loginHandler.js";
import setSessionCookieHandler from "./handlers/setSessionCookie.handler.js";
import { getDb } from "./database.js";
import getMeHandler from "./handlers/getMeHandler.js";
import logoutHandler from "./handlers/logoutHandler.js";

const router = Router();

router.get("/health", async (req, res) => {
    const db = await getDb();
    const response = await db.command({ ping: 1 });
    res.status(200).json({ status: "ok" , mongo: response });
});




router.get('/me', getMeHandler);
router.post('/logout', logoutHandler);



export default router;