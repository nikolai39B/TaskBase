import { App, PluginSettingTab, Setting, TFolder } from "obsidian";
import TaskBase from "./main";
import { FolderSuggest } from 'ui/folderSuggest';

export interface TaskBaseSettings {
  taskLocation: string;
}

export const DEFAULT_SETTINGS: TaskBaseSettings = {
  taskLocation: ""
}

/**
 * Adds a full-width text input with folder autocomplete and validation to a Setting.
 * On blur, highlights the border red if the value is not an existing vault folder.
 * On change, clears the red border immediately if the value becomes valid.
 * An empty value is considered valid.
 */
function addFolderInput(
  setting: Setting,
  app: App,
  placeholder: string,
  getValue: () => string,
  onChange: (value: string) => Promise<void>,
) {
  // Make the control wrap to its own full-width line below the label
  setting.settingEl.style.flexWrap = 'wrap';
  setting.controlEl.style.width = '100%';

  // Set the setting text
  setting.addText(text => {
    // Configure the folder input as a full line input under the description text
    text.inputEl.style.width = '100%';
    text.setPlaceholder(placeholder).setValue(getValue());

    // Attach a folder suggest component to autofill folders based on the user's query
    new FolderSuggest(app, text.inputEl);

    // Define methods to validate the input and adjust the box color
    const isValid = (value: string) =>
      !value || app.vault.getFolderByPath(value) instanceof TFolder;
    const setError = (hasError: boolean) => {
      text.inputEl.style.borderColor = hasError ? 'var(--color-red)' : '';
    };

    // When the text is defocused, validate
    text.inputEl.addEventListener('blur', () => setError(!isValid(text.inputEl.value.trim())));

    // On text change, validate and set the value
    text.onChange(async (value) => {
      await onChange(value.trim());
      if (isValid(value.trim())) setError(false);
    });
  });
}

export class TaskBaseSettingsTab extends PluginSettingTab {
  plugin: TaskBase;

  constructor(app: App, plugin: TaskBase) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    addFolderInput(
      new Setting(containerEl)
        .setName('Task location')
        .setDesc('Vault-relative path to the folder containing task files.'),
      this.app,
      'e.g. Tasks',
      () => this.plugin.settings.taskLocation,
      async (value) => {
        this.plugin.settings.taskLocation = value;
        await this.plugin.saveSettings();
      },
    );
  }
}
