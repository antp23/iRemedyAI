export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  description: string;
  capabilities: string[];
  model: string;
  version: string;
  config: AgentConfig;
  createdAt: string;
  updatedAt: string;
}

export type AgentType =
  | 'symptom-analyzer'
  | 'drug-interaction-checker'
  | 'treatment-recommender'
  | 'triage-assistant'
  | 'care-coordinator'
  | 'patient-educator'
  | 'scoring-engine';

export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'error';

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: AgentTool[];
  guardrails: AgentGuardrail[];
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, AgentToolParameter>;
}

export interface AgentToolParameter {
  type: string;
  description: string;
  required: boolean;
  enum?: string[];
}

export interface AgentGuardrail {
  id: string;
  type: GuardrailType;
  rule: string;
  action: 'warn' | 'block' | 'escalate';
}

export type GuardrailType =
  | 'content-filter'
  | 'medical-disclaimer'
  | 'scope-boundary'
  | 'confidence-threshold'
  | 'emergency-detection';

export interface AgentConversation {
  id: string;
  agentId: string;
  userId: string;
  messages: AgentMessage[];
  context: AgentContext;
  status: ConversationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  metadata?: AgentMessageMetadata;
  timestamp: string;
}

export interface AgentMessageMetadata {
  confidence?: number;
  sources?: string[];
  toolsUsed?: string[];
  processingTimeMs?: number;
}

export interface AgentContext {
  patientId?: string;
  sessionId?: string;
  symptoms?: string[];
  medications?: string[];
  recentScores?: Record<string, number>;
}

export type ConversationStatus = 'active' | 'paused' | 'completed' | 'escalated';

export interface AgentTaskResult {
  taskId: string;
  agentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  startedAt: string;
  completedAt?: string;
}
