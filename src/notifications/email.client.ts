import axios from "axios";
import { env } from "../utils/env.js";

// Mailgun API configuration
const MAILGUN_DOMAIN = env("MAILGUN_DOMAIN") || "pixelsetu.com";
const MAILGUN_BASE_URL = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}`;

// Create axios client configured for Mailgun API
const emailClient = axios.create({
    baseURL: MAILGUN_BASE_URL,
    auth: {
        username: "api",
        password: env("MAILGUN_API_KEY"),
    },
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

export default emailClient;