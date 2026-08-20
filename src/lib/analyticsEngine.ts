import { MongoClient, Db } from 'mongodb';
import crypto from 'crypto';

let client: MongoClient | null = null;
let db: Db | null = null;
let eventQueue: any[] = [];
const BATCH_SIZE = 500;

// Daily salt for cookieless tracking (rotates automatically based on current UTC date)
export function getDailySalt() {
  return new Date().toISOString().split('T')[0];
}

export function generateVisitorId(ip: string, userAgent: string, domain: string) {
  const salt = getDailySalt();
  return crypto.createHash('sha256').update(`${ip}-${userAgent}-${domain}-${salt}`).digest('hex');
}

export async function initAnalyticsDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not provided. Analytics telemetry will run in mock/memory-only mode.');
    return;
  }
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('catalyst_analytics');
    
    // Ensure time-series collection exists
    const collections = await db.listCollections({ name: 'events' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('events', {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'metadata',
          granularity: 'seconds'
        }
      });
      console.log('Created MongoDB Time-Series collection "events".');
    }
    console.log('Connected to MongoDB Analytics DB (Time-Series Enabled).');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}

export function queueEvent(event: any) {
  eventQueue.push({
    timestamp: new Date(),
    metadata: {
      domain: event.domain,
      browser: event.browser,
      os: event.os,
      device: event.device,
      country: event.country,
      city: event.city,
      source: event.source,
      visitor_id: event.visitor_id,
      session_id: event.session_id
    },
    name: event.name || 'pageview',
    url: event.url,
    pathname: event.pathname,
    referrer: event.referrer
  });

  if (eventQueue.length >= BATCH_SIZE) {
    flushQueue();
  }
}

async function flushQueue() {
  if (eventQueue.length === 0) return;
  
  const batch = [...eventQueue];
  eventQueue = []; // Clear queue immediately to accept new events without blocking
  
  if (!db) {
    console.log(`[Mock Flush] Dropped ${batch.length} telemetry events (No MONGODB_URI configured).`);
    return;
  }
  
  try {
    await db.collection('events').insertMany(batch);
    console.log(`[Telemetry] Flushed ${batch.length} events to MongoDB Time-Series Collection.`);
  } catch (err) {
    console.error('Failed to flush analytics events:', err);
  }
}

// Flush queue every 3 seconds to ensure data isn't lost on idle and to prevent high-frequency write spam
setInterval(flushQueue, 3000);
