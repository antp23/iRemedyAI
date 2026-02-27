import { useEffect, useRef } from 'react';

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROGRESS';

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  agent?: string;
}

interface AgentActivityLogProps {
  entries: AgentLogEntry[];
  maxHeight?: string;
  className?: string;
}

const levelColors: Record<LogLevel, string> = {
  INFO: 'text-gray-300',
  SUCCESS: 'text-green-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  PROGRESS: 'text-blue-400',
};

const levelIcons: Record<LogLevel, string> = {
  INFO: '\u2139',
  SUCCESS: '\u2713',
  WARNING: '\u26A0',
  ERROR: '\u2717',
  PROGRESS: '\u25B6',
};

const formatTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

const AgentActivityLog = ({
  entries,
  maxHeight = '400px',
  className = '',
}: AgentActivityLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [entries.length]);

  return (
    <div
      className={`overflow-hidden rounded-lg border border-navy/20 bg-[#1a1b26] ${className}`}
      data-testid="agent-activity-log"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-gray-400">Agent Activity</span>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto p-3 font-mono text-xs leading-relaxed"
        style={{ maxHeight }}
      >
        {entries.length === 0 ? (
          <div className="text-gray-500">No activity yet...</div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex gap-2 py-0.5">
              <span className="shrink-0 text-gray-500">
                [{formatTimestamp(entry.timestamp)}]
              </span>
              {entry.agent && (
                <span className="shrink-0 text-purple-400">
                  [{entry.agent}]
                </span>
              )}
              <span className={`shrink-0 ${levelColors[entry.level]}`}>
                {levelIcons[entry.level]}
              </span>
              <span className={levelColors[entry.level]}>{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AgentActivityLog;
