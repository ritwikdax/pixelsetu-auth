import FormData from "form-data";
import emailClient from "./email.client.js";
import { logger } from "../utils/logger.js";

type EmailTemplate = 'pixelsetu_login_failure' | 'onboard_pixelsetu' | 'pixelsetu_org_invitation';

interface EmailData {
    subject: string;
    from?: string;
    to?: string | string[];
    template?: EmailTemplate;
    templateData?: Record<string, any>;
}


/**
 * Utility class for constructing and sending emails using a fluent interface.
 * This class is designed to be used with the MailNotification service, which will handle the actual sending of emails.
 * It provides a convenient way to build email data and ensures that required fields are set before sending.
 */
export class Email {
    private readonly FROM = "Pixelsetu <noreply@pixelsetu.com>";
    private readonly TO = ['Ritwik Das <ritwikdax@gmail.com>', 'Prantik Das <dasprantik76@gmail.com>'];
    private emailData: Partial<EmailData> = {};

    from(from: string): this {
        this.emailData.from = from;
        return this;
    }

    to(to: string | string[]): this {
        this.emailData.to = to;
        return this;
    }

    subject(subject: string): this {
        this.emailData.subject = subject;
        return this;
    }

    template(template: EmailTemplate): this {
        this.emailData.template = template;
        return this;
    }

    templateData(templateData: Record<string, any>): this {
        this.emailData.templateData = templateData;
        return this;
    }

    async send() {
        this.validate();
        // Create form data for Mailgun API (matching curl request format)
        const formData = new FormData();
        formData.append("from", this.emailData.from!);
        formData.append("to", Array.isArray(this.emailData.to) ? this.emailData.to.join(", ") : this.emailData.to!);
        formData.append("subject", this.emailData.subject!);
        if (this.emailData.template) {
            formData.append("template", this.emailData.template);
        }
        if (this.emailData.templateData) {
            formData.append("h:X-Mailgun-Variables", JSON.stringify(this.emailData.templateData));
        }
        try {
            const response = await emailClient.post("/messages", formData, {
                headers: formData.getHeaders(),
            });
            logger.log(`Email sent successfully to ${this.emailData.to}`, response.data);
            return response.data;
        } catch (error: any) {
            logger.error(`Failed to send email to ${this.emailData.to}:`, error.response?.data || error.message);
            throw error;
        }
    }

    private validate(): void {
        if (!this.emailData.from) {
            this.emailData.from = this.FROM;
        }
        if (!this.emailData.to) {
            this.emailData.to = this.TO;
        }
        if (!this.emailData.subject) {
            throw new Error("Subject is required");
        }
        if(this.emailData.template && !this.emailData.templateData) {
            throw new Error("Template data is required when using a template");
        }
    }
}