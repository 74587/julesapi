# Jules API 批量任务处理器

这是一个使用 Deno 实现的 Jules API 批量任务处理工具，可以通过 JSON 配置文件批量执行多个 Jules API 任务。

## 功能特点

- ✅ 支持通过 JSON 配置文件批量执行任务
- ✅ 支持串行和并行执行模式
- ✅ 支持自动创建 PR 或手动模式
- ✅ 支持计划审批功能
- ✅ 详细的执行日志和结果摘要
- ✅ 支持列出所有可用的 GitHub 源

## 前置要求

1. 安装 [Deno](https://deno.land/) (推荐 v1.40+)
2. 拥有 Jules API 密钥（在 [Jules 网页应用](https://jules.ai) 设置页面生成）
3. 已在 Jules 网页应用中安装并授权 GitHub App

## 安装

克隆或下载此项目到本地：

```bash
git clone <your-repo-url>
cd julesapi
```

## 配置

### 1. 创建配置文件

复制示例配置文件并修改：

```bash
cp tasks.example.json tasks.json
```

### 2. 配置文件格式

```json
{
  "apiKey": "YOUR_API_KEY_HERE",
  "delayBetweenTasks": 2000,
  "parallel": false,
  "tasks": [
    {
      "title": "任务标题",
      "prompt": "任务描述和要求",
      "sourceContext": {
        "source": "sources/github/yourusername/yourrepo",
        "githubRepoContext": {
          "startingBranch": "main"
        }
      },
      "automationMode": "AUTO_CREATE_PR",
      "requirePlanApproval": false
    }
  ]
}
```

### 配置字段说明

#### 顶层配置

| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `apiKey` | string | ✓ | - | Jules API 密钥 |
| `tasks` | array | ✓ | - | 任务列表 |
| `delayBetweenTasks` | number | ✗ | 1000 | 任务间延迟时间（毫秒） |
| `parallel` | boolean | ✗ | false | 是否并行执行任务 |

#### 任务配置

| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| `title` | string | ✓ | - | 任务标题 |
| `prompt` | string | ✓ | - | 任务提示词 |
| `sourceContext` | object | ✓ | - | 源代码上下文 |
| `automationMode` | string | ✗ | "MANUAL" | 自动化模式：`AUTO_CREATE_PR` 或 `MANUAL` |
| `requirePlanApproval` | boolean | ✗ | false | 是否需要计划审批 |

#### 源代码上下文

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `source` | string | ✓ | 源名称（格式：sources/github/owner/repo） |
| `githubRepoContext.startingBranch` | string | ✗ | 起始分支，默认为 main |

## 使用方法

### 1. 查看任务执行进度

执行完批量任务后，你可以使用监控工具查看进度：

```bash
# 列出最近的 sessions
deno task list-sessions

# 或使用完整命令
deno run --allow-net --allow-read --allow-env monitor.ts --list

# 查看指定 session 的详情
deno run --allow-net --allow-read --allow-env monitor.ts -s <session_id>

# 查看 session 的活动历史（详细进度）
deno run --allow-net --allow-read --allow-env monitor.ts -a <session_id>

# 持续监控 session（实时刷新）
deno run --allow-net --allow-read --allow-env monitor.ts -w <session_id>
```

**示例：查看刚才创建的任务进度**
```bash
# 假设你的 session ID 是 3425633348274085696
export JULES_API_KEY="your-api-key"

# 查看详情
deno run --allow-net --allow-read --allow-env monitor.ts -s 3425633348274085696

# 查看活动历史（看到所有执行步骤）
deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696

# 持续监控（每5秒刷新一次）
deno run --allow-net --allow-read --allow-env monitor.ts -w 3425633348274085696
```

### 2. 列出可用的 GitHub 源

首先，列出你已授权的 GitHub 仓库：

```bash
deno run --allow-net --allow-read --allow-env main.ts --list-sources
```

或者设置环境变量：

```bash
export JULES_API_KEY="your-api-key"
deno run --allow-net --allow-read --allow-env main.ts -l
```

### 3. 执行批量任务

使用默认配置文件（tasks.json）：

```bash
deno run --allow-net --allow-read --allow-env main.ts
```

使用自定义配置文件：

```bash
deno run --allow-net --allow-read --allow-env main.ts --config my-tasks.json
```

使用环境变量提供 API Key：

```bash
export JULES_API_KEY="your-api-key"
deno run --allow-net --allow-read --allow-env main.ts
```

### 4. 查看帮助

```bash
deno run --allow-net --allow-read --allow-env main.ts --help
```

## 完整示例

### 示例 1：串行执行多个任务

```json
{
  "apiKey": "your-api-key",
  "delayBetweenTasks": 3000,
  "parallel": false,
  "tasks": [
    {
      "title": "添加登录功能",
      "prompt": "Add user login functionality with email and password",
      "sourceContext": {
        "source": "sources/github/myusername/myapp",
        "githubRepoContext": {
          "startingBranch": "main"
        }
      },
      "automationMode": "AUTO_CREATE_PR"
    },
    {
      "title": "添加注册功能",
      "prompt": "Add user registration with email verification",
      "sourceContext": {
        "source": "sources/github/myusername/myapp",
        "githubRepoContext": {
          "startingBranch": "main"
        }
      },
      "automationMode": "AUTO_CREATE_PR"
    }
  ]
}
```

### 示例 2：并行执行多个独立任务

```json
{
  "apiKey": "your-api-key",
  "parallel": true,
  "tasks": [
    {
      "title": "优化项目A性能",
      "prompt": "Optimize database queries and add caching",
      "sourceContext": {
        "source": "sources/github/myusername/project-a"
      },
      "automationMode": "AUTO_CREATE_PR"
    },
    {
      "title": "修复项目B的bug",
      "prompt": "Fix the authentication bug reported in issue #123",
      "sourceContext": {
        "source": "sources/github/myusername/project-b"
      },
      "automationMode": "AUTO_CREATE_PR"
    }
  ]
}
```

### 示例 3：需要计划审批的任务

```json
{
  "apiKey": "your-api-key",
  "tasks": [
    {
      "title": "重构数据库架构",
      "prompt": "Refactor the database schema to improve performance",
      "sourceContext": {
        "source": "sources/github/myusername/myapp"
      },
      "automationMode": "MANUAL",
      "requirePlanApproval": true
    }
  ]
}
```

## 输出说明

执行任务时会显示详细的进度信息：

```
========================================
Jules API 批量任务处理器
========================================
总任务数: 3
执行模式: 串行

[1/3]
开始执行任务: 添加登录功能
提示词: Add user login functionality with email and password
✓ Session 创建成功，ID: 12345678901234567890
✓ PR 已创建: https://github.com/username/repo/pull/42

等待 2000ms 后执行下一个任务...

[2/3]
...

========================================
执行摘要
========================================
总耗时: 45.32秒
成功: 2
失败: 1

详细结果:
1. 添加登录功能
   状态: ✓ 成功
   Session ID: 12345678901234567890
   PR: https://github.com/username/repo/pull/42

2. 添加注册功能
   状态: ✓ 成功
   Session ID: 09876543210987654321
   PR: https://github.com/username/repo/pull/43

3. 修复认证bug
   状态: ✗ 失败
   错误: Failed to create session: 401 Unauthorized
```

## 项目结构

```
julesapi/
├── batch_tasks/           # 批量任务处理模块
│   ├── mod.ts            # 模块导出
│   ├── types.ts          # 类型定义
│   ├── client.ts         # Jules API 客户端
│   └── processor.ts      # 批量任务处理器
├── main.ts               # 主程序入口
├── tasks.example.json    # 配置文件示例
├── tasks.json            # 实际配置文件（需要自己创建）
├── deno.json             # Deno 配置
└── README.md             # 本文档
```

## API 参考

项目基于 [Jules API](https://jules.googleapis.com) 构建。主要使用以下端点：

- `GET /v1alpha/sources` - 列出可用的源
- `POST /v1alpha/sessions` - 创建新的 session
- `GET /v1alpha/sessions/{id}` - 获取 session 详情
- `GET /v1alpha/sessions` - 列出所有 sessions
- `POST /v1alpha/sessions/{id}:approvePlan` - 批准计划
- `POST /v1alpha/sessions/{id}:sendMessage` - 发送消息
- `GET /v1alpha/sessions/{id}/activities` - 列出活动

## 注意事项

1. **API 密钥安全**：不要将 API 密钥提交到版本控制系统。建议使用环境变量或 `.env` 文件（已在 `.gitignore` 中）。

2. **速率限制**：Jules API 可能有速率限制。如果遇到限制，可以增加 `delayBetweenTasks` 的值。

3. **源名称格式**：源名称必须是 `sources/github/owner/repo` 格式。使用 `--list-sources` 命令查看可用的源。

4. **并行执行注意**：并行执行多个任务时，确保任务之间没有依赖关系。

5. **Alpha 版本**：Jules API 目前处于 alpha 阶段，API 规范可能会变化。

## 故障排查

### 问题：401 Unauthorized

**原因**：API 密钥无效或已过期。

**解决**：
1. 检查 API 密钥是否正确
2. 在 Jules 网页应用中重新生成 API 密钥
3. 确保 API 密钥没有被公开暴露（已暴露的密钥会被自动禁用）

### 问题：404 Not Found (源不存在)

**原因**：指定的源名称不正确或未授权。

**解决**：
1. 使用 `--list-sources` 命令查看可用的源
2. 确保在 Jules 网页应用中已安装并授权 GitHub App
3. 检查源名称格式是否正确

### 问题：任务执行缓慢

**原因**：Jules API 处理任务需要时间。

**解决**：
1. 这是正常现象，复杂任务可能需要几分钟
2. 可以在配置中设置 `requirePlanApproval: true` 来控制执行
3. 考虑将大任务拆分为多个小任务

## 开发

### 运行测试

```bash
deno test --allow-net --allow-read --allow-env
```

### 代码格式化

```bash
deno fmt
```

### 代码检查

```bash
deno lint
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [Jules API 文档](https://jules.google.com/settings#api)
