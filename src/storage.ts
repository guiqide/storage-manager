// src/storage.ts
import { MemoryStorageEngine } from './engines/memoryStorage';
import { AsyncStorageEngine, ErrorType, JSONSerializer, Serializer, StorageConfig, StorageEngine, SyncStorageEngine, handleStorageError } from './types';

/**
 * 存储引擎类
 */
export class StorageEngines {
  private engine: StorageEngine;
  private serializer: Serializer;
  private prefix: string;

  /**
   * 私有构造函数
   * @param config 配置选项
   */
  private constructor(config: StorageConfig) {
    this.engine = config.engine || new MemoryStorageEngine();
    this.serializer = config.serializer || new JSONSerializer();
    this.prefix = config.prefix || '';
  }

  /**
   * 创建存储引擎实例
   * @param config 配置选项
   * @returns StorageEngines实例
   */
  static create(config: StorageConfig = {}): StorageEngines {
    return new StorageEngines({
      engine: config.engine || new MemoryStorageEngine(),
      serializer: config.serializer || new JSONSerializer(),
      prefix: config.prefix || ''
    });
  }

  /**
   * 配置存储引擎
   * @param config 配置选项
   */
  configure(config: { engine?: StorageEngine; serializer?: Serializer; prefix?: string }): void {
    if (config.engine) {
      this.engine = config.engine;
    }
    if (config.serializer) {
      this.serializer = config.serializer;
    }
    if (config.prefix !== undefined) {
      this.prefix = config.prefix;
    }
  }

  /**
   * 存储数据
   * @param key 存储键
   * @param value 存储值
   */
  set<T>(key: string, value: T): void | Promise<void> {
    const fullKey = this.prefix + key;
    try {
      const serializedValue = this.serializer.serialize(value);
      
      if (this.engine.isAsync) {
        return (this.engine as AsyncStorageEngine).setItem(fullKey, serializedValue)
          .catch(error => {
            handleStorageError(error, ErrorType.Warning);
          });
      } else {
        try {
          (this.engine as SyncStorageEngine).setItem(fullKey, serializedValue);
        } catch (error) {
          handleStorageError(error, ErrorType.Warning);
        }
      }
    } catch (error) {
      handleStorageError(error, ErrorType.Warning);
    }
  }

  /**
   * 获取数据
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 存储的数据或默认值
   */
  get<T>(key: string, defaultValue: T): T | Promise<T> {
    const fullKey = this.prefix + key;
    
    if (this.engine.isAsync) {
      return (this.engine as AsyncStorageEngine).getItem(fullKey)
        .then(value => {
          try {
            return value ? this.serializer.deserialize(value) : defaultValue;
          } catch (error) {
            handleStorageError(error, ErrorType.Warning);
            return defaultValue;
          }
        })
        .catch(error => {
          handleStorageError(error, ErrorType.Warning);
          return defaultValue;
        });
    } else {
      try {
        const value = (this.engine as SyncStorageEngine).getItem(fullKey);
        if (!value) {
          return defaultValue;
        }
        try {
          return this.serializer.deserialize(value);
        } catch (error) {
          handleStorageError(error, ErrorType.Warning);
          return defaultValue;
        }
      } catch (error) {
        handleStorageError(error, ErrorType.Warning);
        return defaultValue;
      }
    }
  }

  /**
   * 删除指定键的数据
   * @param key 要删除的键
   */
  remove(key: string): void | Promise<void> {
    const fullKey = this.prefix + key;
    
    if (this.engine.isAsync) {
      return (this.engine as AsyncStorageEngine).removeItem(fullKey)
        .catch(error => {
          handleStorageError(error, ErrorType.Warning);
        });
    } else {
      try {
        (this.engine as SyncStorageEngine).removeItem(fullKey);
      } catch (error) {
        handleStorageError(error, ErrorType.Warning);
      }
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void | Promise<void> {
    if (this.engine.isAsync) {
      return (this.engine as AsyncStorageEngine).clear()
        .catch(error => {
          handleStorageError(error, ErrorType.Warning);
        });
    } else {
      try {
        (this.engine as SyncStorageEngine).clear();
      } catch (error) {
        handleStorageError(error, ErrorType.Warning);
      }
    }
  }
}