import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ComplianceGrid from '../ComplianceGrid';
import type { ComplianceStatusGrid } from '../ComplianceGrid';

describe('ComplianceGrid', () => {
  const allPassStatus: ComplianceStatusGrid = {
    baaCompliant: true,
    taaCompliant: true,
    fdaApproved: true,
    riskLevel: 'low',
  };

  const mixedStatus: ComplianceStatusGrid = {
    baaCompliant: true,
    taaCompliant: false,
    fdaApproved: true,
    riskLevel: 'high',
  };

  const allFailStatus: ComplianceStatusGrid = {
    baaCompliant: false,
    taaCompliant: false,
    fdaApproved: false,
    riskLevel: 'critical',
  };

  it('renders the compliance grid container', () => {
    render(<ComplianceGrid status={allPassStatus} />);
    expect(screen.getByTestId('compliance-grid')).toBeInTheDocument();
  });

  it('renders all 4 status labels', () => {
    render(<ComplianceGrid status={allPassStatus} />);
    expect(screen.getByText('BAA')).toBeInTheDocument();
    expect(screen.getByText('TAA')).toBeInTheDocument();
    expect(screen.getByText('FDA')).toBeInTheDocument();
    expect(screen.getByText('Risk Level')).toBeInTheDocument();
  });

  it('shows all Pass badges when all compliant', () => {
    render(<ComplianceGrid status={allPassStatus} />);
    const passBadges = screen.getAllByText('Pass');
    expect(passBadges).toHaveLength(3);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('shows all Fail badges when non-compliant', () => {
    render(<ComplianceGrid status={allFailStatus} />);
    const failBadges = screen.getAllByText('Fail');
    expect(failBadges).toHaveLength(3);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('shows mixed Pass/Fail badges correctly', () => {
    render(<ComplianceGrid status={mixedStatus} />);
    const passBadges = screen.getAllByText('Pass');
    const failBadges = screen.getAllByText('Fail');
    expect(passBadges).toHaveLength(2);
    expect(failBadges).toHaveLength(1);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders risk level badge for moderate risk', () => {
    const status: ComplianceStatusGrid = {
      ...allPassStatus,
      riskLevel: 'moderate',
    };
    render(<ComplianceGrid status={status} />);
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });
});
