/**
 * Jules API 客户端
 */

import type { ListSourcesResponse, Session, Task } from "./types.ts";

const API_BASE_URL = "https://jules.googleapis.com/v1alpha";

export class JulesClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 获取请求头
   */
  private getHeaders(): HeadersInit {
    return {
      "X-Goog-Api-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * 列出所有可用的源
   */
  async listSources(): Promise<ListSourcesResponse> {
    const response = await fetch(`${API_BASE_URL}/sources`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list sources: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * 创建新的 session
   */
  async createSession(task: Task): Promise<Session> {
    const requestBody: Record<string, unknown> = {
      prompt: task.prompt,
      sourceContext: task.sourceContext,
      title: task.title,
      requirePlanApproval: task.requirePlanApproval || false,
    };

    // 只有在设置了 AUTO_CREATE_PR 时才添加 automationMode 字段
    if (task.automationMode === "AUTO_CREATE_PR") {
      requestBody.automationMode = task.automationMode;
    }

    const response = await fetch(`${API_BASE_URL}/sessions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create session: ${response.status} ${response.statusText}\n${errorText}`,
      );
    }

    return await response.json();
  }

  /**
   * 获取 session 详情
   */
  async getSession(sessionId: string): Promise<Session> {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to get session: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * 列出所有 sessions
   */
  async listSessions(pageSize: number = 10): Promise<{ sessions: Session[] }> {
    const response = await fetch(
      `${API_BASE_URL}/sessions?pageSize=${pageSize}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to list sessions: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }

  /**
   * 批准计划
   */
  async approvePlan(sessionId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}:approvePlan`,
      {
        method: "POST",
        headers: this.getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to approve plan: ${response.status} ${response.statusText}`,
      );
    }
  }

  /**
   * 发送消息到 session
   */
  async sendMessage(sessionId: string, prompt: string): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}:sendMessage`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to send message: ${response.status} ${response.statusText}`,
      );
    }
  }

  /**
   * 列出 session 的活动
   */
  async listActivities(
    sessionId: string,
    pageSize: number = 30,
  ): Promise<unknown> {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/activities?pageSize=${pageSize}`,
      {
        headers: this.getHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to list activities: ${response.status} ${response.statusText}`,
      );
    }

    return await response.json();
  }
}