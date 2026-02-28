import { useState, useMemo, useEffect, useRef } from 'react';
import { useAgent } from '@/hooks';
import Button from '@/components/ui/Button';
import AgentActivityLog from '@/components/shared/AgentActivityLog';
import type { AgentLogEntry as ActivityLogEntry, LogLevel } from '@/components/shared/AgentActivityLog';

interface PasteDataAgentProps {
  onComplete: (data: Record<string, unknown>) => void;
}

function mapStoreLogLevel(level: string, message: string): LogLevel {
  if (level === 'error') return 'ERROR';
  if (level === 'warn') return 'WARNING';
  const lower = message.toLowerCase();
  if (lower.includes('complete') || lower.includes('successfully'))
    return 'SUCCESS';
  if (lower.includes('processing') || lower.includes('sending') || lower.includes('extracting'))
    return 'PROGRESS';
  return 'INFO';
}

const PasteDataAgent = ({ onComplete }: PasteDataAgentProps) => {
  const [text, setText] = useState('');
  const { phase, status, logs, startPaste, cancel, reset } = useAgent();
  const completedRef = useRef(false);

  const isRunning = status === 'running';
  const isCompleted = status === 'completed';
  const isError = phase === 'error';

  const activityEntries: ActivityLogEntry[] = useMemo(
    () =>
      logs.map((log) => ({
        id: log.id,
        timestamp: log.timestamp,
        level: mapStoreLogLevel(log.level, log.message),
        message: log.message,
        agent: 'paste-processor',
      })),
    [logs],
  );

  const handleProcess = () => {
    if (!text.trim()) return;
    completedRef.current = false;
    startPaste(text.trim());
  };

  const handleRetry = () => {
    completedRef.current = false;
    reset();
    if (text.trim()) {
      startPaste(text.trim());
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
          Paste Data
        </h3>
        <p className="mt-1 text-sm text-navy/60">
          Paste any format: CSV, JSON, table text, or regulatory filing
          excerpts. The AI agent will extract structured drug product data.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="paste-data" className="text-sm font-medium text-navy">
          Data Input
        </label>
        <textarea
          id="paste-data"
          className="min-h-[200px] rounded-lg border border-navy/20 bg-white px-4 py-3 font-mono text-sm text-navy transition-colors placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          placeholder={`Paste your data here...\n\nExamples:\n- CSV: NDC,Drug Name,Manufacturer,Price\n- JSON: {"ndc": "0069-3150-83", "name": "Amoxicillin"}\n- Text: Amoxicillin 500mg capsules by Teva Pharmaceutical`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRunning}
          data-testid="paste-textarea"
        />
        {text.length > 0 && (
          <span className="text-xs text-navy/40">
            {text.length.toLocaleString()} characters
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <Button
            onClick={handleProcess}
            disabled={!text.trim()}
            data-testid="process-btn"
          >
            Process
          </Button>
        ) : (
          <Button variant="outline" onClick={cancel} data-testid="cancel-btn">
            Cancel
          </Button>
        )}
        {text.length > 0 && !isRunning && (
          <Button
            variant="ghost"
            onClick={() => {
              setText('');
              reset();
            }}
          >
            Clear
          </Button>
        )}
      </div>

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
            Processing failed. Check your data format and try again.
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

export default PasteDataAgent;
