import { useCallback, useRef } from 'react';
import { useAgentStore } from '@/store';
import type { AgentPhase } from '@/store';
import * as claude from '@/services/claude';

export function useAgent() {
  const phase = useAgentStore((s) => s.phase);
  const status = useAgentStore((s) => s.status);
  const logs = useAgentStore((s) => s.logs);
  const setPhase = useAgentStore((s) => s.setPhase);
  const setStatus = useAgentStore((s) => s.setStatus);
  const addLog = useAgentStore((s) => s.addLog);
  const setError = useAgentStore((s) => s.setError);
  const storeReset = useAgentStore((s) => s.reset);

  const abortRef = useRef<AbortController | null>(null);

  const logMessage = useCallback(
    (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      addLog({ timestamp: new Date().toISOString(), message, level });
    },
    [addLog],
  );

  const runAgent = useCallback(
    async (
      agentPhase: AgentPhase,
      fn: (options: claude.ClaudeAgentOptions) => Promise<unknown>,
    ) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPhase(agentPhase);
      setStatus('running');
      setError(null);

      try {
        await fn({
          onLog: logMessage,
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setStatus('success');
          logMessage('Agent completed successfully');
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setStatus('error');
          setError(message);
          logMessage(`Agent error: ${message}`, 'error');
          console.error('Agent execution failed:', err);
        }
      }
    },
    [setPhase, setStatus, setError, logMessage],
  );

  const startLookup = useCallback(
    (query: string) => runAgent('lookup', (opts) => claude.startLookup(query, opts)),
    [runAgent],
  );

  const startPaste = useCallback(
    (text: string) => runAgent('paste', (opts) => claude.startPaste(text, opts)),
    [runAgent],
  );

  const startUrl = useCallback(
    (url: string) => runAgent('url', (opts) => claude.startUrl(url, opts)),
    [runAgent],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    setPhase('idle');
    logMessage('Agent cancelled by user', 'warn');
  }, [setStatus, setPhase, logMessage]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    storeReset();
  }, [storeReset]);

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
