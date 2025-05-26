import { ErrorType, StorageEngine, handleStorageError } from '../types';
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
      handleStorageError(error, ErrorType.Error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }

  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }
}