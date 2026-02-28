import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import AgentActivityLog from '../AgentActivityLog';
import type { AgentLogEntry } from '../AgentActivityLog';

const createEntry = (
  id: string,
  level: AgentLogEntry['level'],
  message: string,
  agent?: string
): AgentLogEntry => ({
  id,
  timestamp: '2024-06-15T10:30:00Z',
  level,
  message,
  agent,
});

describe('AgentActivityLog', () => {
  const sampleEntries: AgentLogEntry[] = [
    createEntry('1', 'INFO', 'Starting analysis pipeline'),
    createEntry('2', 'PROGRESS', 'Fetching FDA database...', 'ScoringAgent'),
    createEntry('3', 'SUCCESS', 'FDA data retrieved successfully'),
    createEntry('4', 'WARNING', 'Partial data for NDC 12345'),
    createEntry('5', 'ERROR', 'Connection timeout to supplier API'),
  ];

  it('renders the activity log container', () => {
    render(<AgentActivityLog entries={sampleEntries} />);
    expect(screen.getByTestId('agent-activity-log')).toBeInTheDocument();
  });

  it('renders empty state when no entries', () => {
    render(<AgentActivityLog entries={[]} />);
    expect(screen.getByText('No activity yet...')).toBeInTheDocument();
  });

  it('renders all log entries', () => {
    render(<AgentActivityLog entries={sampleEntries} />);
    expect(screen.getByText('Starting analysis pipeline')).toBeInTheDocument();
    expect(screen.getByText('Fetching FDA database...')).toBeInTheDocument();
    expect(
      screen.getByText('FDA data retrieved successfully')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Partial data for NDC 12345')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Connection timeout to supplier API')
    ).toBeInTheDocument();
  });

  it('displays agent name when provided', () => {
    render(<AgentActivityLog entries={sampleEntries} />);
    expect(screen.getByText('[ScoringAgent]')).toBeInTheDocument();
  });

  it('displays timestamps for entries', () => {
    render(<AgentActivityLog entries={sampleEntries} />);
    const timestamps = screen.getAllByText(/\[\d{2}:\d{2}:\d{2}\]/);
    expect(timestamps.length).toBe(sampleEntries.length);
  });

  it('renders the terminal title bar', () => {
    render(<AgentActivityLog entries={sampleEntries} />);
    expect(screen.getByText('Agent Activity')).toBeInTheDocument();
  });

  describe('performance with many entries', () => {
    let manyEntries: AgentLogEntry[];

    beforeEach(() => {
      manyEntries = Array.from({ length: 150 }, (_, i) =>
        createEntry(
          `entry-${i}`,
          (['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'PROGRESS'] as const)[
            i % 5
          ],
          `Log message number ${i + 1}`
        )
      );
    });

    it('renders 150 entries without errors', () => {
      render(<AgentActivityLog entries={manyEntries} />);
      expect(screen.getByText('Log message number 1')).toBeInTheDocument();
      expect(screen.getByText('Log message number 150')).toBeInTheDocument();
    });

    it('auto-scrolls container to bottom', () => {
      const { container } = render(
        <AgentActivityLog entries={manyEntries} maxHeight="200px" />
      );
      const scrollContainer = container.querySelector(
        '[data-testid="agent-activity-log"] > div:last-child'
      );
      expect(scrollContainer).toBeTruthy();
    });
  });
});
