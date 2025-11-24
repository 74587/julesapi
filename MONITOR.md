# Session 监控工具使用指南

## 概述

[`monitor.ts`](monitor.ts) 是一个专门用于监控 Jules API session 执行进度的工具。在执行批量任务后，你可以使用这个工具查看任务的详细进度、活动历史和最终结果。

## 快速开始

### 设置 API Key

```bash
export JULES_API_KEY="你的API密钥"
```

### 基本用法

```bash
# 列出最近的 sessions
deno task list-sessions

# 查看指定 session 的详情
deno run --allow-net --allow-read --allow-env monitor.ts -s <session_id>

# 查看 session 的活动历史
deno run --allow-net --allow-read --allow-env monitor.ts -a <session_id>

# 持续监控 session
deno run --allow-net --allow-read --allow-env monitor.ts -w <session_id>
```

## 详细功能

### 1. 列出最近的 Sessions

查看你最近创建的所有 sessions：

```bash
# 列出最近10个 sessions（默认）
deno task list-sessions

# 列出最近20个 sessions
deno run --allow-net --allow-read --allow-env monitor.ts --list -n 20
```

**输出示例：**
```
找到 3 个 sessions:

ID                       标题                           提示词
--------------------------------------------------------------------------------
3425633348274085696      分析                          详细分析这个代码库，看看是否有什么可以改进
7416781372431617372      检查单元测试完整性              检查单元测试完整性 用bun test te
1234567890123456789      添加登录功能                    Add user login functionality

提示: 使用 -s <session_id> 查看详情
```

### 2. 查看 Session 详情

查看特定 session 的基本信息和输出结果：

```bash
deno run --allow-net --allow-read --allow-env monitor.ts -s 3425633348274085696
```

**输出示例：**
```
========================================
Session 详情
========================================
ID: 3425633348274085696
标题: 分析
提示词: 详细分析这个代码库，看看是否有什么可以改进的地方
源: sources/github/layola13/rust2ts
分支: bug_test1

状态: 进行中（尚无输出）

提示: 使用 -a <session_id> 查看活动历史
```

**如果 PR 已创建：**
```
输出:

  PR #1:
    URL: https://github.com/layola13/rust2ts/pull/42
    标题: Code improvements and optimizations
    描述: This PR includes various code improvements...
```

### 3. 查看活动历史

查看 session 的详细执行步骤和进度：

```bash
deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696
```

**输出示例：**
```
找到 15 条活动:

[1] 2025-11-24 15:30:15 - 代理
    📋 生成计划 (5 步骤):
       1. Analyze the codebase structure
       2. Identify potential improvements
       3. Implement code optimizations
       4. Run tests to verify changes
       5. Create pull request

[2] 2025-11-24 15:30:18 - 用户
    ✅ 计划已批准

[3] 2025-11-24 15:30:45 - 代理
    🔄 进度更新: Analyzing codebase
       Found 23 files to analyze...

[4] 2025-11-24 15:31:20 - 代理
    🔄 进度更新: Identified improvement areas
       - Code duplication in 5 files
       - Potential performance optimizations

[5] 2025-11-24 15:32:10 - 代理
    ✨ Session 已完成
```

### 4. 持续监控（实时刷新）

实时监控 session 的执行状态，每5秒自动刷新：

```bash
deno run --allow-net --allow-read --allow-env monitor.ts -w 3425633348274085696
```

**输出示例：**
```
监控 Session: 3425633348274085696
刷新时间: 2025-11-24 15:35:42
============================================================

标题: 分析
提示词: 详细分析这个代码库，看看是否有什么可以改进的地方

🆕 新活动 (+2)

📝 最近活动:
   [2025-11-24 15:35:30] 代理: Running comprehensive tests
   [2025-11-24 15:35:15] 代理: Applied code improvements
   [2025-11-24 15:34:50] 代理: Refactoring duplicate code
   [2025-11-24 15:34:20] 代理: Analyzing performance bottlenecks
   [2025-11-24 15:33:45] 代理: Reviewing code structure

下次刷新: 5秒后...
```

按 `Ctrl+C` 停止监控。

## 命令行选项

| 选项 | 简写 | 描述 | 示例 |
|------|------|------|------|
| `--help` | `-h` | 显示帮助信息 | `-h` |
| `--list` | `-l` | 列出最近的 sessions | `-l` |
| `--number` | `-n` | 指定列出的数量 | `-n 20` |
| `--session` | `-s` | 查看指定 session 详情 | `-s 123456` |
| `--activities` | `-a` | 查看 session 活动历史 | `-a 123456` |
| `--watch` | `-w` | 持续监控 session | `-w 123456` |

## 完整工作流程示例

### 场景：执行批量任务并监控进度

**步骤 1：执行批量任务**
```bash
deno task start
```

输出会显示每个任务的 Session ID：
```
[1/2]
开始执行任务: 分析
✓ Session 创建成功，ID: 3425633348274085696

[2/2]
开始执行任务: 检查单元测试完整性
✓ Session 创建成功，ID: 7416781372431617372
```

**步骤 2：监控第一个任务**
```bash
# 持续监控第一个任务
deno run --allow-net --allow-read --allow-env monitor.ts -w 3425633348274085696
```

**步骤 3：查看活动历史**

任务完成后，查看详细的执行步骤：
```bash
deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696
```

**步骤 4：查看最终结果**
```bash
deno run --allow-net --allow-read --allow-env monitor.ts -s 3425633348274085696
```

查看是否有 PR 被创建。

## 活动类型说明

| 图标 | 类型 | 说明 |
|------|------|------|
| 📋 | planGenerated | 代理生成了执行计划 |
| ✅ | planApproved | 用户批准了执行计划 |
| 🔄 | progressUpdated | 任务进度更新 |
| ✨ | sessionCompleted | Session 执行完成 |

## 使用技巧

### 1. 自动化监控脚本

创建一个脚本来监控多个 sessions：

```bash
#!/bin/bash
# monitor-all.sh

export JULES_API_KEY="your-api-key"

# 监控第一个任务
echo "监控任务 1..."
deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696

echo -e "\n\n监控任务 2..."
deno run --allow-net --allow-read --allow-env monitor.ts -a 7416781372431617372
```

### 2. 使用别名简化命令

在 `~/.bashrc` 或 `~/.zshrc` 中添加：

```bash
alias jules-list='deno task list-sessions'
alias jules-watch='deno run --allow-net --allow-read --allow-env monitor.ts -w'
alias jules-status='deno run --allow-net --allow-read --allow-env monitor.ts -s'
alias jules-activities='deno run --allow-net --allow-read --allow-env monitor.ts -a'
```

然后就可以简化使用：
```bash
jules-list
jules-watch 3425633348274085696
jules-status 3425633348274085696
jules-activities 3425633348274085696
```

### 3. 导出结果到文件

```bash
# 导出 session 详情
deno run --allow-net --allow-read --allow-env monitor.ts -s 3425633348274085696 > session-details.txt

# 导出活动历史
deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696 > session-activities.txt
```

## 故障排查

### 问题：获取 session 失败

**错误信息：**
```
获取 session 详情失败: 404 Not Found
```

**可能原因：**
- Session ID 不正确
- Session 已被删除
- API Key 无效

**解决方法：**
1. 使用 `--list` 确认 session ID
2. 检查 API Key 是否有效
3. 确认 session 是否仍然存在

### 问题：环境变量未设置

**错误信息：**
```
错误: 需要设置 JULES_API_KEY 环境变量
```

**解决方法：**
```bash
export JULES_API_KEY="你的API密钥"
```

### 问题：权限不足

**错误信息：**
```
error: Requires net access to "jules.googleapis.com"
```

**解决方法：**
确保使用正确的权限标志：
```bash
deno run --allow-net --allow-read --allow-env monitor.ts
```

## 相关文档

- [README.md](README.md) - 项目主文档
- [QUICKSTART.md](QUICKSTART.md) - 快速入门指南
- [Jules API 文档](https://jules.ai/docs/api) - 官方 API 文档