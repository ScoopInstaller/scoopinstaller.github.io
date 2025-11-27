import { describe, expect, it } from 'vitest';
import DateConverter from './DateConverter';

describe('DateConverter', () => {
  const converter = new DateConverter();

  describe('deserialize', () => {
    it('should deserialize ISO 8601 date string', () => {
      const dateString = '2024-01-15T10:30:00Z';
      const result = converter.deserialize(dateString);

      expect(result).toBeInstanceOf(Date);
      // toISOString() always includes milliseconds (.000)
      expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should deserialize date string without timezone', () => {
      const dateString = '2024-01-15T10:30:00';
      const result = converter.deserialize(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0); // January = 0
      expect(result.getUTCDate()).toBe(15);
    });

    it('should deserialize date-only string', () => {
      const dateString = '2024-01-15';
      const result = converter.deserialize(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2024);
      expect(result.getUTCMonth()).toBe(0);
      expect(result.getUTCDate()).toBe(15);
    });

    it('should handle various date formats', () => {
      const dates = ['2024-01-15T10:30:00.000Z', '2024-01-15T10:30:00+00:00', 'Mon, 15 Jan 2024 10:30:00 GMT'];

      dates.forEach((dateString) => {
        const result = converter.deserialize(dateString);
        expect(result).toBeInstanceOf(Date);
        expect(result.toString()).not.toBe('Invalid Date');
      });
    });

    it('should return Invalid Date for invalid string', () => {
      const result = converter.deserialize('invalid-date');
      expect(result).toBeInstanceOf(Date);
      expect(result.toString()).toBe('Invalid Date');
    });
  });

  describe('serialize', () => {
    it('should throw error as serialization is not supported', () => {
      const date = new Date();
      expect(() => converter.serialize(date)).toThrow('Conversion not supported');
    });
  });
});
