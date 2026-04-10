import { App, ButtonComponent, Modal, Setting, normalizePath } from 'obsidian';
import TaskBase from 'main';
import { Task } from 'task/task';
import { DatePropertyValue } from 'metadata/dateProperty';
import { PRIORITY_VALUES, Priority, STATUS_VALUES, Status } from 'metadata/taskProperties';
import { FolderSuggest } from 'ui/folderSuggest';

const INVALID_FILENAME_CHARS = /[*"\\/<>:|?#\^[\]]/;

enum ValidationError {
  TaskNameEmpty,
  TaskNameInvalidChars,
  TaskNameFileExists,
  CategoryInvalidChars,
}

export class TaskCreatorModal extends Modal {
  private taskName = '';
  private category: string[] = [];
  private priority: Priority = 'medium';
  private status: Status = 'not_started';
  private due_date: DatePropertyValue | null = null;

  private createBtn: ButtonComponent | null = null;
  private taskNameInputEl: HTMLInputElement | null = null;
  private taskNameErrorEl: HTMLElement | null = null;
  private categoryInputEl: HTMLInputElement | null = null;
  private categoryErrorEl: HTMLElement | null = null;

  constructor(app: App, private plugin: TaskBase) {
    super(app);
  }

  onOpen() {
    const { contentEl } = this;

    // Create the header
    contentEl.createEl('h2', { text: 'Create Task' });

    // Add the task name option
    new Setting(contentEl)
      .setName('Task name')
      .addText(text => {
        this.taskNameInputEl = text.inputEl;
        text.setPlaceholder('My task')
          .onChange(value => {
            this.taskName = value;
            this.refreshValidation();
          });
      });
    this.taskNameErrorEl = this.createErrorEl(contentEl);

    // Add the category option
    const categorySetting = new Setting(contentEl)
      .setName('Category')
      .setDesc('Optional subcategory path, e.g. projects/plugin-development');
    categorySetting.settingEl.style.flexWrap = 'wrap';
    categorySetting.controlEl.style.width = '100%';
    categorySetting.addText(text => {
      this.categoryInputEl = text.inputEl;
      text.inputEl.style.width = '100%';
      new FolderSuggest(this.app, text.inputEl, this.plugin.settings.taskLocation);
      text.setPlaceholder('projects/plugin-development')
        .onChange(value => {
          this.category = value.trim()
            ? value.trim().split('/').map(s => s.trim()).filter(s => s.length > 0)
            : [];
          this.refreshValidation();
        });
    });
    this.categoryErrorEl = this.createErrorEl(contentEl);

    // Add priority option
    new Setting(contentEl)
      .setName('Priority')
      .addDropdown(drop => {
        PRIORITY_VALUES.forEach(p => drop.addOption(p, p));
        drop.setValue(this.priority);
        drop.onChange(value => { this.priority = value as Priority; });
      });

    // Add status option
    new Setting(contentEl)
      .setName('Status')
      .addDropdown(drop => {
        STATUS_VALUES.forEach(s => drop.addOption(s, s));
        drop.setValue(this.status);
        drop.onChange(value => { this.status = value as Status; });
      });

    // Add due date option
    new Setting(contentEl)
      .setName('Due date')
      .addText(text => {
        text.inputEl.type = 'date';
        text.onChange(value => {
          this.due_date = value ? new DatePropertyValue(value) : null;
        });
      });

    // Add create button (initially disabled until valid)
    new Setting(contentEl)
      .addButton(btn => {
        this.createBtn = btn;
        btn.setButtonText('Create')
          .setCta()
          .setDisabled(true)
          .onClick(() => { void this.createTask(); });
      });
  }

  onClose() {
    this.contentEl.empty();
    this.createBtn = null;
    this.taskNameInputEl = null;
    this.taskNameErrorEl = null;
    this.categoryInputEl = null;
    this.categoryErrorEl = null;
  }

  /** Creates a hidden error message element inserted after a setting row. */
  private createErrorEl(parent: HTMLElement): HTMLElement {
    return parent.createEl('p', {
      cls: 'task-creator-error',
      attr: { style: 'color: var(--color-red); font-size: var(--font-smaller); margin: -8px 0 8px 0; display: none;' }
    });
  }

  /** Shows or hides an error element with the given message. */
  private setError(el: HTMLElement | null, message: string | null) {
    if (!el) return;
    if (message) {
      el.setText(message);
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }

  private buildPath(): string {
    const base = this.plugin.settings.taskLocation;
    const folder = normalizePath([base, ...this.category].join('/'));
    return normalizePath(`${folder}/${this.taskName.trim()}.md`);
  }

  private validate(): Set<ValidationError> {
    const errors = new Set<ValidationError>();
    const name = this.taskName.trim();
    if (name.length === 0) errors.add(ValidationError.TaskNameEmpty);
    else if (INVALID_FILENAME_CHARS.test(name)) errors.add(ValidationError.TaskNameInvalidChars);
    else if (this.app.vault.getAbstractFileByPath(this.buildPath())) errors.add(ValidationError.TaskNameFileExists);

    if (this.category.some(segment => INVALID_FILENAME_CHARS.test(segment)))
      errors.add(ValidationError.CategoryInvalidChars);

    return errors;
  }

  private refreshValidation() {
    // Validate
    const errors = this.validate();

    // Update task name option
    if (this.taskNameInputEl) {
      // only show red border after the user has typed something
      this.taskNameInputEl.style.borderColor =
        (errors.has(ValidationError.TaskNameInvalidChars) || errors.has(ValidationError.TaskNameFileExists))
          ? 'var(--color-red)' : '';
    }
    this.setError(this.taskNameErrorEl,
      errors.has(ValidationError.TaskNameInvalidChars) ? 'Name contains invalid characters.' :
      errors.has(ValidationError.TaskNameFileExists)   ? 'A task with this name already exists.' :
      null);

    // Update category option
    if (this.categoryInputEl) {
      this.categoryInputEl.style.borderColor =
        errors.has(ValidationError.CategoryInvalidChars) ? 'var(--color-red)' : '';
    }
    this.setError(this.categoryErrorEl,
      errors.has(ValidationError.CategoryInvalidChars) ? 'Category contains invalid characters.' : null);

    // Disable create if validation failed
    this.createBtn?.setDisabled(errors.size > 0);
  }

  private async createTask() {
    // Valiate
    if (!this.validate()) return;

    // Get the 
    const path = this.buildPath();
    const folder = normalizePath(path.substring(0, path.lastIndexOf('/')));

    // Ensure the folder exists
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      await this.app.vault.createFolder(folder);
    }

    // Create the file then write frontmatter
    const file = await this.app.vault.create(path, '');
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      new Task(this.priority, this.status, this.due_date).serialize(fm);
    });

    this.close();
  }
}
