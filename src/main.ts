import { ConsoleLogger, LogLevel } from "src/infrastructure/ConsoleLogger";
import { FolderTodoParser } from "./domain/FolderTodoParser";
import { FileTodoParser } from "./domain/FileTodoParser";
import { ILogger } from "./domain/ILogger";
import { ObsidianFile } from "./infrastructure/ObsidianFile";
import { App, MarkdownView, Plugin, PluginManifest, TFile } from "obsidian";
import { TodoIndex } from "./domain/TodoIndex";
import { ToggleTodoCommand } from "./Commands/ToggleTodoCommand";
import { LineOperations } from "./domain/LineOperations";
import { ToggleOngoingTodoCommand } from "./Commands/ToggleOngoingTodoCommand";
import { ProletarianWizardSettingsTab } from "./Views/ProletarianWizardSettingsTab";
import {
	DEFAULT_SETTINGS,
	ProletarianWizardSettings,
} from "./domain/ProletarianWizardSettings";
import { CompleteLineCommand } from "./Commands/CompleteLineCommand";
import { PlanningView } from "./Views/PlanningView";
import { OpenPlanningCommand } from "./Commands/OpenPlanningCommand";
import { TodoListView } from "./Views/TodoListView";
import { OpenFileEvent } from "./events/TodoListEvents";
import { TodoReportView } from "./Views/TodoReportView";
import { OpenReportCommand } from "./Commands/OpenReportCommand";
import { OpenTodayCommand } from "./Commands/OpenTodayCommand";

export default class ProletarianWizard extends Plugin {
	logger: ILogger = new ConsoleLogger(LogLevel.ERROR);
	settings: ProletarianWizardSettings;
	fileTodoParser: FileTodoParser<TFile>;
	folderTodoParser: FolderTodoParser<TFile>;
	todoIndex: TodoIndex<TFile>;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);
		this.openFileAsync = this.openFileAsync.bind(this);
	}

	async onload() {
		this.logger.info(`Loading PW`);
		await this.loadSettings();
		this.fileTodoParser = new FileTodoParser(this.settings);

		this.folderTodoParser = new FolderTodoParser({
			fileTodoParser: this.fileTodoParser,
			logger: this.logger,
		});
		this.todoIndex = new TodoIndex(
			{
				fileTodoParser: this.fileTodoParser,
				folderTodoParser: this.folderTodoParser,
				logger: this.logger,
			},
			this.settings
		);

		const openPlanningCommand = new OpenPlanningCommand(
			this.app.workspace,
			"pw.open-planning",
			"Open planning",
			"reuse",
			undefined
		);
		const openPlanningCurrentCommand = new OpenPlanningCommand(
			this.app.workspace,
			"pw.open-planning-current",
			"Open planning in current tab",
			"current",
			undefined
		);
		const openNewPlanningCommand = new OpenPlanningCommand(
			this.app.workspace,
			"pw.open-planning-new",
			"Open planning in new tab",
			"new",
			undefined
		);
		const openPlanningSplitVCommand = new OpenPlanningCommand(
			this.app.workspace,
			"pw.open-planning-split-vertical",
			"Open planning in a vertical split",
			"split",
			"vertical"
		);
		const openPlanningSplitHCommand = new OpenPlanningCommand(
			this.app.workspace,
			"pw.open-planning-split-horizontal",
			"Open planning in a horizontal split",
			"split",
			"horizontal"
		);
		const openReportCommand = new OpenReportCommand(this.app.workspace);
		const openTodayCommand = new OpenTodayCommand(
			this.app,
			this.settings,
			"pw.open-today",
			"Open today todos"
		);
		const lineOperations = new LineOperations(this.settings);
		this.addCommand(
			new ToggleTodoCommand(lineOperations, this.settings, this.app)
		);
		this.addCommand(new CompleteLineCommand(lineOperations));
		this.addCommand(
			new ToggleOngoingTodoCommand(
				lineOperations,
				this.settings,
				this.app
			)
		);
		this.addCommand(openPlanningCommand);
		this.addCommand(openPlanningCurrentCommand);
		this.addCommand(openNewPlanningCommand);
		this.addCommand(openPlanningSplitVCommand);
		this.addCommand(openPlanningSplitHCommand);
		this.addCommand(openReportCommand);
		this.addCommand(openTodayCommand);
		this.logger.info(`Registered command: ${openTodayCommand.id} - ${openTodayCommand.name}`);
		this.addSettingTab(new ProletarianWizardSettingsTab(this.app, this));

		this.addRibbonIcon("calendar-glyph", "Open planning", (_) => {
			openPlanningCommand.callback();
		});

		this.registerViews();
		this.registerEvents();

		this.app.workspace.onLayoutReady(() => {
			this.loadFiles();

			if (
				this.app.workspace.getLeavesOfType(TodoListView.viewType).length
			) {
				return;
			}

			this.app.workspace.getRightLeaf(false).setViewState({
				type: TodoListView.viewType,
			});
		});

		this.logger.info(`Done loading PW`);
	}

	private registerViews() {
		this.registerView(TodoListView.viewType, (leaf) => {
			let view = new TodoListView(
				leaf,
				{ logger: this.logger },
				this.todoIndex,
				this.settings
			);
			view.render();
			return view;
		});

		this.registerView(PlanningView.viewType, (leaf) => {
			const view = new PlanningView(
				{ logger: this.logger, todoIndex: this.todoIndex },
				this.settings,
				leaf
			);
			view.render();
			return view;
		});

		this.registerView(TodoReportView.viewType, (leaf) => {
			const view = new TodoReportView(
				leaf,
				{
					logger: this.logger,
					todoIndex: this.todoIndex,
					settings: this.settings,
					app: this.app,
				},
				this.settings
			);
			view.render();
			return view;
		});
	}

	private registerEvents() {
		this.registerEvent(
			this.app.vault.on("modify", (file) => {
				if (file instanceof TFile && file.extension === "md") {
					this.todoIndex.fileUpdated(
						new ObsidianFile(this.app, file)
					);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("create", (file) => {
				if (file instanceof TFile && file.extension === "md") {
					this.todoIndex.fileCreated(
						new ObsidianFile(this.app, file)
					);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("delete", (file) => {
				if (file instanceof TFile && file.extension === "md") {
					this.todoIndex.fileDeleted(
						new ObsidianFile(this.app, file)
					);
				}
			})
		);

		this.registerEvent(
			this.app.vault.on("rename", (file, oldPath) => {
				if (file instanceof TFile && file.extension === "md") {
					this.todoIndex.fileRenamed(
						oldPath,
						new ObsidianFile(this.app, file)
					);
				}
			})
		);
	}

	private async openFileAsync(fileAndLine: OpenFileEvent<TFile>) {
		const { file, line, inOtherLeaf } = fileAndLine;
		let leaf = this.app.workspace.getLeaf();
		if (inOtherLeaf) {
			leaf = this.app.workspace.getLeaf(true);
		} else if (leaf.getViewState().pinned) {
			leaf = this.app.workspace.getLeaf(false);
		}
		await leaf.openFile(file);
		let view = this.app.workspace.getActiveViewOfType(MarkdownView);
		const lineContent = await view.editor.getLine(line);
		view.editor.setSelection(
			{ ch: 0, line },
			{ ch: lineContent.length, line }
		);
	}

	private loadFiles() {
		setTimeout(() => {
			const files = this.app.vault
				.getMarkdownFiles()
				.map((file) => new ObsidianFile(this.app, file));
			this.todoIndex.filesLoaded(files);
		}, 50);
	}

	onunload() {}

	async loadSettings() {
		const loadedData = await this.loadData();
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			loadedData
		);
		// Ensure new settings fields are initialized if missing
		if (this.settings.autoMoveIncompleteTodosFromYesterday === undefined) {
			this.settings.autoMoveIncompleteTodosFromYesterday = false;
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
