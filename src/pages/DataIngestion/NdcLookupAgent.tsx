import { useState, useMemo, useEffect, useRef } from 'react';
import { useAgent } from '@/hooks';
import Button from '@/components/ui/Button';
import Input from '@/components/forms/Input';
import AgentActivityLog from '@/components/shared/AgentActivityLog';
import type { AgentLogEntry as ActivityLogEntry, LogLevel } from '@/components/shared/AgentActivityLog';
import type { AgentPhase } from '@/store';

interface NdcLookupAgentProps {
  onComplete: (data: Record<string, unknown>) => void;
}

const phaseSteps: { key: AgentPhase; ndcLabel: string; label: string }[] = [
  { key: 'collecting', ndcLabel: 'fda-data', label: 'FDA Data' },
  { key: 'analyzing', ndcLabel: 'origin-hunt', label: 'Origin Hunt' },
  { key: 'scoring', ndcLabel: 'pricing', label: 'Pricing' },
  { key: 'reporting', ndcLabel: 'compilation', label: 'Compilation' },
];

function getPhaseIndex(phase: AgentPhase): number {
  const idx = phaseSteps.findIndex((s) => s.key === phase);
  if (phase === 'completed') return phaseSteps.length;
  return idx;
}

function mapStoreLogLevel(level: string, message: string): LogLevel {
  if (level === 'error') return 'ERROR';
  if (level === 'warn') return 'WARNING';
  const lower = message.toLowerCase();
  if (lower.includes('complete') || lower.includes('successfully') || lower.includes('finished'))
    return 'SUCCESS';
  if (lower.includes('phase') || lower.includes('querying') || lower.includes('investigating') || lower.includes('analyzing') || lower.includes('compiling') || lower.includes('processing') || lower.includes('sending'))
    return 'PROGRESS';
  return 'INFO';
}

const NdcLookupAgent = ({ onComplete }: NdcLookupAgentProps) => {
  const [query, setQuery] = useState('');
  const { phase, status, logs, startLookup, cancel, reset } = useAgent();
  const completedRef = useRef(false);

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isError = phase === 'error';
  const currentPhaseIndex = getPhaseIndex(phase);

  const activityEntries: ActivityLogEntry[] = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        level: mapStoreLogLevel(log.level, log.message),
        message: log.message,
        agent: log.metadata?.claudePhase
          ? String(log.metadata.claudePhase)
          : undefined,
      })),
    [logs],
  );

  const handleResearch = () => {
    if (!query.trim()) return;
    completedRef.current = false;
    startLookup(query.trim());
  };

  const handleRetry = () => {
    completedRef.current = false;
    reset();
    if (query.trim()) {
      startLookup(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRunning && query.trim()) {
      handleResearch();
    }
  };

  useEffect(() => {
    if (isCompleted && !completedRef.current) {
      completedRef.current = true;
      const resultData: Record<string, unknown> = {};
      for (const log of logs) {
        if (log.metadata) {
          Object.assign(resultData, log.metadata);
        }
      }
      onComplete(resultData);
    }
  }, [isCompleted, logs, onComplete]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-semibold text-navy">
          NDC Lookup Agent
        </h3>
        <p className="mt-1 text-sm text-navy/60">
          Enter a drug name or NDC code to run the 4-phase autonomous research
          agent.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="ndc-query"
            placeholder="Enter drug name or NDC code (e.g., Amoxicillin, 0069-3150-83)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            data-testid="ndc-input"
          />
        </div>
        {!isRunning ? (
          <Button
            onClick={handleResearch}
            disabled={!query.trim() || isRunning}
            data-testid="research-btn"
          >
            Research
          </Button>
        ) : (
          <Button variant="outline" onClick={cancel} data-testid="cancel-btn">
            Cancel
          </Button>
        )}
      </div>

      {/* Phase Indicators */}
      {(isRunning || isCompleted || isError) && (
        <div className="flex items-center gap-2" data-testid="phase-indicators">
          {phaseSteps.map((step, idx) => {
            const isActive = currentPhaseIndex === idx;
            const isDone = currentPhaseIndex > idx;
            const isFailed = isError && isActive;

            return (
              <div key={step.key} className="flex items-center gap-2">
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-6 ${isDone ? 'bg-gold' : 'bg-navy/15'}`}
                  />
                )}
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    isFailed
                      ? 'bg-red-100 text-red-600'
                      : isDone
                        ? 'bg-gold/15 text-gold'
                        : isActive
                          ? 'bg-navy text-offWhite'
                          : 'bg-navy/5 text-navy/40'
                  }`}
                  data-testid={`phase-${step.ndcLabel}`}
                >
                  {isDone ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : isActive && isRunning ? (
                    <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
                  ) : isFailed ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 3L3 9M3 3L9 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : null}
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Agent Activity Log */}
      {logs.length > 0 && (
        <AgentActivityLog
          entries={activityEntries}
          maxHeight="300px"
        />
      )}

      {/* Error state with retry */}
      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <span className="text-sm text-red-700">
            Agent encountered an error. You can retry the lookup.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            data-testid="retry-btn"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default NdcLookupAgent;
