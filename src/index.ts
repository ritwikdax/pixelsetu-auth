import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger.js";
import { Listener } from "./event/listener.js";
import router from "./router.js";
import { getDb } from "./database.js";
import { getRedisClient } from "./redis.js";
import { authGuardMiddleware } from "./mw/authguard.middileware.js";
import googleLoginHandler from "./handlers/googleLoginHandler.js";
import setSessionCookieHandler from "./handlers/setSessionCookie.handler.js";
import acceptInviteHandler from "./handlers/acceptInviteHandler.js";
import { healthCheckHandler } from "./handlers/healthCheckHandler.js";
import { globalErrorMiddleware } from "./mw/glabalError.middleware.js";
import { contextMiddleware } from "./mw/context.middleware.js";
import { wrap } from "./utils/wrapper.js";
import helmet from "helmet";
import { COLLECTIONS } from "./const.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://pixelsetu.com", "https://www.pixelsetu.com"]
      : ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Use context middleware
app.use(wrap(contextMiddleware));


//==========PUBLIC ROUTES (NO AUTH) ==========
//Todo - add a basic cred login endpoint

app.get("/api/health", healthCheckHandler);
app.get('/api/auth/callback/google', wrap(googleLoginHandler));
app.post('/api/auth/set-cookie', wrap(setSessionCookieHandler));
app.get('/api/accept-invite', wrap(acceptInviteHandler));


//==========AUTHENTICATED ROUTES (AUTH REQUIRED) ==========
app.use("/api", wrap(authGuardMiddleware), router);

//Use Global error handler middleware (MUST BE LAST)
app.use(globalErrorMiddleware);


// Handle unhandled promise rejections
process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
  logger.error("❌ Unhandled Promise Rejection:", {
    reason,
    message: reason?.message,
    stack: reason?.stack,
    promise,
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("❌ Uncaught Exception:", {
    error: err,
    message: err?.message,
    stack: err?.stack,
  });
  // Exit the process after logging
  process.exit(1);
});

async function createDbIndexes() {
  for (const collectionName of Object.values(COLLECTIONS)) {
    const db = await getDb();
    const collection = db.collection(collectionName);
    await collection.createIndexes([
      { key: { id: 1 }, unique: true },
      { key: { email: 1 } }
    ]);
    logger.info(`✅ Indexes created for collection: ${collectionName}`);
  }
}

async function preStartSetup() {

  //Prestart
  const listener = new Listener();
  listener.listenOrgInvite();
  listener.listenWelcomeUserEvent();

  await getRedisClient();
  logger.info("✅ Redis connection successful");
  await getDb();
  logger.info("✅ Database connection successful, starting server...");

  //Create necessary indexes in the database
  await createDbIndexes();


}


async function startServer() {
  try {
    await preStartSetup();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err: any) {
    console.log(err);
    logger.error("❌ Failed to establish database connection:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
    });
    process.exit(1); // Exit if we can't connect to the database
  }
}

startServer();