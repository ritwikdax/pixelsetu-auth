
import { Email } from "../notifications/email.notification.js";
import { logger } from "../utils/logger.js";
import { APP_EVENTS, appEventEmitter } from "./event.js";
import { LoginFailureEvent } from "./event.type.js";

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
}