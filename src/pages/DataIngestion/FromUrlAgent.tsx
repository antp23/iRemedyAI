import { useState, useMemo, useEffect, useRef } from 'react';
import { useAgent } from '@/hooks';
import Button from '@/components/ui/Button';
import Input from '@/components/forms/Input';
import AgentActivityLog from '@/components/shared/AgentActivityLog';
import type { AgentLogEntry as ActivityLogEntry, LogLevel } from '@/components/shared/AgentActivityLog';

interface FromUrlAgentProps {
  onComplete: (data: Record<string, unknown>) => void;
}

function mapStoreLogLevel(level: string, message: string): LogLevel {
  if (level === 'error') return 'ERROR';
  if (level === 'warn') return 'WARNING';
  const lower = message.toLowerCase();
  if (lower.includes('complete') || lower.includes('successfully'))
    return 'SUCCESS';
  if (lower.includes('processing') || lower.includes('sending') || lower.includes('fetching'))
    return 'PROGRESS';
  return 'INFO';
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

const FromUrlAgent = ({ onComplete }: FromUrlAgentProps) => {
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const { status, logs, startUrl, cancel, reset, phase } = useAgent();
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
        agent: 'url-processor',
      })),
    [logs],
  );

  const handleFetch = () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      setUrlError('Please enter a valid URL (e.g., https://dailymed.nlm.nih.gov/...)');
      return;
    }

    setUrlError('');
    completedRef.current = false;
    startUrl(trimmed);
  };

  const handleRetry = () => {
    completedRef.current = false;
    reset();
    const trimmed = url.trim();
    if (trimmed && isValidUrl(trimmed)) {
      startUrl(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isRunning && url.trim()) {
      handleFetch();
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
          From URL
        </h3>
        <p className="mt-1 text-sm text-navy/60">
          Enter a URL to a drug product page (e.g., DailyMed, FDA, manufacturer
          site). The AI agent will extract structured product data.
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="url-input"
            type="url"
            placeholder="https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError('');
            }}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            error={urlError}
            data-testid="url-input"
          />
        </div>
        {!isRunning ? (
          <Button
            onClick={handleFetch}
            disabled={!url.trim() || isRunning}
            className="mt-0 self-start"
            data-testid="fetch-btn"
          >
            Fetch & Process
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={cancel}
            className="mt-0 self-start"
            data-testid="cancel-btn"
          >
            Cancel
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
            URL processing failed. Verify the URL and try again.
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

export default FromUrlAgent;
