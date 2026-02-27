import { create } from 'zustand';

export type AgentPhase = 'idle' | 'lookup' | 'paste' | 'url';
export type AgentRunStatus = 'idle' | 'running' | 'success' | 'error';

export interface AgentLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export interface AgentState {
  phase: AgentPhase;
  status: AgentRunStatus;
  logs: AgentLogEntry[];
  error: string | null;
  setPhase: (phase: AgentPhase) => void;
  setStatus: (status: AgentRunStatus) => void;
  addLog: (entry: AgentLogEntry) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  phase: 'idle' as AgentPhase,
  status: 'idle' as AgentRunStatus,
  logs: [] as AgentLogEntry[],
  error: null as string | null,
};

export const useAgentStore = create<AgentState>((set) => ({
  ...initialState,
  setPhase: (phase) => set({ phase }),
  setStatus: (status) => set({ status }),
  addLog: (entry) => set((state) => ({ logs: [...state.logs, entry] })),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
