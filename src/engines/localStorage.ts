import { ErrorType, StorageEngine, handleStorageError } from '../types';

export class LocalStorageEngine implements StorageEngine {
  readonly isAsync = false;

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      handleStorageError(error, ErrorType.Error);
    }
  }
}