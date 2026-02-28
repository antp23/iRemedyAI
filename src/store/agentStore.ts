import { create } from 'zustand';

// Agent execution phases for the multi-step agent pipeline
export type AgentPhase =
  | 'idle'
  | 'initializing'
  | 'collecting'
  | 'analyzing'
  | 'scoring'
  | 'recommending'
  | 'reporting'
  | 'completed'
  | 'error';

// Execution status distinct from AgentPhase
export type AgentExecutionStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled' | 'error';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  phase: AgentPhase;
  message: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  metadata?: Record<string, unknown>;
}

export interface AgentRequest {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  startedAt: string;
}

interface AgentState {
  currentPhase: AgentPhase;
  status: AgentExecutionStatus;
  logs: AgentLogEntry[];
  activeRequest: AgentRequest | null;
  error: string | null;
}

interface AgentActions {
  startAgent(request: AgentRequest): void;
  addLog(entry: Omit<AgentLogEntry, 'id' | 'timestamp'>): void;
  setPhase(phase: AgentPhase): void;
  completeAgent(): void;
  cancelAgent(): void;
  resetAgent(): void;
}

export type AgentStore = AgentState & AgentActions;

let logCounter = 0;

function generateLogId(): string {
  logCounter += 1;
  return `log-${Date.now()}-${logCounter}`;
}

export const useAgentStore = create<AgentStore>((set) => ({
  currentPhase: 'idle',
  status: 'idle',
  logs: [],
  activeRequest: null,
  error: null,

  startAgent(request: AgentRequest) {
    set({
      currentPhase: 'initializing',
      status: 'running',
      activeRequest: request,
      error: null,
      logs: [
        {
          id: generateLogId(),
          timestamp: new Date().toISOString(),
          phase: 'initializing',
          message: `Agent started for request: ${request.type}`,
          level: 'info',
        },
      ],
    });
  },

  addLog(entry: Omit<AgentLogEntry, 'id' | 'timestamp'>) {
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...entry,
          id: generateLogId(),
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  },

  setPhase(phase: AgentPhase) {
    set((state) => ({
      currentPhase: phase,
      error: phase === 'error' ? state.error : null,
      logs: [
        ...state.logs,
        {
          id: generateLogId(),
          timestamp: new Date().toISOString(),
          phase,
          message: `Phase transitioned to: ${phase}`,
          level: phase === 'error' ? 'error' : 'info',
        },
      ],
    }));
  },

  completeAgent() {
    set((state) => ({
      currentPhase: 'completed',
      status: 'completed',
      logs: [
        ...state.logs,
        {
          id: generateLogId(),
          timestamp: new Date().toISOString(),
          phase: 'completed',
          message: 'Agent execution completed successfully',
          level: 'info',
        },
      ],
    }));
  },

  cancelAgent() {
    set((state) => ({
      currentPhase: 'idle',
      status: 'cancelled',
      activeRequest: null,
      logs: [
        ...state.logs,
        {
          id: generateLogId(),
          timestamp: new Date().toISOString(),
          phase: state.currentPhase,
          message: 'Agent execution cancelled',
          level: 'warn',
        },
      ],
    }));
  },

  resetAgent() {
    logCounter = 0;
    set({
      currentPhase: 'idle',
      status: 'idle',
      logs: [],
      activeRequest: null,
      error: null,
    });
  },
}));
