// taskProperties.test.ts

import { describe, it, expect } from 'vitest';
import {
  PRIORITY_VALUES,
  PRIORITY_DISPLAY,
  STATUS_VALUES,
  STATUS_DISPLAY,
  RESOLVED_STATUSES,
  TASK_PROPERTIES,
} from 'metadata/taskProperties';

describe('taskProperties', () => {

  // ── PRIORITY_VALUES ──────────────────────────────────────────────────────────

  describe('PRIORITY_VALUES', () => {
    it('is non-empty', () => {
      expect(PRIORITY_VALUES.length).toBeGreaterThan(0);
    });

    it.each(['critical', 'high', 'medium', 'low'] as const)(
      'contains "%s"',
      (p) => { expect(PRIORITY_VALUES).toContain(p); }
    );
  });

  // ── PRIORITY_DISPLAY ─────────────────────────────────────────────────────────

  describe('PRIORITY_DISPLAY', () => {
    it('has a non-empty display string for every PRIORITY_VALUE', () => {
      for (const p of PRIORITY_VALUES) {
        const display = PRIORITY_DISPLAY[p];
        expect(typeof display).toBe('string');
        expect((display as string).length).toBeGreaterThan(0);
      }
    });
  });

  // ── STATUS_VALUES ────────────────────────────────────────────────────────────

  describe('STATUS_VALUES', () => {
    it('is non-empty', () => {
      expect(STATUS_VALUES.length).toBeGreaterThan(0);
    });

    it.each(['not_started', 'in_progress', 'complete', 'dropped'] as const)(
      'contains "%s"',
      (s) => { expect(STATUS_VALUES).toContain(s); }
    );
  });

  // ── STATUS_DISPLAY ───────────────────────────────────────────────────────────

  describe('STATUS_DISPLAY', () => {
    it('has a non-empty display string for every STATUS_VALUE', () => {
      for (const s of STATUS_VALUES) {
        const display = STATUS_DISPLAY[s];
        expect(typeof display).toBe('string');
        expect((display as string).length).toBeGreaterThan(0);
      }
    });
  });

  // ── RESOLVED_STATUSES ────────────────────────────────────────────────────────

  describe('RESOLVED_STATUSES', () => {
    it('is non-empty', () => {
      expect(RESOLVED_STATUSES.length).toBeGreaterThan(0);
    });

    it('every resolved status is also a STATUS_VALUE', () => {
      for (const s of RESOLVED_STATUSES) {
        expect(STATUS_VALUES as readonly string[]).toContain(s);
      }
    });

    it('contains "complete"', () => {
      expect(RESOLVED_STATUSES).toContain('complete');
    });

    it('contains "dropped"', () => {
      expect(RESOLVED_STATUSES).toContain('dropped');
    });

    it('does not contain "not_started"', () => {
      expect(RESOLVED_STATUSES).not.toContain('not_started');
    });

    it('does not contain "in_progress"', () => {
      expect(RESOLVED_STATUSES).not.toContain('in_progress');
    });
  });

  // ── TASK_PROPERTIES ──────────────────────────────────────────────────────────

  describe('TASK_PROPERTIES', () => {
    it('each property\'s name matches its key in the record', () => {
      for (const [key, prop] of Object.entries(TASK_PROPERTIES)) {
        expect(prop.name).toBe(key);
      }
    });

    it('each property has a non-empty display string', () => {
      for (const prop of Object.values(TASK_PROPERTIES)) {
        expect(typeof prop.display).toBe('string');
        expect(prop.display.length).toBeGreaterThan(0);
      }
    });

    it('includes "priority"', () => {
      expect(TASK_PROPERTIES).toHaveProperty('priority');
    });

    it('includes "status"', () => {
      expect(TASK_PROPERTIES).toHaveProperty('status');
    });

    it('includes "due_date"', () => {
      expect(TASK_PROPERTIES).toHaveProperty('due_date');
    });

    it('includes "resolved"', () => {
      expect(TASK_PROPERTIES).toHaveProperty('resolved');
    });
  });
});
