import { ErrorType, StorageEngine, handleStorageError } from '../types';

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
  private dbName: string | undefined;
  private storeName: string | undefined;
  private version: number;
  private initPromise: Promise<void> | null = null;

  constructor(config: IndexedDBConfig = {}) {
    this.dbName = config.dbName;
    this.storeName = config.storeName;
    this.version = config.version || 1;
    this.initDB();
  }

  private initDB(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName!, this.version);

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
        if (!db.objectStoreNames.contains(this.storeName!)) {
          db.createObjectStore(this.storeName!);
        }
      };
    });

    return this.initPromise;
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    if (!this.db || !this.dbName || !this.storeName) {
      throw new Error('IndexedDB 未初始化或配置无效');
    }
    return this.db;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName!, 'readonly');
        const store = transaction.objectStore(this.storeName!);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          handleStorageError(request.error, ErrorType.Error);
          reject(request.error);
        };
      });
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName!, 'readwrite');
        const store = transaction.objectStore(this.storeName!);
        const request = store.put(value, key);

        request.onsuccess = () => {
          // 等待事务完成
          transaction.oncomplete = () => {
            resolve();
          };
        };

        request.onerror = () => {
          handleStorageError(request.error, ErrorType.Error);
          reject(request.error);
        };

        transaction.onerror = () => {
          handleStorageError(transaction.error, ErrorType.Error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName!, 'readwrite');
        const store = transaction.objectStore(this.storeName!);
        const request = store.delete(key);

        request.onsuccess = () => {
          // 等待事务完成
          transaction.oncomplete = () => {
            resolve();
          };
        };

        request.onerror = () => {
          handleStorageError(request.error, ErrorType.Error);
          reject(request.error);
        };

        transaction.onerror = () => {
          handleStorageError(transaction.error, ErrorType.Error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName!, 'readwrite');
        const store = transaction.objectStore(this.storeName!);
        const request = store.clear();

        request.onsuccess = () => {
          // 等待事务完成
          transaction.oncomplete = () => {
            resolve();
          };
        };

        request.onerror = () => {
          handleStorageError(request.error, ErrorType.Error);
          reject(request.error);
        };

        transaction.onerror = () => {
          handleStorageError(transaction.error, ErrorType.Error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
      throw error;
    }
  }
} 