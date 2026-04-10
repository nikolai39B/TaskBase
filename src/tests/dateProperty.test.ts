// dateProperty.test.ts

import { describe, it, expect } from 'vitest';
import { DatePropertyValue, DateTimePropertyValue } from 'metadata/dateProperty';

// ─── DatePropertyValue ────────────────────────────────────────────────────────

describe('DatePropertyValue', () => {

  // ── constructor() ────────────────────────────────────────────────────────────

  describe('constructor()', () => {
    it('accepts a date string without throwing', () => {
      expect(() => new DatePropertyValue('2024-03-15')).not.toThrow();
    });

    it('accepts a Date object without throwing', () => {
      expect(() => new DatePropertyValue(new Date('2024-03-15T00:00:00Z'))).not.toThrow();
    });
  });

  // ── serialize() ──────────────────────────────────────────────────────────────

  describe('serialize()', () => {
    it('returns YYYY-MM-DD format from a date string', () => {
      expect(new DatePropertyValue('2024-03-15').serialize()).toBe('2024-03-15');
    });

    it('returns YYYY-MM-DD format from a Date object', () => {
      expect(new DatePropertyValue(new Date('2024-03-15T00:00:00Z')).serialize()).toBe('2024-03-15');
    });

    it('preserves the date without time component', () => {
      const result = new DatePropertyValue('2024-12-31').serialize();
      expect(result).not.toContain('T');
    });
  });

  // ── deserialize() ────────────────────────────────────────────────────────────

  describe('deserialize()', () => {
    it('returns a Date object', () => {
      expect(new DatePropertyValue('2024-03-15').deserialize()).toBeInstanceOf(Date);
    });

    it('the returned Date corresponds to the input string', () => {
      const result = new DatePropertyValue('2024-03-15').deserialize();
      expect(result.toISOString()).toContain('2024-03-15');
    });
  });

  // ── round-trip ───────────────────────────────────────────────────────────────

  describe('round-trip', () => {
    it('serialize → new DatePropertyValue → serialize preserves the date', () => {
      const original = new DatePropertyValue('2024-06-20');
      expect(new DatePropertyValue(original.serialize()).serialize()).toBe('2024-06-20');
    });
  });
});

// ─── DateTimePropertyValue ────────────────────────────────────────────────────

describe('DateTimePropertyValue', () => {

  // ── serialize() ──────────────────────────────────────────────────────────────

  describe('serialize()', () => {
    it('returns the full ISO 8601 string', () => {
      expect(new DateTimePropertyValue('2024-03-15T10:30:00.000Z').serialize())
        .toBe('2024-03-15T10:30:00.000Z');
    });

    it('includes the time component', () => {
      const result = new DateTimePropertyValue('2024-03-15T10:30:00.000Z').serialize();
      expect(result).toContain('T');
    });
  });

  // ── deserialize() ────────────────────────────────────────────────────────────

  describe('deserialize()', () => {
    it('returns a Date object for a valid datetime string', () => {
      expect(new DateTimePropertyValue('2024-03-15T10:30:00.000Z').deserialize())
        .toBeInstanceOf(Date);
    });

    it('returns undefined for an invalid datetime string', () => {
      expect(new DateTimePropertyValue('not-a-date').deserialize()).toBeUndefined();
    });

    it('returns undefined for an empty string', () => {
      expect(new DateTimePropertyValue('').deserialize()).toBeUndefined();
    });
  });
});
