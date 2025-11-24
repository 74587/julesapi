#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * Jules API 批量任务处理器 - 主程序入口
 */

import { parseArgs } from "jsr:@std/cli/parse-args";
import { BatchTaskProcessor } from "./batch_tasks/mod.ts";
import type { TaskConfig } from "./batch_tasks/mod.ts";

const VERSION = "1.0.0";

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Jules API 批量任务处理器 v${VERSION}

用法:
  deno run --allow-net --allow-read --allow-env main.ts [选项]

选项:
  -c, --config <file>    指定任务配置文件路径 (默认: tasks.json)
  -l, --list-sources     列出所有可用的源
  -h, --help             显示帮助信息
  -v, --version          显示版本信息

示例:
  # 使用默认配置文件执行任务
  deno run --allow-net --allow-read --allow-env main.ts

  # 使用指定配置文件执行任务
  deno run --allow-net --allow-read --allow-env main.ts -c my-tasks.json

  # 列出所有可用的源
  deno run --allow-net --allow-read --allow-env main.ts -l

配置文件格式 (JSON):
  {
    "apiKey": "YOUR_API_KEY",
    "delayBetweenTasks": 2000,
    "parallel": false,
    "tasks": [
      {
        "title": "任务标题",
        "prompt": "任务提示词",
        "sourceContext": {
          "source": "sources/github/username/repo",
          "githubRepoContext": {
            "startingBranch": "main"
          }
        },
        "automationMode": "AUTO_CREATE_PR",
        "requirePlanApproval": false
      }
    ]
  }
`);
}

/**
 * 显示版本信息
 */
function showVersion() {
  console.log(`Jules API 批量任务处理器 v${VERSION}`);
}

/**
 * 加载配置文件
 */
async function loadConfig(configPath: string): Promise<TaskConfig> {
  try {
    const content = await Deno.readTextFile(configPath);
    const config = JSON.parse(content) as TaskConfig;

    // 验证必需字段
    if (!config.apiKey) {
      throw new Error("配置文件缺少 apiKey 字段");
    }

    if (!config.tasks || config.tasks.length === 0) {
      throw new Error("配置文件缺少 tasks 字段或任务列表为空");
    }

    return config;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      throw new Error(`配置文件不存在: ${configPath}`);
    }
    throw error;
  }
}

/**
 * 列出所有可用的源
 */
async function listSources(apiKey: string) {
  const config: TaskConfig = {
    apiKey,
    tasks: [],
  };

  const processor = new BatchTaskProcessor(config);

  try {
    console.log("\n正在获取可用的源...\n");
    const response = await processor.listSources();

    if (!response.sources || response.sources.length === 0) {
      console.log("未找到可用的源。");
      console.log("请先在 Jules 网页应用中安装 GitHub App。");
      return;
    }

    console.log(`找到 ${response.sources.length} 个可用的源:\n`);

    response.sources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.name}`);
      if (source.githubRepo) {
        console.log(
          `   GitHub: ${source.githubRepo.owner}/${source.githubRepo.repo}`,
        );
      }
      console.log(`   ID: ${source.id}`);
      console.log();
    });
  } catch (error) {
    console.error("获取源列表失败:", error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["help", "version", "list-sources"],
    string: ["config"],
    alias: {
      h: "help",
      v: "version",
      c: "config",
      l: "list-sources",
    },
    default: {
      config: "tasks.json",
    },
  });

  // 显示帮助
  if (args.help) {
    showHelp();
    return;
  }

  // 显示版本
  if (args.version) {
    showVersion();
    return;
  }

  // 列出源
  if (args["list-sources"]) {
    // 尝试从环境变量或配置文件获取 API Key
    let apiKey = Deno.env.get("JULES_API_KEY");

    if (!apiKey) {
      try {
        const config = await loadConfig(args.config as string);
        apiKey = config.apiKey;
      } catch {
        console.error(
          "错误: 需要 API Key。请设置 JULES_API_KEY 环境变量或在配置文件中提供。",
        );
        Deno.exit(1);
      }
    }

    await listSources(apiKey);
    return;
  }

  // 执行批量任务
  try {
    console.log(`正在加载配置文件: ${args.config}\n`);
    const config = await loadConfig(args.config as string);

    // 支持从环境变量覆盖 API Key
    const apiKey = Deno.env.get("JULES_API_KEY") || config.apiKey;
    config.apiKey = apiKey;

    const processor = new BatchTaskProcessor(config);
    await processor.execute();
  } catch (error) {
    console.error(
      "\n执行失败:",
      error instanceof Error ? error.message : error,
    );
    Deno.exit(1);
  }
}

// 运行主函数
if (import.meta.main) {
  main();
}