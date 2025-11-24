/**
 * 类型定义
 */

/** GitHub 仓库上下文 */
export interface GithubRepoContext {
  startingBranch: string;
}

/** 源代码上下文 */
export interface SourceContext {
  source: string;
  githubRepoContext?: GithubRepoContext;
}

/**
 * 自动化模式
 * - AUTO_CREATE_PR: 自动创建 Pull Request
 * - 不设置此字段: 手动模式，不自动创建 PR
 */
export type AutomationMode = "AUTO_CREATE_PR";

/** 单个任务配置 */
export interface Task {
  /** 任务标题 */
  title: string;
  /** 任务提示词 */
  prompt: string;
  /** 源代码上下文 */
  sourceContext: SourceContext;
  /** 自动化模式，默认为 MANUAL */
  automationMode?: AutomationMode;
  /** 是否需要计划审批，默认为 false */
  requirePlanApproval?: boolean;
}

/** 批量任务配置 */
export interface TaskConfig {
  /** API 密钥 */
  apiKey: string;
  /** 任务列表 */
  tasks: Task[];
  /** 任务间延迟时间（毫秒），默认为 1000 */
  delayBetweenTasks?: number;
  /** 是否并行执行，默认为 false */
  parallel?: boolean;
}

/** Pull Request 信息 */
export interface PullRequest {
  url: string;
  title: string;
  description: string;
}

/** Session 输出 */
export interface SessionOutput {
  pullRequest?: PullRequest;
}

/** Session 信息 */
export interface Session {
  name: string;
  id: string;
  title: string;
  sourceContext: SourceContext;
  prompt: string;
  outputs?: SessionOutput[];
}

/** Session 创建结果 */
export interface SessionResult {
  task: Task;
  session?: Session;
  error?: string;
  success: boolean;
}

/** 源信息 */
export interface Source {
  name: string;
  id: string;
  githubRepo?: {
    owner: string;
    repo: string;
  };
}

/** 源列表响应 */
export interface ListSourcesResponse {
  sources: Source[];
  nextPageToken?: string;
}