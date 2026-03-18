import {App, Editor, MarkdownView, Modal, Notice, Plugin, Setting} from 'obsidian';
import {DEFAULT_SETTINGS, TaskBaseSettings, TaskBaseSettingsTab} from "./settings";


export default class TaskBase extends Plugin {
	settings: TaskBaseSettings;

  async loadInternal() {
    try {
      await this.loadSettings();

      // This adds a settings tab so the user can configure various aspects of the plugin
      this.addSettingTab(new TaskBaseSettingsTab(this.app, this));

      // Update the current task
      this.addCommand({
        id: 'update-task',
        name: 'Update Task',
        callback: () => {
          console.log("TODO update task");
        }
      });

      // Update all tasks in the vault
      this.addCommand({
        id: 'update-all-tasks',
        name: 'Update All Tasks',
        callback: () => {
          new UpdateAllTasksModal(this.app).open();
        }
      });
      
      // Notify load success
      this.app.workspace.trigger("task-base:loaded");
    } catch (e) {
      // Notify load failure
      this.app.workspace.trigger("task-base:loadFailed");
    }

    console.log("TaskBase onload() complete");
  }

	async onload() {
    console.log("TaskBase onload() begin")

    const pb = (this.app as any).plugins.plugins["programmatic-bases"];
    if (pb) {
      console.log("from TB: programmatic bases already loaded");
      await this.loadInternal();
    } else {
      console.log("from TB: waiting for programmatic bases to load");
      this.registerEvent(
        (this.app as any).workspace.on("programmatic-bases:loaded", () => {
          console.log("from TB: programmatic bases loaded now");
          this.loadInternal();
        })
      );
    }

    this.app.workspace.onLayoutReady(() => {
      console.log("layout ready");
    })
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<TaskBaseSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class UpdateAllTasksModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.createEl('h2', { text: 'Update All Tasks' });
		contentEl.createEl('p', { text: 'This will update all tasks in your vault. Are you sure?' });

		const btnContainer = contentEl.createDiv({ cls: 'modal-button-container' });

		btnContainer.createEl('button', { text: 'Confirm', cls: 'mod-cta' })
			.addEventListener('click', () => {
				new Notice('All tasks updated!');
				this.close();
			});

		btnContainer.createEl('button', { text: 'Cancel' })
			.addEventListener('click', () => this.close());
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
