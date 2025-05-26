# Storage Manager

A flexible storage manager with customizable storage engines and serializers.

## Installation

```bash
npm install storage-manager
```

## Usage

```typescript
import { StorageManager, SessionStorageEngine, JsonSerializer } from 'storage-manager';

// 使用默认配置
const storage = StorageManager.getInstance();

// 存储数据
storage.set('key', { value: 'data' });

// 获取数据
const data = storage.get('key', { value: '' });

// 使用自定义存储引擎
const sessionStorage = StorageManager.getInstance(
  new SessionStorageEngine(),
  new JsonSerializer()
);
```

## Features

- 支持自定义存储引擎
- 支持自定义序列化器
- TypeScript 支持
- 单例模式
- 错误处理

## License

MIT