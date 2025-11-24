/**
 * 批量任务处理器
 */

import { JulesClient } from "./client.ts";
import type { SessionResult, Task, TaskConfig } from "./types.ts";

export class BatchTaskProcessor {
  private client: JulesClient;
  private config: TaskConfig;

  constructor(config: TaskConfig) {
    this.config = config;
    this.client = new JulesClient(config.apiKey);
  }

  /**
   * 执行单个任务
   */
  private async executeTask(task: Task): Promise<SessionResult> {
    console.log(`\n开始执行任务: ${task.title}`);
    console.log(`提示词: ${task.prompt}`);

    try {
      // 创建 session
      const session = await this.client.createSession(task);
      console.log(`✓ Session 创建成功，ID: ${session.id}`);

      // 等待一段时间让 session 处理
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 获取最新的 session 状态
      const updatedSession = await this.client.getSession(session.id);

      // 检查是否有 PR 输出
      if (updatedSession.outputs && updatedSession.outputs.length > 0) {
        const pr = updatedSession.outputs[0].pullRequest;
        if (pr) {
          console.log(`✓ PR 已创建: ${pr.url}`);
        }
      }

      return {
        task,
        session: updatedSession,
        success: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ 任务执行失败: ${errorMessage}`);

      return {
        task,
        error: errorMessage,
        success: false,
      };
    }
  }

  /**
   * 延迟执行
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 串行执行所有任务
   */
  private async executeSequentially(): Promise<SessionResult[]> {
    const results: SessionResult[] = [];
    const delayTime = this.config.delayBetweenTasks || 1000;

    for (let i = 0; i < this.config.tasks.length; i++) {
      const task = this.config.tasks[i];
      console.log(`\n[${i + 1}/${this.config.tasks.length}]`);

      const result = await this.executeTask(task);
      results.push(result);

      // 如果不是最后一个任务，则延迟
      if (i < this.config.tasks.length - 1) {
        console.log(`等待 ${delayTime}ms 后执行下一个任务...`);
        await this.delay(delayTime);
      }
    }

    return results;
  }

  /**
   * 并行执行所有任务
   */
  private async executeInParallel(): Promise<SessionResult[]> {
    console.log(`\n并行执行 ${this.config.tasks.length} 个任务...`);

    const promises = this.config.tasks.map((task) => this.executeTask(task));
    return await Promise.all(promises);
  }

  /**
   * 执行所有任务
   */
  async execute(): Promise<SessionResult[]> {
    console.log("\n========================================");
    console.log("Jules API 批量任务处理器");
    console.log("========================================");
    console.log(`总任务数: ${this.config.tasks.length}`);
    console.log(
      `执行模式: ${this.config.parallel ? "并行" : "串行"}`,
    );

    const startTime = Date.now();

    const results = this.config.parallel
      ? await this.executeInParallel()
      : await this.executeSequentially();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // 打印摘要
    console.log("\n========================================");
    console.log("执行摘要");
    console.log("========================================");
    console.log(`总耗时: ${duration}秒`);
    console.log(`成功: ${results.filter((r) => r.success).length}`);
    console.log(`失败: ${results.filter((r) => !r.success).length}`);

    // 打印详细结果
    console.log("\n详细结果:");
    results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.task.title}`);
      if (result.success && result.session) {
        console.log(`   状态: ✓ 成功`);
        console.log(`   Session ID: ${result.session.id}`);
        if (result.session.outputs && result.session.outputs.length > 0) {
          const pr = result.session.outputs[0].pullRequest;
          if (pr) {
            console.log(`   PR: ${pr.url}`);
          }
        }
      } else {
        console.log(`   状态: ✗ 失败`);
        console.log(`   错误: ${result.error}`);
      }
    });

    return results;
  }

  /**
   * 列出所有可用的源
   */
  async listSources() {
    return await this.client.listSources();
  }
}