export interface ChatSession {
  id: string;
  userId: string;
  agentId: string;
  title: string;
  messages: ChatMessage[];
  status: ChatStatus;
  metadata: ChatMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: ChatRole;
  content: string;
  attachments?: ChatAttachment[];
  metadata?: ChatMessageMetadata;
  timestamp: string;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatStatus = 'active' | 'archived' | 'deleted';

export interface ChatAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export type AttachmentType = 'image' | 'document' | 'lab-report' | 'prescription';

export interface ChatMessageMetadata {
  confidence?: number;
  sources?: ChatSource[];
  suggestedActions?: SuggestedAction[];
  disclaimer?: string;
  processingTimeMs?: number;
}

export interface ChatSource {
  title: string;
  url?: string;
  type: 'medical-database' | 'clinical-guideline' | 'drug-reference' | 'research-paper';
}

export interface SuggestedAction {
  label: string;
  type: 'navigate' | 'schedule' | 'refill' | 'call' | 'message';
  payload: Record<string, string>;
}

export interface ChatMetadata {
  topic?: string;
  symptomsDiscussed?: string[];
  medicationsDiscussed?: string[];
  escalated: boolean;
  escalatedTo?: string;
}
