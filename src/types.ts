// src/types.ts
export interface StorageEngine {
  readonly isAsync: boolean;
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
  clear(): void | Promise<void>;
}

export interface SyncStorageEngine extends StorageEngine {
  readonly isAsync: false;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

export interface AsyncStorageEngine extends StorageEngine {
  readonly isAsync: true;
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface Serializer<T = any> {
  serialize(value: T): string;
  deserialize(value: string): T;
}

export interface StorageConfig {
  engine?: StorageEngine;
  serializer?: Serializer;
  prefix?: string;
}

export class JSONSerializer implements Serializer {
  serialize<T>(value: T): string {
    return JSON.stringify(value);
  }

  deserialize<T>(value: string): T {
    return JSON.parse(value);
  }
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}

/**
 * 全局错误处理函数
 * @param err 错误对象
 * @param type 错误类型
 */
export function handleStorageError(err: unknown, type: ErrorType = ErrorType.Error) {
  const message = `[Storage ${type}] ${err instanceof Error ? err.message : String(err)}`;
  
  switch (type) {
    case ErrorType.Error:
      console.error(message);
      break;
    case ErrorType.Warning:
      console.warn(message);
      break;
    case ErrorType.Info:
      console.log(message);
      break;
  }
}