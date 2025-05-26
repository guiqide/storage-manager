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