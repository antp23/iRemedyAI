import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import IngestionHub from '../IngestionHub';
import { useAgentStore } from '@/store';

describe('IngestionHub', () => {
  beforeEach(() => {
    useAgentStore.getState().resetAgent();
  });

  it('renders the page title and description', () => {
    render(<IngestionHub />);
    expect(screen.getByText('Data Ingestion')).toBeInTheDocument();
    expect(
      screen.getByText(/Add drug products to your intelligence database/),
    ).toBeInTheDocument();
  });

  it('renders all three tabs', () => {
    render(<IngestionHub />);
    expect(screen.getByTestId('tab-ndc-lookup')).toBeInTheDocument();
    expect(screen.getByTestId('tab-paste-data')).toBeInTheDocument();
    expect(screen.getByTestId('tab-from-url')).toBeInTheDocument();
  });

  it('defaults to NDC Lookup tab', () => {
    render(<IngestionHub />);
    const ndcTab = screen.getByTestId('tab-ndc-lookup');
    expect(ndcTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('NDC Lookup Agent')).toBeInTheDocument();
  });

  it('switches to Paste Data tab on click', () => {
    render(<IngestionHub />);
    fireEvent.click(screen.getByTestId('tab-paste-data'));

    const pasteTab = screen.getByTestId('tab-paste-data');
    expect(pasteTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Paste Data' })).toBeInTheDocument();
    expect(screen.getByTestId('paste-textarea')).toBeInTheDocument();
  });

  it('switches to From URL tab on click', () => {
    render(<IngestionHub />);
    fireEvent.click(screen.getByTestId('tab-from-url'));

    const urlTab = screen.getByTestId('tab-from-url');
    expect(urlTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'From URL' })).toBeInTheDocument();
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
  });

  it('switches between all three modes', () => {
    render(<IngestionHub />);

    // Start on NDC
    expect(screen.getByTestId('tab-ndc-lookup')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('ndc-input')).toBeInTheDocument();

    // Switch to Paste
    fireEvent.click(screen.getByTestId('tab-paste-data'));
    expect(screen.getByTestId('tab-paste-data')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('paste-textarea')).toBeInTheDocument();

    // Switch to URL
    fireEvent.click(screen.getByTestId('tab-from-url'));
    expect(screen.getByTestId('tab-from-url')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('url-input')).toBeInTheDocument();

    // Switch back to NDC
    fireEvent.click(screen.getByTestId('tab-ndc-lookup'));
    expect(screen.getByTestId('tab-ndc-lookup')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('ndc-input')).toBeInTheDocument();
  });

  it('has proper ARIA roles on tabs and panel', () => {
    render(<IngestionHub />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});
