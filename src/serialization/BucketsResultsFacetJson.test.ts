import { JsonConvert } from 'json2typescript';
import { beforeEach, describe, expect, it } from 'vitest';
import BucketsResultsFacetJson from './BucketsResultsFacetJson';

describe('BucketsResultsFacetJson', () => {
  let jsonConvert: JsonConvert;

  beforeEach(() => {
    jsonConvert = new JsonConvert();
  });

  describe('deserialization', () => {
    it('should deserialize facet with boolean value', () => {
      const facet = {
        count: 42,
        value: 'true',
      };

      const result = jsonConvert.deserializeObject(facet, BucketsResultsFacetJson);

      expect(result.count).toBe(42);
      expect(result.value).toBe('true');
    });

    it('should deserialize facet with string value', () => {
      const facet = {
        count: 10,
        value: 'ScoopInstaller/Main',
      };

      const result = jsonConvert.deserializeObject(facet, BucketsResultsFacetJson);

      expect(result.count).toBe(10);
      expect(result.value).toBe('ScoopInstaller/Main');
    });

    it('should deserialize facet with zero count', () => {
      const facet = {
        count: 0,
        value: 'empty',
      };

      const result = jsonConvert.deserializeObject(facet, BucketsResultsFacetJson);

      expect(result.count).toBe(0);
      expect(result.value).toBe('empty');
    });

    it('should deserialize facet with large count', () => {
      const facet = {
        count: 999999,
        value: 'popular',
      };

      const result = jsonConvert.deserializeObject(facet, BucketsResultsFacetJson);

      expect(result.count).toBe(999999);
      expect(result.value).toBe('popular');
    });

    it('should deserialize facet with empty string value', () => {
      const facet = {
        count: 5,
        value: '',
      };

      const result = jsonConvert.deserializeObject(facet, BucketsResultsFacetJson);

      expect(result.count).toBe(5);
      expect(result.value).toBe('');
    });
  });
});
