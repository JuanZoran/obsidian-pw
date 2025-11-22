import ProletarianWizard from "../main";
import {
	App,
	ButtonComponent,
	PluginSettingTab,
	Setting,
	TFile,
	TFolder,
} from "obsidian";
import { FolderSelectionModal } from "./FolderSelectionModal";

export class ProletarianWizardSettingsTab extends PluginSettingTab {
	plugin: ProletarianWizard;

	constructor(app: App, plugin: ProletarianWizard) {
		super(app, plugin);
		this.plugin = plugin;
	}

	toggleError(spanFolderError: HTMLSpanElement, on: boolean) {
		if (on) {
			spanFolderError.innerText = "该文件夹不存在！";
		} else {
			spanFolderError.innerText = "";
		}
	}

	async validateArchiveFolder(folder: string): Promise<boolean> {
		return await this.app.vault.adapter.exists(folder, true);
	}

	async validateArchiveFromFolder(folders: string[]): Promise<boolean> {
		const exist = await Promise.all(
			folders.map((folder) => this.app.vault.adapter.exists(folder, true))
		);
		return exist.indexOf(false) < 0;
	}

	// Show modal for folder selection
	private showFolderSelectionModal(): void {
		const modal = new FolderSelectionModal(
			this.app,
			this.plugin.settings.ignoredFolders,
			async (selectedFolder: string) => {
				if (
					!this.plugin.settings.ignoredFolders.contains(
						selectedFolder
					)
				) {
					this.plugin.settings.ignoredFolders.push(selectedFolder);
					await this.plugin.saveSettings();
					this.display(); // Refresh the settings view
				}
			}
		);
		modal.open();
	}

	// Render the list of ignored folders with delete buttons
	private renderIgnoredFolders(containerEl: HTMLElement): void {
		containerEl.empty();

		if (this.plugin.settings.ignoredFolders.length === 0) {
			containerEl
				.createEl("div", { text: "当前没有忽略的文件夹。" })
				.addClass("pw-no-ignored-folders");
			return;
		}

		const list = containerEl.createEl("ul");
		list.addClass("pw-ignored-folders-items");

		for (const folder of this.plugin.settings.ignoredFolders) {
			const item = list.createEl("li");
			item.addClass("pw-ignored-folder-item");

			const folderText = item.createEl("span", { text: folder || "/" });
			folderText.addClass("pw-ignored-folder-name");

			const removeButton = new ButtonComponent(item);
			removeButton
				.setIcon("trash")
				.setTooltip("移除")
				.onClick(async () => {
					this.plugin.settings.ignoredFolders.remove(folder);
					await this.plugin.saveSettings();
					this.renderIgnoredFolders(containerEl); // Re-render only the list
				});
		}
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl).setName("规划").setHeading();

		new Setting(containerEl)
			.setName("默认每日工作中任务上限")
			.setDesc("工作中任务的默认每日上限")
			.addText((txt) =>
				txt
					.setValue(
						this.plugin.settings.defaultDailyWipLimit.toString()
					)
					.onChange(async (txtValue) => {
						const value = Number.parseInt(txtValue);
						if (Number.isNaN(value)) {
							this.plugin.settings.defaultDailyWipLimit = 0;
						} else
							this.plugin.settings.defaultDailyWipLimit = value;
					})
			);

		new Setting(containerEl).setName("忽略").setHeading();

		// Ignored folders section
		const ignoredFoldersSection = containerEl.createEl("div");
		ignoredFoldersSection.addClass("pw-ignored-folders-section");

		new Setting(ignoredFoldersSection)
			.setName("忽略的文件夹")
			.setDesc("在这些文件夹中不扫描 todo")
			.addButton((button) => {
				button
					.setButtonText("添加文件夹")
					.setCta()
					.onClick(() => {
						this.showFolderSelectionModal();
					});
			});

		// Display current ignored folders
		const ignoredFoldersList = ignoredFoldersSection.createEl("div");
		ignoredFoldersList.addClass("pw-ignored-folders-list");
		this.renderIgnoredFolders(ignoredFoldersList);

		const days = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday",
		];

		new Setting(containerEl)
			.setName("每周起始日")
			.setDesc("指定用于区分周末的第一工作日")
			.addDropdown((dropDown) => {
				days.forEach((display, index) =>
					dropDown.addOption((index + 1).toString(), display)
				);
				dropDown.setValue(
					(this.plugin.settings.firstWeekday ?? 1).toString()
				);
				dropDown.onChange(async (value: string) => {
					this.plugin.settings.firstWeekday = parseInt(value);
					await this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("在规划中显示周末")
			.setDesc("规划视图是否显示周末")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showWeekEnds)
					.onChange(async (value) => {
						this.plugin.settings.showWeekEnds = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("忽略归档中的 todo")
			.setDesc("忽略归档文件夹下的 todo")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.ignoreArchivedTodos)
					.onChange(async (value) => {
						this.plugin.settings.ignoreArchivedTodos = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("属性").setHeading();

		new Setting(containerEl)
			.setName("启用 Dataview 语法")
			.setDesc(
				"默认使用 @due(2025-01-01)。开启后语法变为 [due:: 2025-01-01]"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useDataviewSyntax)
					.onChange(async (value) => {
						this.plugin.settings.useDataviewSyntax = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("到期日属性")
			.setDesc("用于设置 todo 到期日的属性")
			.addText((toggle) =>
				toggle
					.setValue(this.plugin.settings.dueDateAttribute)
					.onChange(async (value) => {
						if (!value || value.contains(" ")) {
							return;
						} else {
							this.plugin.settings.dueDateAttribute = value;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("完成日期属性")
			.setDesc("用于设置 todo 完成日期的属性")
			.addText((toggle) =>
				toggle
					.setValue(this.plugin.settings.completedDateAttribute)
					.onChange(async (value) => {
						if (!value || value.contains(" ")) {
							return;
						} else {
							this.plugin.settings.completedDateAttribute = value;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("选中属性")
			.setDesc("用于标记 todo 为今日选中的属性")
			.addText((toggle) =>
				toggle
					.setValue(this.plugin.settings.selectedAttribute)
					.onChange(async (value) => {
						if (!value || value.contains(" ")) {
							return;
						} else {
							this.plugin.settings.selectedAttribute = value;
							await this.plugin.saveSettings();
						}
					})
			);

		new Setting(containerEl)
			.setName("记录开始时间")
			.setDesc("记录 todo 移入“进行中”时所在的时间")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.trackStartTime)
					.onChange(async (value) => {
						this.plugin.settings.trackStartTime = value;
						await this.plugin.saveSettings();
						startedAttribute.setDisabled(!value);
					})
			);

		const startedAttribute = new Setting(containerEl)
			.setName("开始日期属性")
			.setDesc("用于追踪 todo 开始日期的属性")
			.addText((toggle) =>
				toggle
					.setValue(this.plugin.settings.startedAttribute)
					.onChange(async (value) => {
						if (!value || value.contains(" ")) {
							return;
						} else {
							this.plugin.settings.startedAttribute = value;
							await this.plugin.saveSettings();
						}
					})
			)
			.setDisabled(!this.plugin.settings.trackStartTime);

		new Setting(containerEl).setName("进度追踪").setHeading();

		new Setting(containerEl)
			.setName("规划代办文件夹")
			.setDesc("填写规划界面中点击代办时新建的今日文件所存放的文件夹，可留空使用默认每日笔记设置")
			.addText((text) =>
				text
					.setPlaceholder("例如 Daily Notes/Today")
					.setValue(this.plugin.settings.dailyTodoFolder || "")
					.onChange(async (value) => {
						this.plugin.settings.dailyTodoFolder = value.trim();
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("默认开始时间")
			.setDesc("用于每日工作进度追踪的默认起始时间")
			.addText((text) =>
				text
					.setPlaceholder("08:00")
					.setValue(this.plugin.settings.defaultStartHour || "08:00")
					.onChange(async (value) => {
						this.plugin.settings.defaultStartHour = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("默认结束时间")
			.setDesc("用于每日工作进度追踪的默认结束时间")
			.addText((text) =>
				text
					.setPlaceholder("17:00")
					.setValue(this.plugin.settings.defaultEndHour || "17:00")
					.onChange(async (value) => {
						this.plugin.settings.defaultEndHour = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("显示今日进度条")
			.setDesc("显示表示今日工作进度的进度条")
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.displayTodayProgressBar !== false
					)
					.onChange(async (value) => {
						this.plugin.settings.displayTodayProgressBar = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
