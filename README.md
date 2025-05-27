# Storage Engines

[![codecov](https://codecov.io/gh/guiqide/storage-manager/branch/main/graph/badge.svg)](https://codecov.io/gh/guiqide/storage-manager)

一个灵活的存储管理器，支持自定义存储引擎和序列化器。

## 版本

当前版本：2.0.0

主要更新：
- 重命名 StorageManager 为 StorageEngines
- 更新包名为 @guiqide/storage-engines

## 安装

```bash
npm install @guiqide/storage-engines
```

## 使用方法

```typescript
import { StorageEngines, LocalStorageEngine, JsonSerializer } from '@guiqide/storage-engines';

// 创建存储引擎实例
const storage = StorageEngines.create({
  engine: new LocalStorageEngine(),
  serializer: new JsonSerializer(),
  prefix: 'my-app-' // 可选：为所有键添加前缀
});

// 存储数据
storage.set('key', { value: 'data' });

// 获取数据
const data = storage.get('key', { value: '' }); // 第二个参数为默认值

// 删除数据
storage.remove('key');

// 清空所有数据
storage.clear();

// 动态配置
storage.configure({
  engine: new SessionStorageEngine(),
  serializer: new JsonSerializer(),
  prefix: 'new-prefix-'
});
```

## 支持的存储引擎

- `LocalStorageEngine`: 使用 localStorage 存储数据
- `SessionStorageEngine`: 使用 sessionStorage 存储数据
- `MemoryStorageEngine`: 使用内存存储数据（不持久化）
- `IndexedDBStorageEngine`: 使用 IndexedDB 存储数据（支持大量数据）

## 特性

- 🚀 支持多种存储引擎（localStorage、sessionStorage、IndexedDB、内存存储）
- 🔄 支持同步和异步操作
- 🔧 可自定义序列化器
- 🎯 支持键前缀
- 🛡️ 统一的错误处理
- 📦 TypeScript 支持
- 🧪 完整的测试覆盖
- 🔄 支持动态配置

## 高级用法

### 使用 IndexedDB 存储引擎

```typescript
import { StorageEngines, IndexedDBStorageEngine } from '@guiqide/storage-engines';

const storage = StorageEngines.create({
  engine: new IndexedDBStorageEngine({
    dbName: 'my-database',
    storeName: 'my-store',
    version: 1
  })
});

// 异步操作
await storage.set('key', { value: 'data' });
const data = await storage.get('key', { value: '' });
```

### 自定义序列化器

```typescript
import { Serializer } from '@guiqide/storage-engines';

class CustomSerializer implements Serializer {
  serialize(value: any): string {
    // 自定义序列化逻辑
    return JSON.stringify(value);
  }

  deserialize(value: string): any {
    // 自定义反序列化逻辑
    return JSON.parse(value);
  }
}

const storage = StorageEngines.create({
  serializer: new CustomSerializer()
});
```

## 错误处理

所有存储操作都包含统一的错误处理机制。当发生错误时：

- 对于同步操作，错误会被捕获并记录，不会中断程序执行
- 对于异步操作，错误会被 Promise 捕获并处理
- 所有错误都会被分类为警告（Warning）或错误（Error）级别
- 错误信息会包含详细的上下文信息，包括：
  - 操作类型（get/set/remove/clear）
  - 存储引擎类型
  - 键名（如果适用）
  - 原始错误信息

您可以通过配置自定义错误处理函数来满足特定的错误处理需求。

## License

MIT