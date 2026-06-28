const { PrismaClient } = require('@prisma/client');
const { createClient } = require('redis');
const { MongoClient } = require('mongodb');

// 1. Prisma PostgreSQL client
const prisma = new PrismaClient();

// 2. Redis client with fallback
let redisClient = null;
let isRedisConnected = false;
const redisFallbackStore = {};

if (process.env.REDIS_URL) {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => {
      console.warn('Redis Client Warning:', err.message);
      isRedisConnected = false;
    });
    redisClient.connect()
      .then(() => {
        isRedisConnected = true;
        console.log('Redis connected successfully.');
      })
      .catch((err) => {
        console.warn('Redis connection failed, running with in-memory fallback.', err.message);
        isRedisConnected = false;
      });
  } catch (err) {
    console.warn('Could not initialize Redis client, using memory fallback:', err.message);
  }
}

const cache = {
  async get(key) {
    if (isRedisConnected && redisClient) {
      try {
        return await redisClient.get(key);
      } catch (err) {
        console.error('Redis GET error:', err);
      }
    }
    return redisFallbackStore[key] || null;
  },
  async set(key, value, expirySeconds = null) {
    if (isRedisConnected && redisClient) {
      try {
        if (expirySeconds) {
          await redisClient.set(key, value, { EX: expirySeconds });
        } else {
          await redisClient.set(key, value);
        }
        return;
      } catch (err) {
        console.error('Redis SET error:', err);
      }
    }
    redisFallbackStore[key] = value;
    // Simple mock expiry
    if (expirySeconds) {
      setTimeout(() => {
        delete redisFallbackStore[key];
      }, expirySeconds * 1000);
    }
  },
  async del(key) {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
        return;
      } catch (err) {
        console.error('Redis DEL error:', err);
      }
    }
    delete redisFallbackStore[key];
  }
};

// 3. MongoDB client with fallback
let mongoDb = null;
let isMongoConnected = false;
const mongoFallbackStore = {
  chat_sessions: [],
  ai_logs: [],
  product_history: []
};

if (process.env.MONGO_URL) {
  try {
    const mongoClient = new MongoClient(process.env.MONGO_URL);
    mongoClient.connect()
      .then(() => {
        mongoDb = mongoClient.db();
        isMongoConnected = true;
        console.log('MongoDB connected successfully.');
      })
      .catch((err) => {
        console.warn('MongoDB connection failed, running with in-memory fallback.', err.message);
        isMongoConnected = false;
      });
  } catch (err) {
    console.warn('Could not initialize MongoDB client, using memory fallback:', err.message);
  }
}

const mongo = {
  async insertOne(collectionName, document) {
    const docWithTime = { ...document, createdAt: new Date() };
    if (isMongoConnected && mongoDb) {
      try {
        const result = await mongoDb.collection(collectionName).insertOne(docWithTime);
        return result;
      } catch (err) {
        console.error(`MongoDB insertOne error in ${collectionName}:`, err);
      }
    }
    if (!mongoFallbackStore[collectionName]) {
      mongoFallbackStore[collectionName] = [];
    }
    mongoFallbackStore[collectionName].push(docWithTime);
    return { insertedId: Math.random().toString(36).substring(7) };
  },
  async findMany(collectionName, query = {}, limit = 50) {
    if (isMongoConnected && mongoDb) {
      try {
        return await mongoDb.collection(collectionName).find(query).limit(limit).toArray();
      } catch (err) {
        console.error(`MongoDB findMany error in ${collectionName}:`, err);
      }
    }
    const items = mongoFallbackStore[collectionName] || [];
    // Basic mock filter by key-value match
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    }).slice(0, limit);
  },
  async updateOne(collectionName, query = {}, update = {}) {
    if (isMongoConnected && mongoDb) {
      try {
        return await mongoDb.collection(collectionName).updateOne(query, update, { upsert: true });
      } catch (err) {
        console.error(`MongoDB updateOne error in ${collectionName}:`, err);
      }
    }
    const items = mongoFallbackStore[collectionName] || [];
    let item = items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });

    const setFields = update.$set || {};
    const pushFields = update.$push || {};

    if (!item) {
      item = { ...query, ...setFields };
      items.push(item);
    } else {
      Object.assign(item, setFields);
    }

    for (const key in pushFields) {
      if (!item[key]) item[key] = [];
      if (Array.isArray(item[key])) {
        if (pushFields[key].$each) {
          item[key].push(...pushFields[key].$each);
        } else {
          item[key].push(pushFields[key]);
        }
      }
    }
    return { modifiedCount: 1, upsertedCount: item ? 0 : 1 };
  }
};

module.exports = {
  prisma,
  cache,
  mongo
};
