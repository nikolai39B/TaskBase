// taskCreator.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskCreatorModal } from 'task/taskCreator';

vi.mock('main', () => ({ default: class {} }));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSetup(overrides: {
  taskLocation?: string;
  getAbstractFileByPath?: (path: string) => unknown;
} = {}) {
  const {
    taskLocation = 'Tasks',
    getAbstractFileByPath = (_path: string) => null,
  } = overrides;

  const createdFile = {};

  const vault = {
    getAbstractFileByPath: vi.fn().mockImplementation(getAbstractFileByPath),
    create: vi.fn().mockResolvedValue(createdFile),
    createFolder: vi.fn().mockResolvedValue(undefined),
    getAllFolders: vi.fn().mockReturnValue([]),
  };

  const fileManager = {
    processFrontMatter: vi.fn().mockImplementation(
      async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
        callback({});
      }
    ),
  };

  const app = { vault, fileManager } as any;
  const plugin = { settings: { taskLocation } } as any;

  return { app, plugin, vault, fileManager };
}

function makeModal(overrides: Parameters<typeof makeSetup>[0] = {}) {
  const { app, plugin, vault, fileManager } = makeSetup(overrides);
  const modal = new TaskCreatorModal(app, plugin);
  return { modal, app, plugin, vault, fileManager };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TaskCreatorModal', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── buildPath() ─────────────────────────────────────────────────────────────

  describe('buildPath()', () => {
    it('combines taskLocation, category, and taskName into a .md path', () => {
      const { modal } = makeModal({ taskLocation: 'Tasks' });
      (modal as any).taskName = 'My Task';
      (modal as any).category = ['projects'];
      expect((modal as any).buildPath()).toBe('Tasks/projects/My Task.md');
    });

    it('uses just taskLocation and name when category is empty', () => {
      const { modal } = makeModal({ taskLocation: 'Tasks' });
      (modal as any).taskName = 'My Task';
      (modal as any).category = [];
      expect((modal as any).buildPath()).toBe('Tasks/My Task.md');
    });

    it('handles multiple category segments', () => {
      const { modal } = makeModal({ taskLocation: 'Tasks' });
      (modal as any).taskName = 'My Task';
      (modal as any).category = ['projects', 'plugin-dev'];
      expect((modal as any).buildPath()).toBe('Tasks/projects/plugin-dev/My Task.md');
    });

    it('trims whitespace from taskName', () => {
      const { modal } = makeModal({ taskLocation: 'Tasks' });
      (modal as any).taskName = '  My Task  ';
      (modal as any).category = [];
      expect((modal as any).buildPath()).toBe('Tasks/My Task.md');
    });
  });

  // ── validate() ──────────────────────────────────────────────────────────────

  describe('validate()', () => {
    it('returns no errors for a valid name with empty category', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'Valid Task';
      (modal as any).category = [];
      expect((modal as any).validate().size).toBe(0);
    });

    it('returns no errors for a valid name with a valid category', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'Valid Task';
      (modal as any).category = ['good-folder'];
      expect((modal as any).validate().size).toBe(0);
    });

    it('returns one error when task name is empty', () => {
      const { modal } = makeModal();
      (modal as any).taskName = '';
      expect((modal as any).validate().size).toBe(1);
    });

    it('returns one error when task name is only whitespace', () => {
      const { modal } = makeModal();
      (modal as any).taskName = '   ';
      expect((modal as any).validate().size).toBe(1);
    });

    it('returns one error when task name contains invalid chars', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'bad/name';
      (modal as any).category = [];
      expect((modal as any).validate().size).toBe(1);
    });

    it.each(['*', '"', '\\', '<', '>', ':', '|', '?', '#', '^', '[', ']'])(
      'flags "%s" as an invalid character in the task name',
      (char) => {
        const { modal } = makeModal();
        (modal as any).taskName = `my${char}task`;
        (modal as any).category = [];
        expect((modal as any).validate().size).toBeGreaterThan(0);
      }
    );

    it('returns one error when a file already exists at the computed path', () => {
      const { modal } = makeModal({ getAbstractFileByPath: () => ({}) });
      (modal as any).taskName = 'My Task';
      (modal as any).category = [];
      expect((modal as any).validate().size).toBe(1);
    });

    it('returns one error when a category segment contains invalid chars', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'Valid Name';
      (modal as any).category = ['bad/segment'];
      expect((modal as any).validate().size).toBe(1);
    });

    it('accumulates errors from both name and category simultaneously', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'bad*name';
      (modal as any).category = ['bad/cat'];
      expect((modal as any).validate().size).toBe(2);
    });

    it('does not add a category error for a path-traversal-free category', () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'Valid';
      (modal as any).category = ['sub', 'folder'];
      expect((modal as any).validate().size).toBe(0);
    });
  });

  // ── createTask() ─────────────────────────────────────────────────────────────

  describe('createTask()', () => {
    it('calls vault.create with the resolved path and empty content', async () => {
      const { modal, vault } = makeModal();
      (modal as any).taskName = 'My Task';
      (modal as any).category = [];
      await (modal as any).createTask();
      expect(vault.create).toHaveBeenCalledWith('Tasks/My Task.md', '');
    });

    it('calls processFrontMatter to write task properties', async () => {
      const { modal, fileManager } = makeModal();
      (modal as any).taskName = 'My Task';
      await (modal as any).createTask();
      expect(fileManager.processFrontMatter).toHaveBeenCalledOnce();
    });

    it('writes the selected priority into the frontmatter', async () => {
      const { modal, fileManager } = makeModal();
      (modal as any).taskName = 'My Task';
      (modal as any).priority = 'high';

      let capturedFm: Record<string, unknown> = {};
      fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );

      await (modal as any).createTask();
      expect(capturedFm['priority']).toBe('high');
    });

    it('writes the selected status into the frontmatter', async () => {
      const { modal, fileManager } = makeModal();
      (modal as any).taskName = 'My Task';
      (modal as any).status = 'in_progress';

      let capturedFm: Record<string, unknown> = {};
      fileManager.processFrontMatter.mockImplementation(
        async (_file: unknown, callback: (fm: Record<string, unknown>) => void) => {
          callback(capturedFm);
        }
      );

      await (modal as any).createTask();
      expect(capturedFm['status']).toBe('in_progress');
    });

    it('creates an intermediate folder when it does not exist', async () => {
      const { modal, vault } = makeModal();
      (modal as any).taskName = 'My Task';
      (modal as any).category = ['projects'];
      await (modal as any).createTask();
      expect(vault.createFolder).toHaveBeenCalledWith('Tasks/projects');
    });

    it('does not create a folder when it already exists', async () => {
      const { modal, vault } = makeModal({
        getAbstractFileByPath: (path) => path === 'Tasks/projects' ? {} : null,
      });
      (modal as any).taskName = 'My Task';
      (modal as any).category = ['projects'];
      await (modal as any).createTask();
      expect(vault.createFolder).not.toHaveBeenCalled();
    });

    it('does not create a folder when the parent folder already exists', async () => {
      const { modal, vault } = makeModal({
        getAbstractFileByPath: (path) => path === 'Tasks' ? {} : null,
      });
      (modal as any).taskName = 'My Task';
      (modal as any).category = [];
      await (modal as any).createTask();
      expect(vault.createFolder).not.toHaveBeenCalled();
    });

    it('calls close() after successfully creating the task', async () => {
      const { modal } = makeModal();
      (modal as any).taskName = 'My Task';
      const closeSpy = vi.spyOn(modal, 'close');
      await (modal as any).createTask();
      expect(closeSpy).toHaveBeenCalledOnce();
    });
  });

  // ── onClose() ───────────────────────────────────────────────────────────────

  describe('onClose()', () => {
    it('empties the contentEl', () => {
      const { modal } = makeModal();
      modal.onClose();
      expect(modal.contentEl.empty).toHaveBeenCalledOnce();
    });

    it('sets createBtn to null', () => {
      const { modal } = makeModal();
      (modal as any).createBtn = {};
      modal.onClose();
      expect((modal as any).createBtn).toBeNull();
    });

    it('sets taskNameInputEl to null', () => {
      const { modal } = makeModal();
      (modal as any).taskNameInputEl = {};
      modal.onClose();
      expect((modal as any).taskNameInputEl).toBeNull();
    });

    it('sets taskNameErrorEl to null', () => {
      const { modal } = makeModal();
      (modal as any).taskNameErrorEl = {};
      modal.onClose();
      expect((modal as any).taskNameErrorEl).toBeNull();
    });

    it('sets categoryInputEl to null', () => {
      const { modal } = makeModal();
      (modal as any).categoryInputEl = {};
      modal.onClose();
      expect((modal as any).categoryInputEl).toBeNull();
    });

    it('sets categoryErrorEl to null', () => {
      const { modal } = makeModal();
      (modal as any).categoryErrorEl = {};
      modal.onClose();
      expect((modal as any).categoryErrorEl).toBeNull();
    });
  });
});
