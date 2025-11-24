#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

/**
 * Jules API Session 监控工具
 * 用于查看 session 的执行进度和活动
 */

import { parseArgs } from "jsr:@std/cli/parse-args";
import { JulesClient } from "./batch_tasks/mod.ts";

const VERSION = "1.0.0";

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log(`
Jules API Session 监控工具 v${VERSION}

用法:
  deno run --allow-net --allow-read --allow-env monitor.ts [选项]

选项:
  -s, --session <id>     查看指定 session 的详情
  -a, --activities <id>  查看指定 session 的活动列表
  -l, --list             列出最近的 sessions
  -n, --number <num>     列出的 session 数量 (默认: 10)
  -w, --watch <id>       持续监控指定 session (每5秒刷新)
  -h, --help             显示帮助信息

示例:
  # 列出最近10个 sessions
  deno run --allow-net --allow-read --allow-env monitor.ts --list

  # 查看指定 session 的详情
  deno run --allow-net --allow-read --allow-env monitor.ts -s 3425633348274085696

  # 查看 session 的活动历史
  deno run --allow-net --allow-read --allow-env monitor.ts -a 3425633348274085696

  # 持续监控 session
  deno run --allow-net --allow-read --allow-env monitor.ts -w 3425633348274085696

环境变量:
  JULES_API_KEY - Jules API 密钥
`);
}

/**
 * 获取 API Key
 */
function getApiKey(): string {
  const apiKey = Deno.env.get("JULES_API_KEY");
  if (!apiKey) {
    console.error("错误: 需要设置 JULES_API_KEY 环境变量");
    Deno.exit(1);
  }
  return apiKey;
}

/**
 * 格式化时间
 */
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * 列出最近的 sessions
 */
async function listSessions(client: JulesClient, pageSize: number) {
  console.log(`\n正在获取最近 ${pageSize} 个 sessions...\n`);

  try {
    const response = await client.listSessions(pageSize);

    if (!response.sessions || response.sessions.length === 0) {
      console.log("未找到任何 sessions");
      return;
    }

    console.log(`找到 ${response.sessions.length} 个 sessions:\n`);
    console.log("ID".padEnd(25) + "标题".padEnd(30) + "提示词");
    console.log("-".repeat(80));

    response.sessions.forEach((session) => {
      const id = session.id.substring(0, 20);
      const title = session.title.substring(0, 28);
      const prompt = session.prompt.substring(0, 30);
      console.log(`${id.padEnd(25)}${title.padEnd(30)}${prompt}`);
    });

    console.log("\n提示: 使用 -s <session_id> 查看详情");
  } catch (error) {
    console.error("获取 sessions 失败:", error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

/**
 * 查看 session 详情
 */
async function getSessionDetails(client: JulesClient, sessionId: string) {
  console.log(`\n正在获取 session ${sessionId} 的详情...\n`);

  try {
    const session = await client.getSession(sessionId);

    console.log("========================================");
    console.log("Session 详情");
    console.log("========================================");
    console.log(`ID: ${session.id}`);
    console.log(`标题: ${session.title}`);
    console.log(`提示词: ${session.prompt}`);
    console.log(`源: ${session.sourceContext.source}`);
    if (session.sourceContext.githubRepoContext) {
      console.log(`分支: ${session.sourceContext.githubRepoContext.startingBranch}`);
    }

    if (session.outputs && session.outputs.length > 0) {
      console.log("\n输出:");
      session.outputs.forEach((output, index) => {
        if (output.pullRequest) {
          console.log(`\n  PR #${index + 1}:`);
          console.log(`    URL: ${output.pullRequest.url}`);
          console.log(`    标题: ${output.pullRequest.title}`);
          console.log(`    描述: ${output.pullRequest.description}`);
        }
      });
    } else {
      console.log("\n状态: 进行中（尚无输出）");
    }

    console.log("\n提示: 使用 -a <session_id> 查看活动历史");
  } catch (error) {
    console.error("获取 session 详情失败:", error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

/**
 * 查看 session 活动
 */
async function getSessionActivities(client: JulesClient, sessionId: string) {
  console.log(`\n正在获取 session ${sessionId} 的活动...\n`);

  try {
    const response = await client.listActivities(sessionId, 50) as {
      activities?: Array<{
        createTime: string;
        originator: string;
        planGenerated?: { plan: { steps: Array<{ title: string }> } };
        planApproved?: unknown;
        progressUpdated?: { title: string; description?: string };
        sessionCompleted?: unknown;
      }>;
    };

    if (!response.activities || response.activities.length === 0) {
      console.log("未找到活动记录");
      return;
    }

    console.log(`找到 ${response.activities.length} 条活动:\n`);

    response.activities.forEach((activity, index) => {
      console.log(`[${index + 1}] ${formatTime(activity.createTime)} - ${activity.originator === "agent" ? "代理" : "用户"}`);

      if (activity.planGenerated) {
        console.log(`    📋 生成计划 (${activity.planGenerated.plan.steps.length} 步骤):`);
        activity.planGenerated.plan.steps.forEach((step, i) => {
          console.log(`       ${i + 1}. ${step.title}`);
        });
      } else if (activity.planApproved) {
        console.log("    ✅ 计划已批准");
      } else if (activity.progressUpdated) {
        console.log(`    🔄 进度更新: ${activity.progressUpdated.title}`);
        if (activity.progressUpdated.description) {
          console.log(`       ${activity.progressUpdated.description}`);
        }
      } else if (activity.sessionCompleted) {
        console.log("    ✨ Session 已完成");
      }
      console.log();
    });
  } catch (error) {
    console.error("获取活动失败:", error instanceof Error ? error.message : error);
    Deno.exit(1);
  }
}

/**
 * 持续监控 session
 */
async function watchSession(client: JulesClient, sessionId: string) {
  console.log(`\n开始监控 session ${sessionId}...`);
  console.log("按 Ctrl+C 停止监控\n");

  let lastActivityCount = 0;

  while (true) {
    try {
      // 清屏 (仅在终端支持时)
      console.log("\x1Bc");
      console.log(`监控 Session: ${sessionId}`);
      console.log(`刷新时间: ${new Date().toLocaleString("zh-CN")}`);
      console.log("=".repeat(60));

      const session = await client.getSession(sessionId);
      const activities = await client.listActivities(sessionId, 10) as {
        activities?: Array<{
          createTime: string;
          originator: string;
          progressUpdated?: { title: string };
          sessionCompleted?: unknown;
        }>;
      };

      console.log(`\n标题: ${session.title}`);
      console.log(`提示词: ${session.prompt}`);

      if (session.outputs && session.outputs.length > 0) {
        console.log("\n✅ 输出:");
        session.outputs.forEach((output) => {
          if (output.pullRequest) {
            console.log(`   PR: ${output.pullRequest.url}`);
          }
        });
      }

      if (activities.activities && activities.activities.length > 0) {
        const currentCount = activities.activities.length;
        if (currentCount > lastActivityCount) {
          console.log(`\n🆕 新活动 (+${currentCount - lastActivityCount})`);
          lastActivityCount = currentCount;
        }

        console.log("\n📝 最近活动:");
        activities.activities.slice(0, 5).forEach((activity) => {
          const time = formatTime(activity.createTime);
          const who = activity.originator === "agent" ? "代理" : "用户";

          if (activity.progressUpdated) {
            console.log(`   [${time}] ${who}: ${activity.progressUpdated.title}`);
          } else if (activity.sessionCompleted) {
            console.log(`   [${time}] ✨ Session 已完成`);
          }
        });
      }

      console.log("\n下次刷新: 5秒后...");

      // 等待5秒
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } catch (error) {
      console.error("\n监控出错:", error instanceof Error ? error.message : error);
      console.log("5秒后重试...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

/**
 * 主函数
 */
async function main() {
  const args = parseArgs(Deno.args, {
    boolean: ["help", "list"],
    string: ["session", "activities", "watch", "number"],
    alias: {
      h: "help",
      l: "list",
      s: "session",
      a: "activities",
      w: "watch",
      n: "number",
    },
    default: {
      number: "10",
    },
  });

  if (args.help) {
    showHelp();
    return;
  }

  const apiKey = getApiKey();
  const client = new JulesClient(apiKey);

  if (args.list) {
    await listSessions(client, parseInt(args.number as string));
  } else if (args.session) {
    await getSessionDetails(client, args.session as string);
  } else if (args.activities) {
    await getSessionActivities(client, args.activities as string);
  } else if (args.watch) {
    await watchSession(client, args.watch as string);
  } else {
    console.log("请指定一个操作。使用 --help 查看帮助信息。");
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}