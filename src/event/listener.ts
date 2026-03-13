
import { Email } from "../notifications/email.notification.js";
import { logger } from "../utils/logger.js";
import { APP_EVENTS, appEventEmitter } from "./event.js";
import { LoginFailureEvent, OrgInviteEvent, OrgInviteMailPayload, WelcomeEmailEvent, WelcomeMailPayload } from "./event.type.js";

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
                const templatePayload : OrgInviteMailPayload = {
                    ctaUrl: data.ctaUrl,
                    orgName: data.orgName,
                    orgRole: data.orgRole
                }
                await mail
                    .to(data.to)
                    .subject(`Organization Invite - ${data.orgName}`)
                    .template("pixelsetu_org_invitation")
                    .templateData(templatePayload).send();
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

    async listenWelcomeUserEvent(){
        logger.info("Setting up listener for welcome email...");
        appEventEmitter.onEvent<WelcomeEmailEvent>(APP_EVENTS.SEND_WELCOME_EMAIL, async (data) => {
            try {
                const mail = new Email();
                const templatePayload : WelcomeMailPayload = {
                    name: data.name,
                    ctaUrl: data.ctaUrl
                }
                await mail
                    .to(data.email)
                    .subject(`Welcome to PixelSetu - ${data.name}`)
                    .template("pixelsetu_welcome")
                    .templateData(templatePayload).send();
                logger.info('Welcome email sent:', data);


            } catch (err: any) {
                logger.error("❌ Error sending welcome email:", {
                    error: err,
                    message: err?.message,
                    stack: err?.stack,
                    eventData: data,
                });
            }

        })
    }


}