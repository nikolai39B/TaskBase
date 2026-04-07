import { App, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, TaskBaseSettings, TaskBaseSettingsTab } from "./settings";
import { PluginDependencyManager } from '../../pluginUtilsCommon/src/dependency';
import inThisFolder from './templates/components/filter/inThisFolder.yaml';
import isTask from './templates/components/filter/isTask.yaml';
import notTemplate from './templates/components/filter/notTemplate.yaml';
import pastWeek from './templates/components/filter/pastWeek.yaml';
import category from './templates/components/formula/category.yaml';
import color from './templates/components/formula/color.yaml';
import effort from './templates/components/formula/effort.yaml';
import links from './templates/components/formula/links.yaml';
import resolved from './templates/components/formula/resolved.yaml';
import taskProperties from './templates/components/propertyDisplay/taskProperties.yaml';
import due from './templates/components/view/due.yaml';
import focused from './templates/components/view/focused.yaml';
import resolvedView from './templates/components/view/resolved.yaml';
import unresolved from './templates/components/view/unresolved.yaml';
import dashboard from './templates/bases/dashboard.yaml';

export default class TaskBase extends Plugin {

	async onload() {
    console.log("TaskBase onload() begin")

    // Load once dependencies are loaded
    this.dependencyManager = new PluginDependencyManager(this);
    this.dependencyManager.addDependency("programmatic-bases", "programmatic-bases:loaded");
    await this.dependencyManager.registerPluginLoader(() => this.loadPlugin() );

    console.log("TaskBase onload() complete");
	}

  private async loadPlugin() {
    try {
      await this.loadSettings();

      // Register templates and components with programmatic-bases
      window.programmaticBases.registerSource({
        name: 'task-base',
        components: {
          'filter/inThisFolder': inThisFolder,
          'filter/isTask': isTask,
          'filter/notTemplate': notTemplate,
          'filter/pastWeek': pastWeek,
          'formula/category': category,
          'formula/color': color,
          'formula/effort': effort,
          'formula/links': links,
          'formula/resolved': resolved,
          'propertyDisplay/taskProperties': taskProperties,
          'view/due': due,
          'view/focused': focused,
          'view/resolved': resolvedView,
          'view/unresolved': unresolved,
        },
        templates: {
          'dashboard': dashboard,
        }
      });

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

      console.log("TaskBase loaded");
    } catch (e) {
      // Notify load failure
      const error = e instanceof Error ? e : new Error(String(e));
      this.app.workspace.trigger("task-base:loadFailed");
      throw error;
    }
  }

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<TaskBaseSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


  //-- ATTRIBUTES
  private dependencyManager: PluginDependencyManager;
	settings: TaskBaseSettings;
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
