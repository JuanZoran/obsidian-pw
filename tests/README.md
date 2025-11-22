# 测试配置指南

该项目包含基于 Jest 与 TypeScript 的完整单元测试套件。

## 结构

```
tests/
├── setup.ts              # 全局测试设置与 mock
├── mocks/                # mock 实现
│   └── MockFile.ts       # IFile 接口的测试实现
└── domain/               # 领域逻辑测试
    ├── LineOperations.test.ts     # 行解析与 todo 操作测试
    └── FileTodoParser.test.ts     # 文件解析与 todo 提取测试
```

## 运行测试

### 安装依赖

```bash
npm install
```

### 运行全部测试

```bash
npm test
```

### 以监听模式运行测试

```bash
npm run test:watch
```

### 运行并收集覆盖率

```bash
npm run test:coverage
```

## 测试覆盖范围

当前套件涵盖如下内容：

### LineOperations

-   ✅ 行解析（缩进、列表标记、复选框、日期）
-   ✅ 从解析结果重构行内容
-   ✅ 属性解析（包括经典 `@due(date)` 与 Dataview `[due:: date]` 语法）
-   ✅ todo 状态与复选框的互相转换
-   ✅ TodoItem 对象的构建
-   ✅ 切换 todo 状态的功能
-   ✅ 勾选功能验证

### FileTodoParser

-   ✅ 解析带有多个 todo 的整份文件
-   ✅ 支持嵌套 todo（子任务）
-   ✅ 处理不同 todo 状态（待办、完成、取消等）
-   ✅ 同步解析各种属性语法
-   ✅ 处理空文件的情况
-   ✅ 处理没有 todo 的文件
-   ✅ 文件读取失败时的错误处理
-   ✅ 格式错误的 todo 行处理

## Mock 对象

### MockFile

这是 `IFile<T>` 接口的测试实现，具备：

-   将内容存储在内存中
-   模拟文件读写操作
-   可配置为抛出错误以测试异常场景
-   记录最近的修改时间

## 配置说明

### Jest 配置（`jest.config.js`）

-   使用 `ts-jest` 预设支持 TypeScript
-   针对 Node.js 运行环境
-   启用覆盖率报告
-   设置路径映射以简化导入
-   排除主插件文件的覆盖率收集

### TypeScript 配置

-   主构建配置 (`tsconfig.json`) 中排除了测试文件
-   测试通过 Jest 使用独立的 TypeScript 编译流程

## 添加新测试

1. 创建 `.test.ts` 或 `.spec.ts` 文件
2. 将其放在 `tests/` 对应子目录下
3. 引入待测试的模块
4. 视需要复用已有 mock 或新增 mock
5. 遵循已有的 describe/it 模式

## 测试最佳实践

1. **隔离性**：每个测试独立，不依赖其他测试
2. **描述性命名**：测试描述清晰表达意图
3. **Arrange-Act-Assert**：明确预设、执行、验证步骤
4. **模拟外部依赖**：使用 mock 模拟文件系统与 Obsidian API
5. **覆盖边界情况**：包括异常、空输入与格式错误
6. **追求覆盖率**：关注核心业务逻辑的充分覆盖

## Obsidian API Mock

当前配置包含常用 Obsidian 类的 mock：

-   `App`、`TFile`、`TFolder`、`Vault`
-   `Plugin`、`Setting`、`SettingTab`、`Modal`
-   `MarkdownView`、`Component`、`ItemView`

这些 mock 可防止引用 Obsidian 模块时代码报错。

# Obsidian PW 插件测试目录

该目录托管 Obsidian PW（无产阶级巫师）插件的单元与集成测试。

## 当前状态

✅ **测试配置完成**

-   **43 个测试** 全部通过，成功率 100%
-   **核心模块覆盖率高**：
    -   LineOperations：复杂解析逻辑 61% 覆盖率
    -   FileTodoParser：文件解析功能 97% 覆盖率
    -   TodoIndex：todo 管理操作 80% 覆盖率
-   **零测试失败**，无配置警告
-   **稳定的测试基础设施**，便于未来扩展
-   **集成测试** 已正确处理异步逻辑

该测试套件为插件核心功能提供了全面覆盖，支持持续开发与维护。
