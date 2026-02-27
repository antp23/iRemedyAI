import { describe, it, expect, beforeEach } from 'vitest';
import { useAgentStore } from '../agentStore';
import type { AgentRequest } from '../agentStore';

function makeRequest(overrides: Partial<AgentRequest> = {}): AgentRequest {
  return {
    id: 'req-1',
    type: 'scoring',
    payload: { patientId: 'patient-123' },
    startedAt: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('agentStore', () => {
  beforeEach(() => {
    useAgentStore.getState().resetAgent();
  });

  describe('initial state', () => {
    it('should start in idle phase and status', () => {
      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('idle');
      expect(state.status).toBe('idle');
      expect(state.logs).toHaveLength(0);
      expect(state.activeRequest).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('startAgent', () => {
    it('should transition to initializing phase with running status', () => {
      useAgentStore.getState().startAgent(makeRequest());

      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('initializing');
      expect(state.status).toBe('running');
      expect(state.activeRequest).toEqual(makeRequest());
    });

    it('should create an initial log entry', () => {
      useAgentStore.getState().startAgent(makeRequest());

      const { logs } = useAgentStore.getState();
      expect(logs).toHaveLength(1);
      expect(logs[0].phase).toBe('initializing');
      expect(logs[0].level).toBe('info');
      expect(logs[0].message).toContain('scoring');
    });

    it('should clear any previous error', () => {
      // Simulate an error state first
      useAgentStore.setState({ error: 'Previous error' });

      useAgentStore.getState().startAgent(makeRequest());
      expect(useAgentStore.getState().error).toBeNull();
    });
  });

  describe('phase transitions', () => {
    it('should transition through phases sequentially', () => {
      useAgentStore.getState().startAgent(makeRequest());

      useAgentStore.getState().setPhase('collecting');
      expect(useAgentStore.getState().currentPhase).toBe('collecting');

      useAgentStore.getState().setPhase('analyzing');
      expect(useAgentStore.getState().currentPhase).toBe('analyzing');

      useAgentStore.getState().setPhase('scoring');
      expect(useAgentStore.getState().currentPhase).toBe('scoring');

      useAgentStore.getState().setPhase('recommending');
      expect(useAgentStore.getState().currentPhase).toBe('recommending');

      useAgentStore.getState().setPhase('reporting');
      expect(useAgentStore.getState().currentPhase).toBe('reporting');
    });

    it('should log each phase transition', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().setPhase('collecting');
      useAgentStore.getState().setPhase('analyzing');

      const { logs } = useAgentStore.getState();
      // 1 from startAgent + 2 from setPhase
      expect(logs).toHaveLength(3);
      expect(logs[1].message).toContain('collecting');
      expect(logs[2].message).toContain('analyzing');
    });

    it('should set error level log for error phase', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().setPhase('error');

      const { logs } = useAgentStore.getState();
      const errorLog = logs[logs.length - 1];
      expect(errorLog.level).toBe('error');
    });
  });

  describe('addLog', () => {
    it('should append a log entry with auto-generated id and timestamp', () => {
      useAgentStore.getState().addLog({
        phase: 'analyzing',
        message: 'Processing data set',
        level: 'info',
      });

      const { logs } = useAgentStore.getState();
      expect(logs).toHaveLength(1);
      expect(logs[0].id).toBeDefined();
      expect(logs[0].timestamp).toBeDefined();
      expect(logs[0].message).toBe('Processing data set');
    });

    it('should accumulate logs over time', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().addLog({ phase: 'collecting', message: 'Log 1', level: 'info' });
      useAgentStore.getState().addLog({ phase: 'collecting', message: 'Log 2', level: 'debug' });
      useAgentStore.getState().addLog({ phase: 'analyzing', message: 'Log 3', level: 'warn' });

      expect(useAgentStore.getState().logs).toHaveLength(4); // 1 from start + 3 added
    });

    it('should support metadata on log entries', () => {
      useAgentStore.getState().addLog({
        phase: 'scoring',
        message: 'Score computed',
        level: 'info',
        metadata: { score: 85, category: 'mia' },
      });

      const { logs } = useAgentStore.getState();
      expect(logs[0].metadata).toEqual({ score: 85, category: 'mia' });
    });
  });

  describe('completeAgent', () => {
    it('should transition to completed phase and status', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().setPhase('reporting');
      useAgentStore.getState().completeAgent();

      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('completed');
      expect(state.status).toBe('completed');
    });

    it('should add a completion log entry', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().completeAgent();

      const { logs } = useAgentStore.getState();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.phase).toBe('completed');
      expect(lastLog.message).toContain('completed successfully');
    });
  });

  describe('cancelAgent', () => {
    it('should transition to idle phase with cancelled status', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().setPhase('analyzing');
      useAgentStore.getState().cancelAgent();

      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('idle');
      expect(state.status).toBe('cancelled');
      expect(state.activeRequest).toBeNull();
    });

    it('should log the cancellation with warn level', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().cancelAgent();

      const { logs } = useAgentStore.getState();
      const lastLog = logs[logs.length - 1];
      expect(lastLog.level).toBe('warn');
      expect(lastLog.message).toContain('cancelled');
    });
  });

  describe('resetAgent', () => {
    it('should reset all state to initial values', () => {
      useAgentStore.getState().startAgent(makeRequest());
      useAgentStore.getState().setPhase('analyzing');
      useAgentStore.getState().addLog({ phase: 'analyzing', message: 'test', level: 'info' });

      useAgentStore.getState().resetAgent();

      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('idle');
      expect(state.status).toBe('idle');
      expect(state.logs).toHaveLength(0);
      expect(state.activeRequest).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('full lifecycle', () => {
    it('should track complete agent execution from start to finish', () => {
      const request = makeRequest({ type: 'full-analysis' });

      useAgentStore.getState().startAgent(request);
      expect(useAgentStore.getState().status).toBe('running');

      useAgentStore.getState().setPhase('collecting');
      useAgentStore.getState().addLog({ phase: 'collecting', message: 'Gathered 10 records', level: 'info' });

      useAgentStore.getState().setPhase('analyzing');
      useAgentStore.getState().addLog({ phase: 'analyzing', message: 'Analysis in progress', level: 'info' });

      useAgentStore.getState().setPhase('scoring');
      useAgentStore.getState().setPhase('recommending');
      useAgentStore.getState().setPhase('reporting');

      useAgentStore.getState().completeAgent();

      const state = useAgentStore.getState();
      expect(state.currentPhase).toBe('completed');
      expect(state.status).toBe('completed');
      // 1 (start) + 5 (phases) + 2 (manual logs) + 1 (complete) = 9
      expect(state.logs).toHaveLength(9);
    });
  });
});
