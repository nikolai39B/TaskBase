import { AbstractInputSuggest, App, TFolder } from 'obsidian';

/** Suggests vault folders as the user types into an input.
 *  If `basePath` is provided, only subfolders of that path are shown
 *  and values are relative to it. */
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  constructor(app: App, private inputEl: HTMLInputElement, private basePath?: string) {
    super(app, inputEl);
  }

  getSuggestions(query: string): TFolder[] {
    return this.app.vault.getAllFolders()
      .filter(f => this.isCandidate(f) && this.toDisplayPath(f).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  renderSuggestion(folder: TFolder, el: HTMLElement) {
    el.setText(this.toDisplayPath(folder));
  }

  selectSuggestion(folder: TFolder) {
    this.inputEl.value = this.toDisplayPath(folder);
    this.inputEl.trigger('input');
    this.close();
  }

  /** Returns true if the folder should appear as a suggestion. */
  private isCandidate(folder: TFolder): boolean {
    if (!this.basePath) return true;
    return folder.path.startsWith(this.basePath + '/');
  }

  /** Returns the path to display and insert — relative to basePath if set. */
  private toDisplayPath(folder: TFolder): string {
    if (!this.basePath) return folder.path;
    return folder.path.slice(this.basePath.length + 1); // strip "basePath/"
  }
}
