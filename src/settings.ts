import {App, PluginSettingTab, Setting} from "obsidian";
import TaskBase from "./main";

export interface TaskBaseSettings {
	taskLocation: string;
}

export const DEFAULT_SETTINGS: TaskBaseSettings = {
	taskLocation: ""
}

export class TaskBaseSettingsTab extends PluginSettingTab {
	plugin: TaskBase;

	constructor(app: App, plugin: TaskBase) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Task Location")
			.setDesc("Folder which contains the tasks")
			.addText(text => text
				.setPlaceholder("Folder")
				.setValue(this.plugin.settings.taskLocation)
				.onChange(async (value) => {
					this.plugin.settings.taskLocation = value;
					await this.plugin.saveSettings();
				}));
	}
}
