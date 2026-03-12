// import { MongoClient, Db, ServerApiVersion } from "mongodb";
// import { env, ENV_VARIABLES } from "./utils/env.js";
// import { logger } from "./utils/logger.js";


// const MONGO_USERNAME = env(ENV_VARIABLES.MONGO_USERNAME);
// const MONGO_PASSWORD = env(ENV_VARIABLES.MONGO_PASSWORD);
// const MONGO_DB_NAME = env(ENV_VARIABLES.MONGO_DB_NAME);

// const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.9bqgxk7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// let db: Db;
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
//   maxPoolSize: 10,
//   minPoolSize: 2,
//   maxIdleTimeMS: 300000, // 5 minutes
//   socketTimeoutMS: 45000,
//   connectTimeoutMS: 30000,
//   retryWrites: true,
//   retryReads: true,
// });

// // Monitor connection events
// client.on("connectionPoolClosed", () => {
//   logger.warn("⚠️ MongoDB connection pool closed");
//   db = undefined as any;
// });

// client.on("connectionPoolCreated", () => {
//   logger.info("✅ MongoDB connection pool created");
// });

// client.on("connectionPoolCleared", () => {
//   logger.warn("⚠️ MongoDB connection pool cleared");
// });

// async function ensureConnection() {
//   if (!db) {
//     try {
//       logger.warn("⚠️ DB not connected, attempting to reconnect...");
//       await client.connect();
//       logger.info(`✅ Connected Mongo Client`);
//       db = client.db(MONGO_DB_NAME);
//     } catch (err: any) {
//       logger.error("❌ MongoDB connection error:", {
//         error: err,
//         message: err?.message,
//         stack: err?.stack,
//         uri: uri.replace(MONGO_PASSWORD, "***REDACTED***"),
//       });
//       throw err;
//     }
//   }
//   return db;
// }

// // Initial connection
// client
//   .connect()
//   .then(() => {
//     logger.info(`✅ Connected Mongo Client`);
//     db = client.db(MONGO_DB_NAME);
//   })
//   .catch((err) => {
//     logger.error("❌ MongoDB initial connection error:", {
//       error: err,
//       message: err?.message,
//       stack: err?.stack,
//       uri: uri.replace(MONGO_PASSWORD, "***REDACTED***"),
//     });
//   });

// async function getDb() {
//   const mongoDb = await ensureConnection(); // Ensure connection before accessing client
//   return mongoDb;
// }

// export { getDb };

import { MongoClient, Db, ServerApiVersion } from "mongodb";
import { env, ENV_VARIABLES } from "./utils/env.js";
import { logger } from "./utils/logger.js";

const MONGO_USERNAME = env(ENV_VARIABLES.MONGO_USERNAME);
const MONGO_PASSWORD = env(ENV_VARIABLES.MONGO_PASSWORD);
const MONGO_DB_NAME = env(ENV_VARIABLES.MONGO_DB_NAME);

const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.qv6aqyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 20,
  minPoolSize: 2,
  maxIdleTimeMS: 60000, // 1 minute
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
});

let db: Db | null = null;
let connectPromise: Promise<Db> | null = null;

async function connectMongo(): Promise<Db> {
  if (db) return db;

  if (!connectPromise) {
    logger.info("🔌 Connecting to MongoDB...");

    connectPromise = client.connect().then((client) => {
      db = client.db(MONGO_DB_NAME);

      logger.info("✅ MongoDB connected");

      return db;
    }).catch((err) => {
      connectPromise = null;
      logger.error("❌ MongoDB connection failed", err);
      process.exit(1); // Exit if we can't connect to the database
    });
  }

  return connectPromise;
}

export async function getDb(): Promise<Db> {
  return await connectMongo();
}