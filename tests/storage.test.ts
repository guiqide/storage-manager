// tests/storage.test.ts
import "core-js/stable/structured-clone";
import "fake-indexeddb/auto";
import {
  DateSerializer,
  IndexedDBStorageEngine,
  JsonSerializer,
  LocalStorageEngine,
  MemoryStorageEngine,
  SessionStorageEngine,
  StorageManager
} from '../src';

describe('StorageManager', () => {
  let storage: StorageManager;
  let mockLocalStorage: { [key: string]: string };
  let mockSessionStorage: { [key: string]: string };

  // 在每个测试前重置 mock
  beforeEach(() => {
   
    // 模拟 localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // 模拟 sessionStorage
    mockSessionStorage = {};
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn((key: string) => mockSessionStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: jest.fn(() => {
          mockSessionStorage = {};
        }),
      },
      writable: true,
    });

    storage = StorageManager.create({
      engine: new LocalStorageEngine(),
      serializer: new JsonSerializer()
    });
  });

  afterEach(() => {
    storage.clear();
  });

  // 测试实例创建
  describe('Instance Creation', () => {
    test('should create different instances', () => {
      const instance1 = StorageManager.create({
        engine: new LocalStorageEngine(),
        serializer: new JsonSerializer()
      });
      const instance2 = StorageManager.create({
        engine: new LocalStorageEngine(),
        serializer: new JsonSerializer()
      });
      // 验证两个实例是不同的引用
      expect(instance1).not.toBe(instance2);
    });

    test('should create instance with custom configuration', () => {
      const customEngine = new SessionStorageEngine();
      const customSerializer = new JsonSerializer();
      const instance = StorageManager.create({
        engine: customEngine,
        serializer: customSerializer
      });

      expect(instance['engine']).toBe(customEngine);
      expect(instance['serializer']).toBe(customSerializer);
    });
  });

  // 测试基本操作
  describe('Basic Operations', () => {
    test('should set and get value', () => {
      const testData = { test: 'data' };
      storage.set('test', testData);
      expect(storage.get('test', {})).toEqual(testData);
    });

    test('should return default value when key does not exist', () => {
      const defaultValue = { default: 'value' };
      expect(storage.get('nonExistentKey', defaultValue)).toEqual(defaultValue);
    });

    test('should remove value', () => {
      storage.set('test', 'value');
      storage.remove('test');
      expect(storage.get('test', null)).toBeNull();
    });

    test('should clear all values', () => {
      storage.set('key1', 'value1');
      storage.set('key2', 'value2');
      storage.clear();
      expect(storage.get('key1', null)).toBeNull();
      expect(storage.get('key2', null)).toBeNull();
    });
  });

  // 测试错误处理
  describe('Error Handling', () => {
    // 当写了这个，所有的json都无法使用了,因为spyOn会把json.stringify给mock掉
    // test('should handle serialization error', () => {
    //   const circular: any = {};
    //   circular.self = circular;
      
    //   // 模拟 JSON.stringify 错误
    //   jest.spyOn(JSON, 'stringify').mockImplementation(() => {
    //     throw new Error('Circular reference');
    //   });

    //   expect(() => storage.set('test', circular)).not.toThrow();
    // });

    test('should handle deserialization error', () => {
      // 模拟无效的 JSON 字符串
      mockLocalStorage['test'] = 'invalid json';
      expect(storage.get('test', 'default')).toBe('default');
    });
  });

  // 测试自定义序列化器
  describe('Custom Serializer', () => {
    test('should work with DateSerializer', async () => {
      const dateSerializer = {
        serialize: (value: Date) => value.toISOString(),
        deserialize: (value: string) => new Date(value)
      };

      storage.configure({
        serializer: dateSerializer
      });

      const testDate = new Date('2024-01-01');
      await storage.set('date', testDate);
      const retrievedDate = await storage.get('date', new Date());
      
      if (retrievedDate instanceof Date) {
        expect(retrievedDate.getTime()).toBe(testDate.getTime());
      } else {
        fail('Expected retrievedDate to be a Date instance');
      }
    });

    test('should handle non-Date values with DateSerializer', () => {
      storage.configure({
        serializer: new DateSerializer()
      });

      // 测试非 Date 类型的值
      const nonDateValue = 'not a date';
      storage.set('invalidDate', nonDateValue as any);
      const retrievedValue = storage.get('invalidDate', new Date());
      
      // 应该返回默认值
      expect(retrievedValue).toBeInstanceOf(Date);
    });
  });

  // 测试存储引擎切换
  describe('Storage Engine Switching', () => {
    test('should switch storage engine', () => {
      const sessionEngine = new SessionStorageEngine();
      storage.configure({
        engine: sessionEngine
      });
      
      // 验证是否使用了新的引擎
      expect(storage['engine']).toBe(sessionEngine);
    });

    test('should create new instance with different engine', () => {
      const sessionStorage = StorageManager.create({
        engine: new SessionStorageEngine(),
        serializer: new JsonSerializer()
      });
      
      // 验证两个实例使用不同的引擎
      expect(storage['engine']).not.toBe(sessionStorage['engine']);
    });
  });

  // 测试配置更新
  describe('Configuration', () => {
    test('should update both engine and serializer', () => {
      const sessionEngine = new SessionStorageEngine();
      const dateSerializer = new DateSerializer();

      storage.configure({
        engine: sessionEngine,
        serializer: dateSerializer
      });

      expect(storage['engine']).toBe(sessionEngine);
      expect(storage['serializer']).toBe(dateSerializer);
    });

    test('should update only specified options', () => {
      const initialEngine = storage['engine'];
      const initialSerializer = storage['serializer'];

      storage.configure({
        engine: new SessionStorageEngine()
      });

      expect(storage['engine']).not.toBe(initialEngine);
      expect(storage['serializer']).toBe(initialSerializer);
    });
  });

  // 测试 SessionStorage 引擎
  describe('SessionStorage Engine', () => {
    let sessionStorage: StorageManager;

    beforeEach(() => {
      sessionStorage = StorageManager.create({
        engine: new SessionStorageEngine(),
        serializer: new JsonSerializer()
      });
    });

    test('should store and retrieve data using sessionStorage', () => {
      const testData = { session: 'data' };
      sessionStorage.set('sessionKey', testData);
      expect(sessionStorage.get('sessionKey', {})).toEqual(testData);
      expect(mockSessionStorage['sessionKey']).toBe(JSON.stringify(testData));
    });

    test('should clear sessionStorage data', () => {
      sessionStorage.set('key1', 'value1');
      sessionStorage.set('key2', 'value2');
      sessionStorage.clear();
      expect(sessionStorage.get('key1', null)).toBeNull();
      expect(sessionStorage.get('key2', null)).toBeNull();
      expect(mockSessionStorage).toEqual({});
    });

    test('should remove specific item from sessionStorage', () => {
      sessionStorage.set('testKey', 'testValue');
      sessionStorage.remove('testKey');
      expect(sessionStorage.get('testKey', null)).toBeNull();
      expect(mockSessionStorage['testKey']).toBeUndefined();
    });
  });

  // 测试 MemoryStorage 引擎
  describe('MemoryStorage Engine', () => {
    let memoryStorage: StorageManager;
    let memoryEngine: MemoryStorageEngine;

    beforeEach(() => {
      memoryEngine = new MemoryStorageEngine();
      memoryStorage = StorageManager.create({
        engine: memoryEngine,
        serializer: new JsonSerializer()
      });
    });

    test('should store and retrieve data using memory storage', () => {
      const testData = { memory: 'data' };
      memoryStorage.set('memoryKey', testData);
      expect(memoryStorage.get('memoryKey', {})).toEqual(testData);
    });

    test('should maintain separate storage instances', () => {
      const storage1 = StorageManager.create({
        engine: new MemoryStorageEngine(),
        serializer: new JsonSerializer()
      });
      const storage2 = StorageManager.create({
        engine: new MemoryStorageEngine(),
        serializer: new JsonSerializer()
      });

      storage1.set('key', 'value1');
      storage2.set('key', 'value2');

      expect(storage1.get('key', null)).toBe('value1');
      expect(storage2.get('key', null)).toBe('value2');
    });

    test('should handle complex data types', () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        }
      };
      memoryStorage.set('complex', complexData);
      expect(memoryStorage.get('complex', {})).toEqual(complexData);
    });

    test('should handle serialization errors', () => {
      const circular: any = {};
      circular.self = circular;
      
      // 保存原始的 JSON.stringify 实现
      const originalStringify = JSON.stringify;
      
      // 模拟 JSON.stringify 错误
      jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Circular reference');
      });

      expect(() => memoryStorage.set('test', circular)).not.toThrow();

      // 恢复原始的 JSON.stringify 实现
      JSON.stringify = originalStringify;
    });

    test('should handle deserialization errors', () => {
      memoryEngine.setItem('test', 'invalid json');
      expect(memoryStorage.get('test', 'default')).toBe('default');
    });

    test('should perform operations efficiently', () => {
      const startTime = performance.now();
      
      // 执行 1000 次写入操作
      for (let i = 0; i < 1000; i++) {
        memoryStorage.set(`key${i}`, `value${i}`);
      }
      
      // 执行 1000 次读取操作
      for (let i = 0; i < 1000; i++) {
        memoryStorage.get(`key${i}`, null);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000);
    });
  });

  // 测试 IndexedDB 引擎
  describe('IndexedDB Engine', () => {
    let indexedDBStorage: StorageManager;
    let indexedDBEngine: IndexedDBStorageEngine;

    beforeEach(async () => {
      // 使用 fake-indexeddb
      // require('core-js/stable/structured-clone');
      // require('fake-indexeddb/auto');

      indexedDBEngine = new IndexedDBStorageEngine({
        dbName: 'test-db',
        storeName: 'test-store',
        version: 1
      });
      indexedDBStorage = StorageManager.create({
        engine: indexedDBEngine,
        serializer: new JsonSerializer()
      });

      // 等待 IndexedDB 初始化完成
      await new Promise(resolve => setTimeout(resolve, 100)); // 增加等待时间
    });

    afterEach(async () => {
      // 清理数据库
      await indexedDBStorage.clear();
      // 关闭数据库连接
      if (indexedDBEngine['db']) {
        indexedDBEngine['db'].close();
      }
    });

    test('should store and retrieve data using IndexedDB', async () => {
      const testData = { indexedDB: 'data' };
      await indexedDBStorage.set('indexedDBKey', testData);
      const result = await indexedDBStorage.get('indexedDBKey', {});
      expect(result).toEqual(testData);
    });

    test('should handle custom configuration', () => {
      const customEngine = new IndexedDBStorageEngine({
        dbName: 'custom-db',
        storeName: 'custom-store',
        version: 2
      });
      expect(customEngine['dbName']).toBe('custom-db');
      expect(customEngine['storeName']).toBe('custom-store');
      expect(customEngine['version']).toBe(2);
    });

    test('should handle complex data types', async () => {
      const complexData = {
        nested: {
          array: [1, 2, 3],
          object: { key: 'value' }
        }
      };
      await indexedDBStorage.set('complex', complexData);
      const result = await indexedDBStorage.get('complex', {});
      expect(result).toEqual(complexData);
    });

    test('should handle errors gracefully', async () => {
      // 使用无效的数据库名称来触发错误
      const errorEngine = new IndexedDBStorageEngine({
        dbName: '',  // 空字符串会触发错误
        storeName: 'test-store'
      });
      const errorStorage = StorageManager.create({
        engine: errorEngine,
        serializer: new JsonSerializer()
      });

      await expect(errorStorage.set('key', 'value')).resolves.not.toThrow();
      const result = await errorStorage.get('key', 'default');
      expect(result).toBe('default');
    });

    test('should maintain data isolation between instances', async () => {
      const storage1 = StorageManager.create({
        engine: new IndexedDBStorageEngine({ dbName: 'db1', storeName: 'store' }),
        serializer: new JsonSerializer()
      });
      const storage2 = StorageManager.create({
        engine: new IndexedDBStorageEngine({ dbName: 'db2', storeName: 'store' }),
        serializer: new JsonSerializer()
      });

      await storage1.set('key', 'value1');
      await storage2.set('key', 'value2');

      const value1 = await storage1.get('key', null);
      const value2 = await storage2.get('key', null);

      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
    });

    test('should handle concurrent operations', async () => {
      const setPromises: Promise<void>[] = [];
      for (let i = 0; i < 10; i++) {
        const promise = indexedDBStorage.set(`key${i}`, `value${i}`);
        if (promise instanceof Promise) {
          setPromises.push(promise);
        }
      }
      await Promise.all(setPromises);

      const readPromises: Promise<string | null>[] = [];
      for (let i = 0; i < 10; i++) {
        const promise = indexedDBStorage.get(`key${i}`, null);
        if (promise instanceof Promise) {
          readPromises.push(promise);
        }
      }
      const results = await Promise.all(readPromises);

      results.forEach((value, index) => {
        expect(value).toBe(`value${index}`);
      });
    });

    test('should handle clear operation', async () => {
      await indexedDBStorage.set('key1', 'value1');
      await indexedDBStorage.set('key2', 'value2');
      await indexedDBStorage.clear();

      const value1 = await indexedDBStorage.get('key1', null);
      const value2 = await indexedDBStorage.get('key2', null);

      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    test('should handle remove operation', async () => {
      await indexedDBStorage.set('testKey', 'testValue');
      await indexedDBStorage.remove('testKey');
      const value = await indexedDBStorage.get('testKey', null);
      expect(value).toBeNull();
    });
  });
});