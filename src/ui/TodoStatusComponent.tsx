import * as React from "react";
import { TodoItem, TodoStatus, getTodoId, isTodoCompleted } from "../domain/TodoItem"
import { App, Menu, TFile } from "obsidian";
import { FileOperations } from "src/domain/FileOperations";
import { ILogger } from "src/domain/ILogger";
import { ProletarianWizardSettings } from "src/domain/ProletarianWizardSettings";
import { Sound } from "./SoundPlayer";
import { PwEvent } from "src/events/PwEvent";

function statusToIcon(status: TodoStatus): string {
  switch (status) {
    case TodoStatus.Complete:
      return "✔";
    case TodoStatus.AttentionRequired:
      return "❗";
    case TodoStatus.Canceled:
      return "❌";
    case TodoStatus.Delegated:
      return "👬";
    case TodoStatus.InProgress:
      return "‍⏩";
    case TodoStatus.Todo:
      return "⚪️";
    default:
      return "";
  }
};

export interface TodoSatusComponentDeps {
  logger: ILogger,
  app: App,
}

export interface TodoSatusComponentProps {
  todo: TodoItem<TFile>,
  deps: TodoSatusComponentDeps,
  settings: ProletarianWizardSettings,
  playSound?: PwEvent<Sound>,
}

export function TodoStatusComponent({todo, deps, settings, playSound}: TodoSatusComponentProps) {
  // Reuse FileOperations instance to avoid creating multiple instances
  const fileOperations = React.useMemo(() => new FileOperations(settings), [settings]);
  
  const addChangeStatusMenuItem = (menu: Menu, status: TodoStatus, label: string) => {
		menu.addItem((item) => {
      item.setTitle(label)
      item.onClick(() => {
        todo.status = status
				fileOperations.updateTodoStatus(todo, settings.completedDateAttribute)
      })
    })
  }

  const onauxclick = (evt: any) => {
    if (evt.defaultPrevented) {
      return
    }
    const menu = new Menu()
    addChangeStatusMenuItem(menu, TodoStatus.Todo, "◻️ 标记为待办")
    addChangeStatusMenuItem(menu, TodoStatus.Complete, "✔️ 标记为完成")
    addChangeStatusMenuItem(menu, TodoStatus.InProgress, "⏩ 标记为进行中")
    addChangeStatusMenuItem(menu, TodoStatus.AttentionRequired, "❗ 标记为需关注")
    addChangeStatusMenuItem(menu, TodoStatus.Delegated, "👬 标记为委派")
    addChangeStatusMenuItem(menu, TodoStatus.Canceled, "❌ 标记为取消")
    menu.showAtMouseEvent(evt)
    evt.preventDefault();
  }

  const onclick = (evt: any) => {
    if (evt.defaultPrevented) {
      return
    }
    deps.logger.debug(`Changing status on ${getTodoId(todo)}`);
    evt.preventDefault();
    const wasCompleted = isTodoCompleted(todo)
    if (!wasCompleted && playSound) {
      playSound.fireAsync("checked").then()
    }
		todo.status = wasCompleted ? TodoStatus.Todo : TodoStatus.Complete
		fileOperations.updateTodoStatus(todo, settings.completedDateAttribute)
  }

  return <div className="pw-todo-checkbox" onClick={onclick} onAuxClick={onauxclick}>
    {statusToIcon(todo.status)}
  </div>;
}