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

export async function getDbClient(){
  return await client.connect();
}
