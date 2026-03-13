
import { Email } from "../notifications/email.notification.js";
import { logger } from "../utils/logger.js";
import { APP_EVENTS, appEventEmitter } from "./event.js";
import { LoginFailureEvent, OrgInviteEvent } from "./event.type.js";

export class Listener {
    async listenLoginFailure() {
        appEventEmitter.onEvent<LoginFailureEvent>(APP_EVENTS.LOGIN_FAILED, async (data) => {
            try {
                const mail = new Email();
                await mail
                    .subject(`Login Failure Alert: ${data.merchant} at ${data.time}`)
                    .template("pixelsetu_login_failure")
                    .templateData(data).send();

                logger.error('💖Login failed for user:', data);
            } catch (err: any) {
                logger.error("❌ Error sending login failure alert email:", {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                    eventData: data,
                });
            }

        })
    }

    async listenOrgInvite() {
        logger.info("Setting up listener for organization invites...");
        appEventEmitter.onEvent<OrgInviteEvent>(APP_EVENTS.SEND_ORG_INVITE, async (data) => {
            try {
                const mail = new Email();
                await mail
                    .to(data.to)
                    .subject(`Organization Invite From: ${data.sender}`)
                    .template("pixelsetu_org_invitation")
                    .templateData({ cta: data.cta, name: data.name, namespace: data.namespace, sender: data.sender }).send();

                logger.info('Organization invite sent:', data);
            } catch (err: any) {
                logger.error("❌ Error sending organization invite email:", {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                    eventData: data,
                });
            }

        })
    }
}