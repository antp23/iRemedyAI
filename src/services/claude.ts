import type { AgentTaskResult } from '@/types';

export interface ClaudeAgentOptions {
  onLog?: (message: string, level: 'info' | 'warn' | 'error') => void;
  signal?: AbortSignal;
}

export async function startLookup(
  query: string,
  options?: ClaudeAgentOptions,
): Promise<AgentTaskResult> {
  options?.onLog?.(`Starting lookup for: ${query}`, 'info');
  // TODO: Wire to actual Claude API
  return {
    taskId: crypto.randomUUID(),
    agentId: 'drug-interaction-checker',
    status: 'pending',
    startedAt: new Date().toISOString(),
  };
}

export async function startPaste(
  text: string,
  options?: ClaudeAgentOptions,
): Promise<AgentTaskResult> {
  options?.onLog?.(`Processing pasted text (${text.length} chars)`, 'info');
  // TODO: Wire to actual Claude API
  return {
    taskId: crypto.randomUUID(),
    agentId: 'drug-interaction-checker',
    status: 'pending',
    startedAt: new Date().toISOString(),
  };
}

export async function startUrl(
  url: string,
  options?: ClaudeAgentOptions,
): Promise<AgentTaskResult> {
  options?.onLog?.(`Fetching URL: ${url}`, 'info');
  // TODO: Wire to actual Claude API
  return {
    taskId: crypto.randomUUID(),
    agentId: 'drug-interaction-checker',
    status: 'pending',
    startedAt: new Date().toISOString(),
  };
}
