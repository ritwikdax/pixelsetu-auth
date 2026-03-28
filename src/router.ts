import { Router } from "express";
import getMeHandler from "./handlers/getMeHandler.js";
import logoutHandler from "./handlers/logoutHandler.js";
import { validateSchema } from "./mw/schemaValidator.middleware.js";
import { inviteUserToOrgSchema, removeOrgMemberSchema, sessionLogoutSchema, switchActiveOrgSchema } from "./schema/schema.js";
import inviteUserToOrgHandler from "./handlers/inviteUserToOrgHandler.js";
import removeAppHandler from "./handlers/removeAppHandler.js";
import addAppHandler from "./handlers/addAppHandler.js";
import getAllSessionsHandler from "./handlers/getAllSessionsHandler.js";
import getAllMembersOfOrgHandler from "./handlers/getAllMembersOfOrgHandler.js";
import getMyOrgHandler from "./handlers/getMyOrgHandler.js";
import switchActiveOrganizationHandler from "./handlers/switchActiveOrgHandler.js";
import { wrap } from "./utils/wrapper.js";
import leaveOrgHandler from "./handlers/leaveOrgHandler.js";
import removeOrgMemberHandler from "./handlers/removeOrgMemberHandler.js";
import { rbacMiddleware } from "./mw/rbac.middleware.js";


const router = Router();


//Switch org context is allowed for all logged in users, as 
// they might have multiple orgs with different roles and permissions. 
// The RBAC middleware will handle the permission checks for specific actions 
// within each org context.
router.patch('/me/switch-org-context', validateSchema(switchActiveOrgSchema), wrap(switchActiveOrganizationHandler));

//Use RBAC middleware for all routes
router.use(wrap(rbacMiddleware));

//User account level operations
router.get('/me', wrap(getMeHandler));
router.get('/me/sessions', wrap(getAllSessionsHandler));
router.post('/me/logout', validateSchema(sessionLogoutSchema), wrap(logoutHandler));
router.delete('/me/leave-org', wrap(leaveOrgHandler));
router.patch('/me/app/:appId', wrap(addAppHandler));
router.delete('/me/app/:appId', wrap(removeAppHandler));



router.get('/org', wrap(getMyOrgHandler));
router.get('/org/members', wrap(getAllMembersOfOrgHandler));
router.put('/org/member', validateSchema(removeOrgMemberSchema), wrap(removeOrgMemberHandler));
router.post('/org/invite', validateSchema(inviteUserToOrgSchema), wrap(inviteUserToOrgHandler));


export default router;