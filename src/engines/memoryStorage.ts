import { StorageEngine } from '../types';

/**
 * 基于内存的存储引擎类
 * 使用 Map 对象在内存中存储数据，数据不会持久化
 */
export class MemoryStorageEngine implements StorageEngine {
  readonly isAsync = false;
  private storage: Map<string, string>;

  constructor() {
    this.storage = new Map();
  }

  getItem(key: string): string | null {
    try {
      return this.storage.get(key) || null;
    } catch (error) {
      console.error(`MemoryStorage getItem error for key ${key}:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.set(key, value);
    } catch (error) {
      console.error(`MemoryStorage setItem error for key ${key}:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.delete(key);
    } catch (error) {
      console.error(`MemoryStorage removeItem error for key ${key}:`, error);
    }
  }

  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error('MemoryStorage clear error:', error);
    }
  }
} 