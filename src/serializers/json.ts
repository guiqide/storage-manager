import { Serializer } from '../types';

export class JsonSerializer<T> implements Serializer<T> {
  serialize(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error: unknown) {
      if (error instanceof TypeError && error.message.includes('circular')) {
        // 处理循环引用
        const cache = new Set();
        return JSON.stringify(value, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.has(value)) {
              return '[Circular]';
            }
            cache.add(value);
          }
          return value;
        });
      }
      throw new Error(`Serialization error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  deserialize(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw new Error(`Deserialization error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}