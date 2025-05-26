import { StorageEngine } from '../types';
/**
 * SessionStorage 存储引擎类
 * 提供对 sessionStorage 的访问,并包含错误处理
 */

export class SessionStorageEngine implements StorageEngine {
  readonly isAsync = false;

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting value for key ${key} from sessionStorage:`, error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting value for key ${key} in sessionStorage:`, error);
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key ${key} from sessionStorage:`, error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
}