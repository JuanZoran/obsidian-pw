import {
	Command,
	Editor,
	Hotkey,
	MarkdownView,
	App,
} from "obsidian";
import { DateTime } from "luxon";
import { DailyNoteService } from "../domain/DailyNoteService";
import { ProletarianWizardSettings } from "../domain/ProletarianWizardSettings";
import { FileTodoParser } from "../domain/FileTodoParser";
import { TodoItem, TodoStatus, isTodoIncomplete } from "../domain/TodoItem";
import { ObsidianFile } from "../infrastructure/ObsidianFile";
import { FileOperations } from "../domain/FileOperations";

export class OpenTodayCommand implements Command {
	constructor(
		private app: App,
		private settings: ProletarianWizardSettings,
		public id: string,
		public name: string
	) {}

	icon?: string = "calendar-glyph";
	mobileOnly?: boolean = false;
	async callback() {
		const today = DateTime.now().startOf("day");
		const dailyNoteService = new DailyNoteService(
			this.app,
			this.settings.dailyTodoFolder || undefined
		);
		await dailyNoteService.createOrOpenDailyNote(today);

		// If auto-move is enabled, move incomplete todos from yesterday
		if (this.settings.autoMoveIncompleteTodosFromYesterday) {
			await this.moveIncompleteTodosFromYesterday(dailyNoteService, today);
		}
	}
	checkCallback?: (checking: boolean) => boolean | void;
	editorCallback?: (editor: Editor, view: MarkdownView) => any;
	editorCheckCallback?: (
		checking: boolean,
		editor: Editor,
		view: MarkdownView
	) => boolean | void;
	hotkeys?: Hotkey[];

	/**
	 * Move incomplete todos from yesterday's file to today's file
	 */
	private async moveIncompleteTodosFromYesterday(
		dailyNoteService: DailyNoteService,
		today: DateTime
	): Promise<void> {
		const yesterday = today.minus({ days: 1 });
		const yesterdayFile = await dailyNoteService.dailyNoteExists(yesterday);

		// If yesterday's file doesn't exist, skip
		if (!yesterdayFile) {
			return;
		}

		// Parse todos from yesterday's file
		const fileTodoParser = new FileTodoParser(this.settings);
		const yesterdayObsidianFile = new ObsidianFile(this.app, yesterdayFile);
		const todos = await fileTodoParser.parseMdFileAsync(yesterdayObsidianFile);

		// Filter incomplete todos (not Complete and not Canceled)
		const incompleteTodos = todos.filter(isTodoIncomplete);

		// If no incomplete todos, skip
		if (incompleteTodos.length === 0) {
			return;
		}

		// Get today's file
		const todayFile = await dailyNoteService.dailyNoteExists(today);
		if (!todayFile) {
			return;
		}

		// Read yesterday's file content to get original lines
		const yesterdayContent = await yesterdayObsidianFile.getContentAsync();
		const yesterdayEOL = FileOperations.getEOL(yesterdayContent);
		const yesterdayLines = yesterdayContent.split(yesterdayEOL);

		// Collect lines to move (including subtasks)
		const linesToMove: { line: string; lineNumber: number }[] = [];

		for (const todo of incompleteTodos) {
			if (todo.line !== undefined && todo.line < yesterdayLines.length) {
				linesToMove.push({
					line: yesterdayLines[todo.line],
					lineNumber: todo.line,
				});

				// Include subtasks if any
				if (todo.subtasks) {
					for (const subtask of todo.subtasks) {
						if (
							subtask.line !== undefined &&
							subtask.line < yesterdayLines.length
						) {
							linesToMove.push({
								line: yesterdayLines[subtask.line],
								lineNumber: subtask.line,
							});
						}
					}
				}
			}
		}

		// If no valid lines to move, skip
		if (linesToMove.length === 0) {
			return;
		}

		// Sort lines by line number (descending) to remove from bottom to top
		linesToMove.sort((a, b) => b.lineNumber - a.lineNumber);

		// Remove lines from yesterday's file
		const updatedYesterdayLines = [...yesterdayLines];
		for (const { lineNumber } of linesToMove) {
			updatedYesterdayLines.splice(lineNumber, 1);
		}
		await yesterdayObsidianFile.setContentAsync(
			updatedYesterdayLines.join(yesterdayEOL)
		);

		// Add lines to today's file
		const todayObsidianFile = new ObsidianFile(this.app, todayFile);
		const todayContent = await todayObsidianFile.getContentAsync();
		const todayEOL = FileOperations.getEOL(todayContent);
		const todayLines = todayContent.split(todayEOL);

		// Find insertion point (after "## Tasks" or at the end)
		const insertionIndex = this.findInsertionPoint(todayLines);

		// Sort lines by line number (ascending) to maintain order
		linesToMove.sort((a, b) => a.lineNumber - b.lineNumber);

		// Insert lines into today's file
		const linesToInsert = linesToMove.map((item) => item.line);
		
		// Add a blank line before insertion if needed (if insertion point is not at the end and not already blank)
		if (
			insertionIndex < todayLines.length &&
			todayLines[insertionIndex].trim() !== ""
		) {
			linesToInsert.unshift("");
		}
		
		todayLines.splice(insertionIndex, 0, ...linesToInsert);

		await todayObsidianFile.setContentAsync(todayLines.join(todayEOL));
	}

	/**
	 * Find the insertion point in today's file (after "## Tasks" section or at the end)
	 */
	private findInsertionPoint(lines: string[]): number {
		// Look for "## Tasks" or "## 任务" section
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line === "## Tasks" || line === "## 任务") {
				// Find the next non-empty line after the heading
				for (let j = i + 1; j < lines.length; j++) {
					if (lines[j].trim() !== "") {
						return j;
					}
				}
				// If no content after heading, insert after heading
				return i + 1;
			}
		}

		// If no Tasks section found, append at the end
		return lines.length;
	}
}

