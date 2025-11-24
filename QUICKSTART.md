# 快速入门指南

## 5分钟快速开始使用 Jules API 批量任务处理器

### 步骤 1: 准备工作

确保你已经：
- ✅ 安装了 [Deno](https://deno.land/)
- ✅ 拥有 Jules API 密钥
- ✅ 在 Jules 网页应用中授权了至少一个 GitHub 仓库

### 步骤 2: 获取 API 密钥

1. 访问 [Jules 网页应用](https://jules.ai)
2. 进入 Settings（设置）页面
3. 生成一个新的 API 密钥
4. 复制并保存这个密钥

### 步骤 3: 查看可用的 GitHub 仓库

```bash
# 方式 1: 使用环境变量
export JULES_API_KEY="你的API密钥"
deno task list-sources

# 方式 2: 或者直接运行
deno run --allow-net --allow-read --allow-env main.ts --list-sources
```

你会看到类似这样的输出：

```
找到 2 个可用的源:

1. sources/github/myusername/myapp
   GitHub: myusername/myapp
   ID: github/myusername/myapp

2. sources/github/myusername/another-repo
   GitHub: myusername/another-repo
   ID: github/myusername/another-repo
```

### 步骤 4: 创建配置文件

复制示例配置并编辑：

```bash
cp tasks.example.json tasks.json
```

编辑 [`tasks.json`](tasks.json) 文件：

```json
{
  "apiKey": "你的API密钥",
  "delayBetweenTasks": 2000,
  "parallel": false,
  "tasks": [
    {
      "title": "添加 README 文件",
      "prompt": "Create a comprehensive README.md file for this project",
      "sourceContext": {
        "source": "sources/github/你的用户名/你的仓库名",
        "githubRepoContext": {
          "startingBranch": "main"
        }
      },
      "automationMode": "AUTO_CREATE_PR"
    }
  ]
}
```

### 步骤 5: 运行批量任务

```bash
# 使用 deno task
deno task start

# 或者直接运行
deno run --allow-net --allow-read --allow-env main.ts
```

### 步骤 6: 查看结果

程序会显示执行进度和结果：

```
========================================
Jules API 批量任务处理器
========================================
总任务数: 1
执行模式: 串行

[1/1]
开始执行任务: 添加 README 文件
提示词: Create a comprehensive README.md file for this project
✓ Session 创建成功，ID: 12345678901234567890
✓ PR 已创建: https://github.com/username/repo/pull/42

========================================
执行摘要
========================================
总耗时: 15.32秒
成功: 1
失败: 0

详细结果:
1. 添加 README 文件
   状态: ✓ 成功
   Session ID: 12345678901234567890
   PR: https://github.com/username/repo/pull/42
```

## 常用命令

```bash
# 执行批量任务（默认配置）
deno task start

# 执行批量任务（指定配置文件）
deno run --allow-net --allow-read --allow-env main.ts -c my-tasks.json

# 列出可用的 GitHub 源
deno task list-sources

# 查看帮助
deno run --allow-net --allow-read --allow-env main.ts --help

# 代码格式化
deno task fmt

# 代码检查
deno task lint
```

## 实用示例

### 示例 1: 一次修复多个 Bug

```json
{
  "apiKey": "your-api-key",
  "delayBetweenTasks": 3000,
  "tasks": [
    {
      "title": "修复登录 Bug",
      "prompt": "Fix the login authentication issue reported in GitHub issue #123",
      "sourceContext": {
        "source": "sources/github/myusername/myapp"
      },
      "automationMode": "AUTO_CREATE_PR"
    },
    {
      "title": "修复注册 Bug",
      "prompt": "Fix the email verification bug in registration process",
      "sourceContext": {
        "source": "sources/github/myusername/myapp"
      },
      "automationMode": "AUTO_CREATE_PR"
    }
  ]
}
```

### 示例 2: 为多个项目添加相同功能

```json
{
  "apiKey": "your-api-key",
  "parallel": true,
  "tasks": [
    {
      "title": "项目A - 添加测试",
      "prompt": "Add comprehensive unit tests for all API endpoints",
      "sourceContext": {
        "source": "sources/github/myusername/project-a"
      },
      "automationMode": "AUTO_CREATE_PR"
    },
    {
      "title": "项目B - 添加测试",
      "prompt": "Add comprehensive unit tests for all API endpoints",
      "sourceContext": {
        "source": "sources/github/myusername/project-b"
      },
      "automationMode": "AUTO_CREATE_PR"
    }
  ]
}
```

### 示例 3: 代码重构（需要审批）

```json
{
  "apiKey": "your-api-key",
  "tasks": [
    {
      "title": "重构用户模块",
      "prompt": "Refactor the user module to use TypeScript and improve code organization",
      "sourceContext": {
        "source": "sources/github/myusername/myapp"
      },
      "automationMode": "MANUAL",
      "requirePlanApproval": true
    }
  ]
}
```

## 下一步

查看完整文档 [`README.md`](README.md) 了解更多功能和配置选项。

## 遇到问题？

### API 密钥无效

- 确保在 Jules 网页应用中生成了有效的 API 密钥
- 检查密钥是否被正确复制（没有多余空格）
- 尝试重新生成一个新的 API 密钥

### 找不到源

- 确保在 Jules 网页应用中已安装 GitHub App
- 确保已授权至少一个 GitHub 仓库
- 使用 `deno task list-sources` 查看可用的源

### 任务执行失败

- 检查提示词是否清晰明确
- 确保源名称格式正确：`sources/github/owner/repo`
- 查看错误信息获取更多细节

需要更多帮助？查看 [`README.md`](README.md) 中的"故障排查"章节。