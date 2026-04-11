// taskManager.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TFile } from 'obsidian';
import { TaskManager } from 'task/taskManager';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFile(path: string): TFile {
  const f = new TFile();
  f.path = path;
  return f;
}

function makeCache(frontmatter?: Record<string, unknown>) {
  return { frontmatter } as any;
}

function makeSetup(taskLocation = 'Tasks') {
  const eventRef = {};
  const app = {
    metadataCache: { on: vi.fn().mockReturnValue(eventRef) },
    fileManager: {
      processFrontMatter: vi.fn().mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          const fm: Record<string, unknown> = {};
          callback(fm);
          return fm;
        }
      ),
    },
  };
  const plugin = { registerEvent: vi.fn() };
  const manager = new TaskManager(
    app as any,
    plugin as any,
    () => ({ taskLocation }),
  );
  return { app, plugin, manager, eventRef };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TaskManager', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── register() ──────────────────────────────────────────────────────────────

  describe('register()', () => {
    it('subscribes to metadataCache "changed" events', () => {
      const { app, manager } = makeSetup();
      manager.register();
      expect(app.metadataCache.on).toHaveBeenCalledWith('changed', expect.any(Function));
    });

    it('passes the EventRef to plugin.registerEvent', () => {
      const { plugin, manager, eventRef } = makeSetup();
      manager.register();
      expect(plugin.registerEvent).toHaveBeenCalledWith(eventRef);
    });
  });

  // ── isTaskFile() ────────────────────────────────────────────────────────────

  describe('isTaskFile()', () => {
    it('returns false when taskLocation is empty', () => {
      const { manager } = makeSetup('');
      const result = (manager as any).isTaskFile(
        makeFile('Tasks/my-task.md'),
        { status: 'not_started' },
        '',
      );
      expect(result).toBe(false);
    });

    it('returns false when the file is not under taskLocation', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Notes/some-note.md'),
        { status: 'not_started' },
        'Tasks',
      )).toBe(false);
    });

    it('returns false when the file path equals taskLocation (not a child)', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Tasks'),
        { status: 'not_started' },
        'Tasks',
      )).toBe(false);
    });

    it('returns false when frontmatter is undefined', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Tasks/my-task.md'),
        undefined,
        'Tasks',
      )).toBe(false);
    });

    it('returns false when frontmatter has no status property', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Tasks/my-task.md'),
        { priority: 'high' },
        'Tasks',
      )).toBe(false);
    });

    it('returns true for a file directly under taskLocation with status', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Tasks/my-task.md'),
        { status: 'not_started' },
        'Tasks',
      )).toBe(true);
    });

    it('returns true for a file in a subfolder of taskLocation', () => {
      const { manager } = makeSetup();
      expect((manager as any).isTaskFile(
        makeFile('Tasks/projects/plugin-dev.md'),
        { status: 'in_progress' },
        'Tasks',
      )).toBe(true);
    });
  });

  // ── handleFileChange() ──────────────────────────────────────────────────────

  describe('handleFileChange()', () => {
    it('does nothing when the file is not a task file', async () => {
      const { app, manager } = makeSetup();
      await (manager as any).handleFileChange(
        makeFile('Notes/not-a-task.md'),
        makeCache({ status: 'not_started', resolved: false }),
      );
      expect(app.fileManager.processFrontMatter).not.toHaveBeenCalled();
    });

    it('does nothing when resolved is already correct', async () => {
      const { app, manager } = makeSetup();
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'not_started', resolved: false }),
      );
      expect(app.fileManager.processFrontMatter).not.toHaveBeenCalled();
    });

    it('calls processFrontMatter when resolved is stale', async () => {
      const { app, manager } = makeSetup();
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'complete', resolved: false }), // stale: should be true
      );
      expect(app.fileManager.processFrontMatter).toHaveBeenCalledOnce();
    });

    it('sets resolved to true when status is "complete"', async () => {
      const { app, manager } = makeSetup();
      let capturedFm: Record<string, unknown> = {};
      app.fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'complete', resolved: false }),
      );
      expect(capturedFm['resolved']).toBe(true);
    });

    it('sets resolved to true when status is "dropped"', async () => {
      const { app, manager } = makeSetup();
      let capturedFm: Record<string, unknown> = {};
      app.fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'dropped', resolved: false }),
      );
      expect(capturedFm['resolved']).toBe(true);
    });

    it('sets resolved to false when status is "not_started"', async () => {
      const { app, manager } = makeSetup();
      let capturedFm: Record<string, unknown> = {};
      app.fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'not_started', resolved: true }), // stale: should be false
      );
      expect(capturedFm['resolved']).toBe(false);
    });

    it('sets resolved to false when status is "in_progress"', async () => {
      const { app, manager } = makeSetup();
      let capturedFm: Record<string, unknown> = {};
      app.fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );
      await (manager as any).handleFileChange(
        makeFile('Tasks/my-task.md'),
        makeCache({ status: 'in_progress', resolved: true }), // stale: should be false
      );
      expect(capturedFm['resolved']).toBe(false);
    });

    it('passes the TFile to processFrontMatter', async () => {
      const { app, manager } = makeSetup();
      const file = makeFile('Tasks/my-task.md');
      await (manager as any).handleFileChange(
        file,
        makeCache({ status: 'complete', resolved: false }),
      );
      expect(app.fileManager.processFrontMatter).toHaveBeenCalledWith(file, expect.any(Function));
    });
  });
});
