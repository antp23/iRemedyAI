import { useCallback, useRef } from 'react';
import { useAgentStore } from '@/store';
import type { AgentPhase } from '@/store';
import {
  runNdcLookup,
  processPasteData,
  processUrl,
} from '@/services/claude';
import type { AgentLogEntry as ClaudeLogEntry, AgentResult, NdcAgentPhase } from '@/services/claude';

export function useAgent() {
  const phase = useAgentStore((s) => s.currentPhase);
  const status = useAgentStore((s) => s.status);
  const logs = useAgentStore((s) => s.logs);
  const startAgentAction = useAgentStore((s) => s.startAgent);
  const setPhase = useAgentStore((s) => s.setPhase);
  const addLog = useAgentStore((s) => s.addLog);
  const completeAgent = useAgentStore((s) => s.completeAgent);
  const cancelAgentAction = useAgentStore((s) => s.cancelAgent);
  const resetAgentAction = useAgentStore((s) => s.resetAgent);

  const abortRef = useRef<AbortController | null>(null);

  const mapLogToStore = useCallback(
    (entry: ClaudeLogEntry) => {
      addLog({
        phase: mapClaudePhaseToAgentPhase(entry.phase),
        message: entry.message,
        level: entry.type === 'error' ? 'error' : 'info',
        metadata: { claudePhase: entry.phase },
      });
    },
    [addLog],
  );

  const runAgent = useCallback(
    async (
      requestType: string,
      fn: (onLog: (entry: ClaudeLogEntry) => void) => Promise<AgentResult>,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      startAgentAction({
        id: `req-${Date.now()}`,
        type: requestType,
        payload: {},
        startedAt: new Date().toISOString(),
      });

      try {
        const result = await fn(mapLogToStore);
        if (!controller.signal.aborted) {
          if (result.status === 'completed') {
            completeAgent();
          } else {
            setPhase('error');
            addLog({
              phase: 'error',
              message: result.error ?? 'Agent execution failed',
              level: 'error',
            });
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setPhase('error');
          addLog({
            phase: 'error',
            message: `Agent error: ${message}`,
            level: 'error',
          });
          console.error('Agent execution failed:', err);
        }
      }
    },
    [startAgentAction, completeAgent, setPhase, addLog, mapLogToStore],
  );

  const startLookup = useCallback(
    (query: string) => runAgent('ndc-lookup', (onLog) => runNdcLookup(query, onLog)),
    [runAgent],
  );

  const startPaste = useCallback(
    (text: string) => runAgent('paste-data', (onLog) => processPasteData(text, onLog)),
    [runAgent],
  );

  const startUrl = useCallback(
    (url: string) => runAgent('url-process', (onLog) => processUrl(url, onLog)),
    [runAgent],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    cancelAgentAction();
  }, [cancelAgentAction]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    resetAgentAction();
  }, [resetAgentAction]);

  return {
    phase,
    status,
    logs,
    startLookup,
    startPaste,
    startUrl,
    cancel,
    reset,
  };
}

function mapClaudePhaseToAgentPhase(ndcPhase: NdcAgentPhase): AgentPhase {
  switch (ndcPhase) {
    case 'fda-data':
      return 'collecting';
    case 'origin-hunt':
      return 'analyzing';
    case 'pricing':
      return 'scoring';
    case 'compilation':
      return 'reporting';
  }
}
