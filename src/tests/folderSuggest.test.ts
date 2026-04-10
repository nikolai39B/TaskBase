// folderSuggest.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TFolder } from 'obsidian';
import { FolderSuggest } from 'ui/folderSuggest';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeFolder(path: string): TFolder {
  const f = new TFolder();
  f.path = path;
  return f;
}

function makeInputEl() {
  return {
    value: '',
    trigger: vi.fn(),
    style: {} as Record<string, string>,
  } as unknown as HTMLInputElement;
}

function makeApp(folders: TFolder[] = []) {
  return {
    vault: {
      getAllFolders: vi.fn().mockReturnValue(folders),
    },
  } as any;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('FolderSuggest', () => {

  // ── getSuggestions() ────────────────────────────────────────────────────────

  describe('getSuggestions()', () => {
    it('returns all folders when the query is empty and no basePath is set', () => {
      const folders = [makeFolder('Alpha'), makeFolder('Beta')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl());
      expect(suggest.getSuggestions('')).toHaveLength(2);
    });

    it('filters folders by query, case-insensitively', () => {
      const folders = [makeFolder('Alpha'), makeFolder('Beta')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl());
      expect(suggest.getSuggestions('alp')).toEqual([folders[0]]);
      expect(suggest.getSuggestions('ALP')).toEqual([folders[0]]);
    });

    it('returns an empty array when no folders match', () => {
      const folders = [makeFolder('Alpha')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl());
      expect(suggest.getSuggestions('zzz')).toHaveLength(0);
    });

    it('returns results sorted by path', () => {
      const folders = [makeFolder('Charlie'), makeFolder('Alpha'), makeFolder('Beta')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl());
      const paths = suggest.getSuggestions('').map(f => f.path);
      expect(paths).toEqual(['Alpha', 'Beta', 'Charlie']);
    });

    it('when basePath is set, returns only subfolders of that path', () => {
      const folders = [makeFolder('Tasks/projects'), makeFolder('Tasks/personal'), makeFolder('Notes')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl(), 'Tasks');
      const results = suggest.getSuggestions('');
      expect(results).toHaveLength(2);
      expect(results.map(f => f.path)).not.toContain('Notes');
    });

    it('when basePath is set, excludes the basePath folder itself', () => {
      const folders = [makeFolder('Tasks'), makeFolder('Tasks/projects')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl(), 'Tasks');
      expect(suggest.getSuggestions('').map(f => f.path)).not.toContain('Tasks');
    });

    it('when basePath is set, filters the query against the relative display path', () => {
      const folders = [makeFolder('Tasks/projects'), makeFolder('Tasks/personal')];
      const suggest = new FolderSuggest(makeApp(folders), makeInputEl(), 'Tasks');
      const results = suggest.getSuggestions('proj');
      expect(results).toHaveLength(1);
      expect(results[0]!.path).toBe('Tasks/projects');
    });
  });

  // ── renderSuggestion() ──────────────────────────────────────────────────────

  describe('renderSuggestion()', () => {
    it('calls el.setText with the full path when no basePath is set', () => {
      const suggest = new FolderSuggest(makeApp(), makeInputEl());
      const el = { setText: vi.fn() } as any;
      suggest.renderSuggestion(makeFolder('Notes/work'), el);
      expect(el.setText).toHaveBeenCalledWith('Notes/work');
    });

    it('calls el.setText with the relative path when basePath is set', () => {
      const suggest = new FolderSuggest(makeApp(), makeInputEl(), 'Tasks');
      const el = { setText: vi.fn() } as any;
      suggest.renderSuggestion(makeFolder('Tasks/projects'), el);
      expect(el.setText).toHaveBeenCalledWith('projects');
    });
  });

  // ── selectSuggestion() ──────────────────────────────────────────────────────

  describe('selectSuggestion()', () => {
    it('sets inputEl.value to the full path when no basePath is set', () => {
      const inputEl = makeInputEl();
      const suggest = new FolderSuggest(makeApp(), inputEl);
      suggest.selectSuggestion(makeFolder('Notes/work'));
      expect(inputEl.value).toBe('Notes/work');
    });

    it('sets inputEl.value to the relative path when basePath is set', () => {
      const inputEl = makeInputEl();
      const suggest = new FolderSuggest(makeApp(), inputEl, 'Tasks');
      suggest.selectSuggestion(makeFolder('Tasks/projects'));
      expect(inputEl.value).toBe('projects');
    });

    it('calls inputEl.trigger("input") to notify listeners', () => {
      const inputEl = makeInputEl();
      const suggest = new FolderSuggest(makeApp(), inputEl);
      suggest.selectSuggestion(makeFolder('Notes'));
      expect(inputEl.trigger).toHaveBeenCalledWith('input');
    });

    it('calls close() after selecting', () => {
      const inputEl = makeInputEl();
      const suggest = new FolderSuggest(makeApp(), inputEl);
      const closeSpy = vi.spyOn(suggest, 'close');
      suggest.selectSuggestion(makeFolder('Notes'));
      expect(closeSpy).toHaveBeenCalledOnce();
    });
  });
});
