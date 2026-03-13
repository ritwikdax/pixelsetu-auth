import { Router } from "express";
import { getDb } from "./database.js";
import getMeHandler from "./handlers/getMeHandler.js";
import logoutHandler from "./handlers/logoutHandler.js";
import { validateSchema } from "./mw/schemaValidator.middleware.js";
import { inviteUserToOrgSchema } from "./schema/schema.js";
import inviteUserToOrgHandler from "./handlers/inviteUserToOrgHandler.js";
import removeAppHandler from "./handlers/removeAppHandler.js";
import addAppHandler from "./handlers/addAppHandler.js";

const router = Router();

router.get("/health", async (req, res) => {
    const db = await getDb();
    const response = await db.command({ ping: 1 });
    res.status(200).json({ status: "ok" , mongo: response });
});


router.get('/me', getMeHandler);
router.post('/logout', logoutHandler);
router.post('/invite', validateSchema(inviteUserToOrgSchema), inviteUserToOrgHandler);
router.put('/add-application/:appId', addAppHandler);
router.delete('/remove-application/:appId', removeAppHandler);



export default router;