import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NdcLookupAgent from '../NdcLookupAgent';
import { useAgentStore } from '@/store';

// Mock the claude service
vi.mock('@/services/claude', () => ({
  runNdcLookup: vi.fn(async (_query: string, onLog?: (entry: unknown) => void) => {
    // Simulate phase-by-phase progress
    const phases = ['fda-data', 'origin-hunt', 'pricing', 'compilation'] as const;
    for (const phase of phases) {
      onLog?.({
        timestamp: new Date().toISOString(),
        phase,
        message: `Processing ${phase}...`,
        type: 'progress',
      });
    }
    onLog?.({
      timestamp: new Date().toISOString(),
      phase: 'compilation',
      message: 'NDC lookup complete',
      type: 'result',
    });
    return {
      taskId: 'test-task',
      agentId: 'ndc-pipeline',
      status: 'completed' as const,
      logs: [],
      data: {
        fdaData: { drugName: 'TestDrug', ndc: '1234-5678-90' },
        compiledReport: { miaScore: 85, coorsScore: 70, riskLevel: 'low' },
      },
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }),
  processPasteData: vi.fn(),
  processUrl: vi.fn(),
}));

describe('NdcLookupAgent', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAgentStore.getState().resetAgent();
  });

  it('renders input and research button', () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    expect(screen.getByTestId('ndc-input')).toBeInTheDocument();
    expect(screen.getByTestId('research-btn')).toBeInTheDocument();
  });

  it('disables research button when input is empty', () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    expect(screen.getByTestId('research-btn')).toBeDisabled();
  });

  it('enables research button when input has text', () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('ndc-input'), {
      target: { value: 'Amoxicillin' },
    });
    expect(screen.getByTestId('research-btn')).toBeEnabled();
  });

  it('shows agent activity log after clicking Research', async () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('ndc-input'), {
      target: { value: 'Amoxicillin' },
    });
    fireEvent.click(screen.getByTestId('research-btn'));

    await waitFor(() => {
      expect(screen.getByTestId('agent-activity-log')).toBeInTheDocument();
    });
  });

  it('triggers agent and shows phase indicators', async () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('ndc-input'), {
      target: { value: 'Amoxicillin' },
    });
    fireEvent.click(screen.getByTestId('research-btn'));

    // Agent should transition through phases and eventually complete
    await waitFor(() => {
      expect(screen.getByTestId('phase-indicators')).toBeInTheDocument();
    });
  });

  it('calls onComplete when agent finishes', async () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('ndc-input'), {
      target: { value: 'Amoxicillin' },
    });
    fireEvent.click(screen.getByTestId('research-btn'));

    await waitFor(
      () => {
        expect(onComplete).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
  });

  it('does not show phase indicators in idle state', () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    expect(screen.queryByTestId('phase-indicators')).not.toBeInTheDocument();
  });

  it('renders the title and description', () => {
    render(<NdcLookupAgent onComplete={onComplete} />);
    expect(screen.getByText('NDC Lookup Agent')).toBeInTheDocument();
    expect(
      screen.getByText(/Enter a drug name or NDC code/),
    ).toBeInTheDocument();
  });
});
