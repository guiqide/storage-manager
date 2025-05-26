import { StorageEngine } from '../types';

/**
 * IndexedDB 存储引擎配置选项
 */
export interface IndexedDBConfig {
  /** 数据库名称 */
  dbName?: string;
  /** 存储对象名称 */
  storeName?: string;
  /** 数据库版本 */
  version?: number;
}

/**
 * IndexedDB 存储引擎类
 * 使用 IndexedDB 作为存储后端，支持大量结构化数据存储
 */
export class IndexedDBStorageEngine implements StorageEngine {
  readonly isAsync = true;
  private db: IDBDatabase | null = null;
  private dbName: string;
  private storeName: string;
  private version: number;
  private initPromise: Promise<void> | null = null;

  constructor(config: IndexedDBConfig = {}) {
    this.dbName = config.dbName || 'storage-manager';
    this.storeName = config.storeName || 'key-value-store';
    this.version = config.version || 1;
    this.initDB();
  }

  private initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db) {
      throw new Error('IndexedDB 未初始化');
    }
    return this.db;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          console.error(`IndexedDB getItem error for key ${key}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`IndexedDB getItem error for key ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`IndexedDB setItem error for key ${key}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`IndexedDB setItem error for key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error(`IndexedDB removeItem error for key ${key}:`, request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`IndexedDB removeItem error for key ${key}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          resolve();
        };

        request.onerror = () => {
          console.error('IndexedDB clear error:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }
} 