// src/storage/serializers/date.ts
import { Serializer } from '../types';

export class DateSerializer implements Serializer<Date> {
  serialize(value: Date): string {
    if (!(value instanceof Date)) {
      throw new Error('Value must be a Date instance');
    }
    return value.toISOString();
  }

  deserialize(value: string): Date {
    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date string');
    }
    return date;
  }
}