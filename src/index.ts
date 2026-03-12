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
import logoutHandler from "./handlers/logoutHandler.js";
import loginHandler from "./handlers/loginHandler.js";
import setSessionCookieHandler from "./handlers/setSessionCookie.handler.js";

const app = express();
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

app.get('/api/auth/callback/google', loginHandler);
app.post('/api/auth/set-cookie', setSessionCookieHandler);



//Auth Service routes
app.use("/api", authGuardMiddleware, router);

// Global error handler middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    logger.error("❌ Unhandled error in Express app:", {
      error: err,
      message: err?.message,
      stack: err?.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    res.status(err.status || 500).json({
      error: true,
      message: err.message || "Internal Server Error",
    });
  }
);


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


async function preStartSetup() {

  //Prestart
  // const listener = new Listener();
  // listener.listenLoginFailure();

  await getRedisClient();
  logger.info("✅ Redis connection successful");
  await getDb();
  logger.info("✅ Database connection successful, starting server...");

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