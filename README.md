# 无产阶级巫师 - Obsidian 任务管理器

[![CI](https://github.com/cfe84/obsidian-pw/workflows/CI/badge.svg)](https://github.com/cfe84/obsidian-pw/actions/workflows/ci.yml)
[![Release](https://github.com/cfe84/obsidian-pw/workflows/Build%20obsidian%20plugin/badge.svg)](https://github.com/cfe84/obsidian-pw/actions/workflows/release.yml)
[![License: GNU GPLv2](https://img.shields.io/badge/License-GPLv2-yellow.svg)](https://opensource.org/license/gpl-2.0)

_在整个笔记库中追踪任务。梳理一天的工作，规划待办。_

![logo](./doc/img/logo.png)

## 目录

-   [概览](#概览)
-   [安装](#安装)
-   [快速上手](#快速上手)
-   [使用说明](#使用说明)
-   [开发](#开发)
-   [参与贡献](#参与贡献)

## 概览

这是无产阶级巫师的任务看板：

![Task board](./doc/img/board.jpg)

直接在笔记中输入任务，一切紧密结合，便于将待办项保留在内容原位。只要写下 todo，它就会神奇地出现在 PW 的任务看板中。

![Enter tasks directly in notes](./doc/img/tasks_in_notes.gif)

上方的几个面板帮助你掌控当天进度。先挑选想完成的任务，并可选地调整优先级；工作过程中随时切换状态，最后标记完成。

![Organize your day](./doc/img/organize_day.gif)

任务更新是双向同步的：看板上的改动会回写笔记，反之亦然。点击任务即可在对应笔记中定位。

![Updates are two-way](./doc/img/two_way_updates.gif)

下方的面板用于规划未来工作。到达设定日期时，任务会自动进入“今日 Todo”列；若未完成，则进入“过去”面板，留待日后处理。

![Plan your work](./doc/img/plan_work.gif)

也可以使用自动展开命令（建议绑定快捷键如 `Alt+.`）将自然语言转换为具体日期，例如试试 _tomorrow_、_next monday_ 或 _next month_，省却手动计算。

![Auto-expand due days](./doc/img/expand_due_date.gif)

生成工作报告，辅助状态汇报或年度回顾。

![Annual report](./doc/img/report.gif)

## 安装

### 通过 Obsidian 社区插件安装

1. 打开 Obsidian 设置
2. 进入 **社区插件** 并关闭 **安全模式**
3. 点击 **浏览**，搜索 “Proletarian Wizard”
4. 安装并启用插件

### 手动安装

1. 从 [GitHub Releases](https://github.com/cfe84/obsidian-pw/releases) 下载最新版本
2. 解压到你的仓库 `.obsidian/plugins/proletarian-wizard/`
3. 重载 Obsidian 并在设置中启用插件

## 快速上手

1. **在任意笔记中创建第一个 todo**：

    ```markdown
    -   [ ] My first task @due(2025-01-02)
    ```

2. **通过命令面板打开任务看板**（Windows 用 `Ctrl+P`，Mac 用 `Cmd+P`）：

    - 搜索 “Open Planning View”
    - 推荐绑定快捷键，比如我在 Mac 使用 `Ctrl+P`，PC 上用 `Alt+P`

3. **在看板上拖拽筛选今日任务**
4. **边工作边更改任务状态以追踪进度**
5. **提前规划**：为未来任务添加到期时间
6. **使用属性**：`@due`、`@started`、`@completed`、`@priority` 以及 `#tag` 帮助分类
7. **利用自动完成功能**：把 “Complete line attribute” 映射到 `@today` 转为 `@due(2025-01-02)` 或 `@critical` → `@priority(critical)`

## 使用说明

### 入门

无产阶级巫师会自动扫描所有笔记中的 todo 条目，并在看板中汇总。只需用标准 Markdown 语法写入 todo，即可在插件界面看到。

### Todo 语法

#### 基础 Todo

```markdown
-   [ ] This is a basic todo
-   [x] This is a completed todo
-   [-] This is a cancelled todo
```

#### Todo 状态

PW 支持比完成/未完成更细化的状态：

-   `[ ]` - Todo（待办）
-   `[x]` - 完成
-   `[-]` - 取消
-   `[>]` - 进行中
-   `[!]` - 需要关注
-   `[d]` - 委派（等待他人）

#### 嵌套 Todo（子任务）

缩进即可创建子任务：

```markdown
-   [ ] Main project task
    -   [ ] Subtask 1
        -   Some notes about that subtask
    -   [x] Completed subtask
        -   [ ] Sub-subtask
-   [ ] Another main task
```

### 属性与标签

#### 期限日期

用 `@due()` 为 todo 添加到期日期：

```markdown
-   [ ] Review quarterly report @due(2023-12-31)
-   [ ] Call client @due(tomorrow)
-   [ ] Weekly meeting @due(next monday)
```

使用 `Complete line attribute` 命令将 “tomorrow” 之类的自然语言替换成具体日期。

**支持的日期格式：**

-   精确日期：`2023-12-31`、`Dec 31, 2023`
-   自然语言：`tomorrow`、`next week`、`next monday`、`in 3 days`
-   相对日期：`+7d`（7 天后）、`+2w`（2 周后）

#### 完成日期

通过 `@completed()` 跟踪任务完成时间：

```markdown
-   [x] Finished project @completed(2023-12-20)
```

在规划视图中勾选复选框会自动添加完成属性。

#### 选择与优先级

标记任务为今日选中并设置优先级：

```markdown
-   [ ] Important task @selected @priority(high)
-   [ ] Medium priority task @priority(medium)
-   [ ] Low priority task @priority(low)
```

选中状态会将任务自动加入当日，也会在 todo/进行中面板中单独列出，便于区分（例如区分当前实际在做的任务和所有进行中的任务）。

#### 自定义属性

可在 todo 上添加任意自定义属性：

```markdown
-   [ ] Development task @project(website) @estimate(4h) @assigned(john)
-   [ ] Meeting preparation @category(admin) @location(conference-room-a)
```

#### 布尔属性

用于简单标记：

```markdown
-   [ ] Urgent task @urgent @blocking @important
```

### Dataview 语法（可选）

如果喜欢 Dataview 语法，可在设置中启用并使用：

```markdown
-   [ ] Task with dataview syntax [due:: 2023-12-31] [priority:: high]
```

### 使用 wikilink 设置到期日（可选）

也可以用 wikilink 设置到期日，适合每天笔记直接链接：

```md
-   [ ] Task with wikilink date [[2025-01-05]]
```

若某个 todo 包含多个日期，插件会取最晚日期作为到期日，便于记录多次完成的历程。

### 任务组织

#### 今日视图

上方显示日常工作流程：

-   **Selected**：你挑选的当日任务
-   **In Progress**：当前正在进行的任务
-   **Todo**：所有待办
-   **Complete**：当天完成的任务

#### 规划视图

下方帮助安排未来：

-   **Future dates**：设置了具体日期的任务
-   **Past**：逾期待处理任务
-   **No Date**：未设日期的任务

### 命令和快捷键

#### 可用命令

-   **Toggle Todo**：在不同 todo 状态之间切换
-   **Toggle Ongoing Todo**：快速标记任务为进行中
-   **Complete Line**：将当前行的 todo 标记为完成
-   **Open Planning View**：打开任务规划界面
-   **Open Report View**：生成工作报告
-   **Auto-expand Due Date**：将自然语言转换成具体日期

#### 自动展开到期日

将自然语言转换成具体日期（建议绑定 `Alt+.`）：

-   `tomorrow` → 明天的日期
-   `next monday` → 下一个周一
-   `in 2 weeks` → 2 周后的日期
-   `next month` → 下个月的第一天

### 报告

生成全面的工作报告：

-   **每日报告**：查看每天完成的内容
-   **周期报告**：按日期区间生成并导出 Markdown

### 设置与配置

#### 属性配置

自定义要使用的属性名：

-   到期日（默认：`due`）
-   完成日期（默认：`completed`）
-   选择标记（默认：`selected`）

#### 文件夹设置

-   **忽略的文件夹**：将某些文件夹排除在扫描范围外
-   **规划代办文件夹**：指定规划视图在点击“今日”任务时创建的页面所属文件夹（会自动创建）；留空时使用默认每日笔记路径
-   **归档处理**：决定是否包含归档的 todo

#### 显示选项

-   **日期格式**：自定义日期显示方式
-   **任务排序**：设置默认排序规则
-   **面板布局**：调整任务看板的外观

### 小贴士与最佳实践

#### 组织工作流程

1. **开启一天**：先挑选当日要做的任务
2. **使用状态**：在一天内用状态跟踪进度
3. **提前规划**：为未来任务设置到期日
4. **定期复查**：用报告功能回顾

#### 高效的任务管理

-   将 todo 贴近相关内容，便于上下文思考
-   全局保持属性命名一致
-   利用自然语言设置日期，加速计划
-   经常复查逾期任务，保持节奏

#### 与其他插件的协作

无产阶级巫师可以和以下插件配合使用：

-   每日笔记插件：配合日程规划
-   日历插件：可视化日期分布
-   项目管理插件：处理更大规模流程

### 故障排查

#### 常见问题

-   **任务未出现**：确认 todo 语法无误
-   **日期解析错误**：检查格式或使用自动展开命令
-   **大型仓库性能问题**：考虑排除不必要文件夹

#### 性能优化

对于笔记量大的仓库：

1. 使用文件夹排除缩小扫描范围
2. 将完成项目归档到单独文件夹
3. 将过大的笔记拆成更小的模块

## 开发

### 前置要求

-   Node.js 18.x 或更高
-   Yarn 包管理器
-   TypeScript 基础

### 搭建开发环境

1. **克隆仓库**：

    ```bash
    git clone https://github.com/cfe84/obsidian-pw.git
    cd obsidian-pw
    ```

2. **安装依赖**：

    ```bash
    yarn install
    ```

3. **运行测试**：

    ```bash
    yarn test
    # 或运行覆盖率
    yarn test:coverage
    # 或监听模式
    yarn test:watch
    ```

4. **构建插件**：

    ```bash
    yarn build
    ```

5. **热加载开发**：

    ```bash
    yarn dev
    ```

### 测试

项目已经提供部分测试覆盖：

-   **单元测试**：针对核心业务逻辑（如 `LineOperations`、`FileTodoParser`）
-   **集成测试**：验证组件交互（如 `TodoIndex`）

运行测试：

```bash
yarn test           # 运行所有测试
yarn test:coverage  # 输出覆盖率报告
yarn test:watch     # 监听模式
```

### 项目结构

```
src/
├── domain/          # 核心业务逻辑
│   ├── LineOperations.ts      # Todo 解析与操作
│   ├── FileTodoParser.ts      # 文件级 todo 解析
│   ├── TodoIndex.ts           # Todo 管理与索引
│   └── ...
├── ui/              # React 组件
├── Commands/        # Obsidian 命令
├── Views/           # Obsidian 视图与模态窗口
└── infrastructure/  # 平台适配器

tests/
├── domain/          # 业务逻辑单元测试
├── integration/     # 集成测试
└── mocks/            # 测试工具与 mock
```

### 构建与部署

构建流程：

1. **TypeScript 编译**，开启严格类型检查
2. **esbuild 打包**，生成优化输出
3. **CI 中自动化测试**
4. **通过 GitHub Actions 发布**

## 参与贡献

欢迎贡献！以下为入门步骤：

### 报告问题

-   使用 [GitHub Issues](https://github.com/cfe84/obsidian-pw/issues)
-   提供复现步骤
-   说明 Obsidian 版本与操作系统

### 提交改动

1. **Fork 仓库**
2. **创建功能分支**：`git checkout -b feature/my-new-feature`
3. **为改动编写测试**
4. **确保测试通过**：`yarn test`
5. **提交改动**：`git commit -am 'Add some feature'`
6. **推送分支**：`git push origin feature/my-new-feature`
7. **提交 Pull Request**

### 开发指南

-   **为新增功能编写测试**
-   **遵循 TypeScript 最佳实践**
-   **保持 UI 响应与可访问**
-   **为新特性更新 README**
-   **尽量维护向后兼容**

### 贡献方向

-   **新增 todo 状态或属性**
-   **优化 UI/UX**
-   **提升大仓库性能**
-   **与其他 Obsidian 插件集成**
-   **补充文档与示例**
-   **修复 bug 与提升稳定性**

### 代码审核流程

1. 所有改动通过 Pull Request 审核
2. 自动化测试必须通过
3. 覆盖率应保持或提升
4. 面向用户的变化需同步更新文档

## 许可证

本项目采用 GNU GPLv2 许可证，详见 [LICENSE](LICENSE)

## 致谢

-   为 [Obsidian](https://obsidian.md) 社区而建
-   受高效工作流程与任务管理最佳实践启发
-   感谢所有贡献者与用户的反馈与改进
