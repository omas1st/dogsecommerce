import fs from 'fs';
import path from 'path';
import { MongoClient, Db, Collection as MongoCollection } from 'mongodb';

// MongoDB Database Manager for Hound & Harbor
// Directly connects to MongoDB Atlas using MONGO_URI / MONGODB_URI.
// Stores all accounts, profiles, products, carts, orders, and tickets directly in MongoDB.

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface QueryFilter {
  [key: string]: any;
}

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnecting = false;
let isMongoConnected = false;

export async function connectMongo(): Promise<Db | null> {
  if (mongoDb && isMongoConnected) return mongoDb;
  if (isMongoConnecting) {
    // Wait briefly if connection is in progress
    await new Promise((res) => setTimeout(res, 500));
    if (mongoDb) return mongoDb;
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.log('[Database] No MONGO_URI specified, using in-memory store.');
    return null;
  }

  try {
    isMongoConnecting = true;
    console.log('[MongoDB] Connecting to MongoDB Atlas cluster...');
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    await mongoClient.connect();
    // Default to 'ecommerce' database or extract from URI
    mongoDb = mongoClient.db('ecommerce');
    isMongoConnected = true;
    isMongoConnecting = false;
    console.log('[MongoDB] Successfully connected to MongoDB Atlas (Database: ecommerce)');
    return mongoDb;
  } catch (error: any) {
    isMongoConnecting = false;
    isMongoConnected = false;
    console.error('[MongoDB] Connection failed:', error.message);
    return null;
  }
}

class Collection<T extends { id?: string; _id?: string; createdAt?: string; updatedAt?: string }> {
  private name: string;
  private memoryItems: T[] = [];
  private onMemorySave: () => void;

  constructor(name: string, memoryItems: T[], onMemorySave: () => void) {
    this.name = name;
    this.memoryItems = memoryItems;
    this.onMemorySave = onMemorySave;
  }

  private getMongoCol(): MongoCollection | null {
    if (mongoDb && isMongoConnected) {
      return mongoDb.collection(this.name);
    }
    return null;
  }

  private formatDoc(doc: any): T {
    if (!doc) return doc;
    const cloned = { ...doc };
    if (!cloned.id && cloned._id) {
      cloned.id = String(cloned._id);
    }
    return cloned as T;
  }

  public find(filter: QueryFilter = {}): any {
    let sortObj: Record<string, 1 | -1> | null = null;
    let skipCount = 0;
    let limitCount: number | null = null;

    const buildQuery = async (): Promise<T[]> => {
      const col = this.getMongoCol();
      if (col) {
        try {
          const mongoFilter = this.sanitizeFilter(filter);
          let cursor = col.find(mongoFilter);
          if (sortObj) cursor = cursor.sort(sortObj);
          if (skipCount > 0) cursor = cursor.skip(skipCount);
          if (limitCount !== null) cursor = cursor.limit(limitCount);
          const docs = await cursor.toArray();
          return docs.map((d) => this.formatDoc(d));
        } catch (err: any) {
          console.error(`[MongoDB] Query error in collection ${this.name}:`, err.message);
        }
      }

      // In-memory fallback
      let matched = this.applyFilter(this.memoryItems, filter);
      if (sortObj) {
        matched = [...matched].sort((a: any, b: any) => {
          for (const [key, dir] of Object.entries(sortObj!)) {
            const valA = a[key];
            const valB = b[key];
            if (valA === valB) continue;
            if (valA === undefined) return dir === 1 ? -1 : 1;
            if (valB === undefined) return dir === 1 ? 1 : -1;
            if (valA > valB) return dir === 1 ? 1 : -1;
            if (valA < valB) return dir === 1 ? -1 : 1;
          }
          return 0;
        });
      }
      if (skipCount > 0) matched = matched.slice(skipCount);
      if (limitCount !== null) matched = matched.slice(0, limitCount);
      return matched;
    };

    const sortFn = (sort: Record<string, 1 | -1>) => {
      sortObj = sort;
      return {
        skip: (sk: number) => {
          skipCount = sk;
          return {
            limit: async (lim: number) => {
              limitCount = lim;
              return buildQuery();
            },
            exec: () => buildQuery(),
            then: (resolve: (val: T[]) => void) => buildQuery().then(resolve),
          };
        },
        limit: async (lim: number) => {
          limitCount = lim;
          return buildQuery();
        },
        exec: () => buildQuery(),
        then: (resolve: (val: T[]) => void) => buildQuery().then(resolve),
      };
    };

    const skipFn = (sk: number) => {
      skipCount = sk;
      return {
        limit: async (lim: number) => {
          limitCount = lim;
          return buildQuery();
        },
        exec: () => buildQuery(),
        then: (resolve: (val: T[]) => void) => buildQuery().then(resolve),
      };
    };

    return {
      sort: sortFn,
      skip: skipFn,
      limit: async (lim: number) => {
        limitCount = lim;
        return buildQuery();
      },
      exec: () => buildQuery(),
      then: (resolve: (val: T[]) => void) => buildQuery().then(resolve),
    };
  }

  public async findOne(filter: QueryFilter = {}): Promise<T | null> {
    const col = this.getMongoCol();
    if (col) {
      try {
        const mongoFilter = this.sanitizeFilter(filter);
        const doc = await col.findOne(mongoFilter);
        return doc ? this.formatDoc(doc) : null;
      } catch (err: any) {
        console.error(`[MongoDB] findOne error in collection ${this.name}:`, err.message);
      }
    }

    const results = this.applyFilter(this.memoryItems, filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  public async findById(id: string): Promise<T | null> {
    return this.findOne({ $or: [{ id }, { _id: id }] });
  }

  public async create(doc: Partial<T>): Promise<T> {
    const now = new Date().toISOString();
    const id = (doc as any).id || (doc as any)._id || `${this.name.slice(0, 3)}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newItem: any = {
      ...doc,
      id,
      _id: id,
      createdAt: (doc as any).createdAt || now,
      updatedAt: now,
    };

    const col = this.getMongoCol();
    if (col) {
      try {
        await col.insertOne(newItem);
        return this.formatDoc(newItem);
      } catch (err: any) {
        console.error(`[MongoDB] Insert error in collection ${this.name}:`, err.message);
      }
    }

    this.memoryItems.push(newItem);
    this.onMemorySave();
    return { ...newItem };
  }

  public async findByIdAndUpdate(id: string, update: Partial<T>, options: { new?: boolean } = { new: true }): Promise<T | null> {
    const now = new Date().toISOString();
    const { _id, ...safeUpdate } = update as any;

    const col = this.getMongoCol();
    if (col) {
      try {
        const res = await col.findOneAndUpdate(
          { $or: [{ id }, { _id: id }] } as any,
          { $set: { ...safeUpdate, updatedAt: now } },
          { returnDocument: 'after' }
        );
        const doc = (res as any)?.value || res;
        return doc ? this.formatDoc(doc) : null;
      } catch (err: any) {
        console.error(`[MongoDB] findByIdAndUpdate error in collection ${this.name}:`, err.message);
      }
    }

    const idx = this.memoryItems.findIndex((item) => item.id === id || item._id === id);
    if (idx === -1) return null;

    const current = this.memoryItems[idx];
    const updated = {
      ...current,
      ...safeUpdate,
      id: current.id || current._id || id,
      _id: current._id || current.id || id,
      updatedAt: now,
    };
    this.memoryItems[idx] = updated;
    this.onMemorySave();
    return { ...updated };
  }

  public async updateOne(filter: QueryFilter, update: Partial<T>): Promise<{ modifiedCount: number }> {
    const now = new Date().toISOString();
    const { _id, ...safeUpdate } = update as any;

    const col = this.getMongoCol();
    if (col) {
      try {
        const mongoFilter = this.sanitizeFilter(filter);
        const res = await col.updateOne(mongoFilter, { $set: { ...safeUpdate, updatedAt: now } });
        return { modifiedCount: res.modifiedCount };
      } catch (err: any) {
        console.error(`[MongoDB] updateOne error in collection ${this.name}:`, err.message);
      }
    }

    const target = await this.findOne(filter);
    if (!target) return { modifiedCount: 0 };
    await this.findByIdAndUpdate(target.id || target._id!, update);
    return { modifiedCount: 1 };
  }

  public async deleteOne(filter: QueryFilter): Promise<{ deletedCount: number }> {
    const col = this.getMongoCol();
    if (col) {
      try {
        const mongoFilter = this.sanitizeFilter(filter);
        const res = await col.deleteOne(mongoFilter);
        return { deletedCount: res.deletedCount };
      } catch (err: any) {
        console.error(`[MongoDB] deleteOne error in collection ${this.name}:`, err.message);
      }
    }

    const idx = this.memoryItems.findIndex((item) => this.matchDoc(item, filter));
    if (idx === -1) return { deletedCount: 0 };
    this.memoryItems.splice(idx, 1);
    this.onMemorySave();
    return { deletedCount: 1 };
  }

  public async findByIdAndDelete(id: string): Promise<T | null> {
    const col = this.getMongoCol();
    if (col) {
      try {
        const res = await col.findOneAndDelete({ $or: [{ id }, { _id: id }] } as any);
        const doc = (res as any)?.value || res;
        return doc ? this.formatDoc(doc) : null;
      } catch (err: any) {
        console.error(`[MongoDB] findByIdAndDelete error in collection ${this.name}:`, err.message);
      }
    }

    const idx = this.memoryItems.findIndex((item) => item.id === id || item._id === id);
    if (idx === -1) return null;
    const removed = this.memoryItems.splice(idx, 1)[0];
    this.onMemorySave();
    return removed;
  }

  public async countDocuments(filter: QueryFilter = {}): Promise<number> {
    const col = this.getMongoCol();
    if (col) {
      try {
        const mongoFilter = this.sanitizeFilter(filter);
        return await col.countDocuments(mongoFilter);
      } catch (err: any) {
        console.error(`[MongoDB] countDocuments error in collection ${this.name}:`, err.message);
      }
    }

    return this.applyFilter(this.memoryItems, filter).length;
  }

  public getRawItems(): T[] {
    return this.memoryItems;
  }

  public setRawItems(items: T[]) {
    this.memoryItems = items;
    this.onMemorySave();
  }

  private sanitizeFilter(filter: QueryFilter): any {
    if (!filter || Object.keys(filter).length === 0) return {};
    const sanitized: any = {};
    for (const [key, value] of Object.entries(filter)) {
      if (key === 'id' && typeof value === 'string') {
        sanitized.$or = [{ id: value }, { _id: value }];
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private applyFilter(items: T[], filter: QueryFilter): T[] {
    if (!filter || Object.keys(filter).length === 0) return [...items];
    return items.filter((item) => this.matchDoc(item, filter));
  }

  private matchDoc(doc: any, filter: QueryFilter): boolean {
    for (const [key, condition] of Object.entries(filter)) {
      if (key === '$or' && Array.isArray(condition)) {
        const matchesAny = condition.some((cond) => this.matchDoc(doc, cond));
        if (!matchesAny) return false;
        continue;
      }
      if (key === '$and' && Array.isArray(condition)) {
        const matchesAll = condition.every((cond) => this.matchDoc(doc, cond));
        if (!matchesAll) return false;
        continue;
      }

      const val = this.getNestedValue(doc, key);

      if (condition !== null && typeof condition === 'object' && !(condition instanceof RegExp)) {
        if ('$eq' in condition && val !== condition.$eq) return false;
        if ('$ne' in condition && val === condition.$ne) return false;
        if ('$gt' in condition && !(val > condition.$gt)) return false;
        if ('$gte' in condition && !(val >= condition.$gte)) return false;
        if ('$lt' in condition && !(val < condition.$lt)) return false;
        if ('$lte' in condition && !(val <= condition.$lte)) return false;
        if ('$in' in condition && Array.isArray(condition.$in)) {
          if (Array.isArray(val)) {
            if (!condition.$in.some((item: any) => val.includes(item))) return false;
          } else if (!condition.$in.includes(val)) {
            return false;
          }
        }
        if ('$nin' in condition && Array.isArray(condition.$nin)) {
          if (condition.$nin.includes(val)) return false;
        }
        if ('$regex' in condition) {
          const flags = condition.$options || 'i';
          const reg = new RegExp(condition.$regex, flags);
          if (!reg.test(String(val || ''))) return false;
        }
      } else if (condition instanceof RegExp) {
        if (!condition.test(String(val || ''))) return false;
      } else {
        if (Array.isArray(val)) {
          if (!val.includes(condition)) return false;
        } else if (val !== condition) {
          return false;
        }
      }
    }
    return true;
  }

  private getNestedValue(obj: any, pathStr: string): any {
    if (!obj) return undefined;
    if (!pathStr.includes('.')) return obj[pathStr];
    return pathStr.split('.').reduce((prev, curr) => prev?.[curr], obj);
  }
}

class DatabaseManager {
  private data: Record<string, any[]> = {};
  private collections: Map<string, Collection<any>> = new Map();
  private saveDebounceTimer: any = null;

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      try {
        const content = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(content || '{}');
      } catch (err) {
        console.error('Error reading store.json, resetting to empty data', err);
        this.data = {};
      }
    } else {
      this.data = {};
    }
  }

  private persistImmediate() {
    // If MongoDB is connected, avoid writing local device files
    if (isMongoConnected) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write store.json', e);
    }
  }

  private scheduleSave() {
    if (isMongoConnected) return;
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.saveDebounceTimer = setTimeout(() => {
      this.persistImmediate();
    }, 150);
  }

  public collection<T extends { id?: string; _id?: string }>(name: string): Collection<T> {
    if (!this.collections.has(name)) {
      if (!this.data[name]) {
        this.data[name] = [];
      }
      const col = new Collection<T>(name, this.data[name], () => this.scheduleSave());
      this.collections.set(name, col);
    }
    return this.collections.get(name)!;
  }

  public flush() {
    if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
    this.persistImmediate();
  }

  public resetAll() {
    this.data = {};
    this.collections.clear();
    this.persistImmediate();
  }
}

export const db = new DatabaseManager();
