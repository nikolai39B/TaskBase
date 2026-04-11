import { Plugin } from 'obsidian';
import { TaskCreatorModal } from 'task/taskCreator';
import { TaskManager } from 'task/taskManager';
import { registerTemplateSource } from 'templates/templateSource';
import { DEFAULT_SETTINGS, TaskBaseSettings, TaskBaseSettingsTab } from "./settings";
import { PluginDependencyManager } from '../../pluginUtilsCommon/src/dependency';

export default class TaskBase extends Plugin {

	async onload() {
    // Load once dependencies are loaded
    this.dependencyManager = new PluginDependencyManager(this);
    this.dependencyManager.addDependency("programmatic-bases", "programmatic-bases:loaded");
    await this.dependencyManager.registerPluginLoader(() => this.loadPlugin() );
	}

  private async loadPlugin() {
    try {
      await this.loadSettings();

      // Register templates and components with programmatic-bases
      registerTemplateSource();

      // This adds a settings tab so the user can configure various aspects of the plugin
      this.addSettingTab(new TaskBaseSettingsTab(this.app, this));

      // Register the task manager to obsidian's events
      this.taskManager = new TaskManager(this.app, this, () => this.settings);
      this.taskManager.register();

      // Create a new task
      this.addCommand({
        id: 'create-task',
        name: 'Create Task',
        callback: () => { new TaskCreatorModal(this.app, this).open(); }
      });

      // Notify load success
      console.log("TaskBase loaded");
      this.app.workspace.trigger("task-base:loaded");

    } catch (e) {
      // Notify load failure
      const error = e instanceof Error ? e : new Error(String(e));
      console.log("TaskBase failed to load");
      this.app.workspace.trigger("task-base:loadFailed", error);
      throw error;
    }
  }

  onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<TaskBaseSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}


  //-- ATTRIBUTES
  private dependencyManager: PluginDependencyManager;
  private taskManager: TaskManager;
	settings: TaskBaseSettings;
}
