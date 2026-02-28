import { useState, useCallback } from 'react';
import { useAgent } from '@/hooks';
import NdcLookupAgent from './NdcLookupAgent';
import PasteDataAgent from './PasteDataAgent';
import FromUrlAgent from './FromUrlAgent';
import ProductPreview from './ProductPreview';

type IngestionMode = 'ndc-lookup' | 'paste-data' | 'from-url';

interface TabConfig {
  key: IngestionMode;
  label: string;
  description: string;
}

const tabs: TabConfig[] = [
  {
    key: 'ndc-lookup',
    label: 'NDC Lookup',
    description: '4-phase autonomous AI research agent',
  },
  {
    key: 'paste-data',
    label: 'Paste Data',
    description: 'CSV, JSON, table text, or regulatory filings',
  },
  {
    key: 'from-url',
    label: 'From URL',
    description: 'Extract from a drug product web page',
  },
];

const IngestionHub = () => {
  const [activeTab, setActiveTab] = useState<IngestionMode>('ndc-lookup');
  const [completedData, setCompletedData] = useState<Record<string, unknown> | null>(null);
  const { reset, status } = useAgent();
  const isRunning = status === 'running';

  const handleTabChange = (tab: IngestionMode) => {
    if (isRunning) return;
    if (tab !== activeTab) {
      reset();
      setCompletedData(null);
      setActiveTab(tab);
    }
  };

  const handleComplete = useCallback((data: Record<string, unknown>) => {
    setCompletedData(data);
  }, []);

  const handleConfirm = useCallback(() => {
    setCompletedData(null);
    reset();
  }, [reset]);

  const handleDiscard = useCallback(() => {
    setCompletedData(null);
    reset();
  }, [reset]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-8">
      {/* Page Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-navy">
          Data Ingestion
        </h1>
        <p className="mt-2 text-navy/70">
          Add drug products to your intelligence database using AI-powered
          research agents.
        </p>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex border-b border-navy/10"
        role="tablist"
        aria-label="Ingestion modes"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`panel-${tab.key}`}
            id={`tab-${tab.key}`}
            onClick={() => handleTabChange(tab.key)}
            disabled={isRunning && activeTab !== tab.key}
            className={`relative px-5 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-navy'
                : isRunning
                  ? 'cursor-not-allowed text-navy/25'
                  : 'text-navy/50 hover:text-navy/80'
            } ${isRunning && activeTab !== tab.key ? 'opacity-50' : ''}`}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === 'ndc-lookup' && (
          <NdcLookupAgent onComplete={handleComplete} />
        )}
        {activeTab === 'paste-data' && (
          <PasteDataAgent onComplete={handleComplete} />
        )}
        {activeTab === 'from-url' && (
          <FromUrlAgent onComplete={handleComplete} />
        )}
      </div>

      {/* Product Preview (shown after any ingestion mode completes) */}
      {completedData && (
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-semibold text-navy">
            Product Preview
          </h2>
          <ProductPreview
            data={completedData}
            onConfirm={handleConfirm}
            onDiscard={handleDiscard}
          />
        </div>
      )}
    </div>
  );
};

export default IngestionHub;
