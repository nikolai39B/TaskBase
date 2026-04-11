import { App, CachedMetadata, Plugin, TFile } from 'obsidian';
import { TaskBaseSettings } from 'settings';
import { Task } from 'task/task';

/**
 * Keeps the auto-computed `resolved` frontmatter property in sync with `status`.
 *
 * Listens to `metadataCache.on('changed')` and rewrites `resolved` whenever a
 * task file's status changes and the stored value is stale.
 */
export class TaskManager {
  constructor(
    private app: App,
    private plugin: Plugin,
    private getSettings: () => TaskBaseSettings,
  ) {}

  /** Subscribes to vault metadata changes. Must be called once during plugin load. */
  register(): void {
    this.plugin.registerEvent(
      this.app.metadataCache.on('changed', (file, _data, cache) => {
        void this.handleFileChange(file, cache);
      })
    );
  }

  private async handleFileChange(file: TFile, cache: CachedMetadata): Promise<void> {
    const { taskLocation } = this.getSettings();
    const fm = cache.frontmatter as Record<string, unknown> | undefined;

    if (!this.isTaskFile(file, fm, taskLocation)) return;

    const task = Task.deserialize(fm!);

    // Skip if already correct — prevents infinite loop since processFrontMatter triggers 'changed'
    if (fm!['resolved'] === task.resolved) return;

    await this.app.fileManager.processFrontMatter(file, (f) => {
      f['resolved'] = task.resolved;
    });
  }

  /** Returns true if the file is a task: lives under taskLocation and has a `status` property. */
  private isTaskFile(
    file: TFile,
    fm: Record<string, unknown> | undefined,
    taskLocation: string,
  ): boolean {
    if (!taskLocation) return false;
    if (!file.path.startsWith(taskLocation + '/')) return false;
    if (!fm || fm['status'] === undefined) return false;
    return true;
  }
}
