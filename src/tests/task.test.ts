// task.test.ts

import { describe, it, expect } from 'vitest';
import { Task } from 'task/task';
import { DatePropertyValue } from 'metadata/dateProperty';

describe('Task', () => {

  // ── constructor() ────────────────────────────────────────────────────────────

  describe('constructor()', () => {
    it('stores priority', () => {
      expect(new Task('high', 'not_started', null).priority).toBe('high');
    });

    it('stores status', () => {
      expect(new Task('medium', 'in_progress', null).status).toBe('in_progress');
    });

    it('stores due_date when provided', () => {
      const date = new DatePropertyValue('2024-03-15');
      expect(new Task('low', 'not_started', date).due_date).toBe(date);
    });

    it('stores null due_date', () => {
      expect(new Task('medium', 'not_started', null).due_date).toBeNull();
    });
  });

  // ── resolved ─────────────────────────────────────────────────────────────────

  describe('resolved', () => {
    it('is true for "complete"', () => {
      expect(new Task('medium', 'complete', null).resolved).toBe(true);
    });

    it('is true for "dropped"', () => {
      expect(new Task('medium', 'dropped', null).resolved).toBe(true);
    });

    it('is false for "not_started"', () => {
      expect(new Task('medium', 'not_started', null).resolved).toBe(false);
    });

    it('is false for "in_progress"', () => {
      expect(new Task('medium', 'in_progress', null).resolved).toBe(false);
    });
  });

  // ── serialize() ──────────────────────────────────────────────────────────────

  describe('serialize()', () => {
    it('writes priority to the frontmatter object', () => {
      const fm: Record<string, unknown> = {};
      new Task('critical', 'not_started', null).serialize(fm);
      expect(fm['priority']).toBe('critical');
    });

    it('writes status to the frontmatter object', () => {
      const fm: Record<string, unknown> = {};
      new Task('medium', 'in_progress', null).serialize(fm);
      expect(fm['status']).toBe('in_progress');
    });

    it('writes serialized due_date string when a date is set', () => {
      const fm: Record<string, unknown> = {};
      new Task('medium', 'not_started', new DatePropertyValue('2024-03-15')).serialize(fm);
      expect(fm['due_date']).toBe('2024-03-15');
    });

    it('writes null due_date when no date is set', () => {
      const fm: Record<string, unknown> = {};
      new Task('medium', 'not_started', null).serialize(fm);
      expect(fm['due_date']).toBeNull();
    });

    it('writes resolved as true for a resolved status', () => {
      const fm: Record<string, unknown> = {};
      new Task('medium', 'complete', null).serialize(fm);
      expect(fm['resolved']).toBe(true);
    });

    it('writes resolved as false for an unresolved status', () => {
      const fm: Record<string, unknown> = {};
      new Task('medium', 'not_started', null).serialize(fm);
      expect(fm['resolved']).toBe(false);
    });

    it('overwrites existing keys in the frontmatter object', () => {
      const fm: Record<string, unknown> = { priority: 'low', status: 'complete' };
      new Task('high', 'in_progress', null).serialize(fm);
      expect(fm['priority']).toBe('high');
      expect(fm['status']).toBe('in_progress');
    });
  });

  // ── deserialize() ────────────────────────────────────────────────────────────

  describe('deserialize()', () => {
    it('reads priority from the frontmatter object', () => {
      const task = Task.deserialize({ priority: 'high', status: 'not_started', due_date: null });
      expect(task.priority).toBe('high');
    });

    it('reads status from the frontmatter object', () => {
      const task = Task.deserialize({ priority: 'medium', status: 'in_progress', due_date: null });
      expect(task.status).toBe('in_progress');
    });

    it('creates a DatePropertyValue from a due_date string', () => {
      const task = Task.deserialize({ priority: 'medium', status: 'not_started', due_date: '2024-03-15' });
      expect(task.due_date).toBeInstanceOf(DatePropertyValue);
      expect(task.due_date?.serialize()).toBe('2024-03-15');
    });

    it('sets due_date to null when the key is null', () => {
      const task = Task.deserialize({ priority: 'medium', status: 'not_started', due_date: null });
      expect(task.due_date).toBeNull();
    });

    it('sets due_date to null when the key is absent', () => {
      const task = Task.deserialize({ priority: 'medium', status: 'not_started' });
      expect(task.due_date).toBeNull();
    });
  });

  // ── createDefault() ──────────────────────────────────────────────────────────

  describe('createDefault()', () => {
    it('returns a Task instance', () => {
      expect(Task.createDefault()).toBeInstanceOf(Task);
    });

    it('sets priority to "medium"', () => {
      expect(Task.createDefault().priority).toBe('medium');
    });

    it('sets status to "not_started"', () => {
      expect(Task.createDefault().status).toBe('not_started');
    });

    it('sets due_date to null', () => {
      expect(Task.createDefault().due_date).toBeNull();
    });

    it('is not resolved', () => {
      expect(Task.createDefault().resolved).toBe(false);
    });
  });
});
