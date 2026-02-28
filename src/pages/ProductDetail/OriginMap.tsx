import { SupplyChainMap, CountryFlag } from '@/components/shared';
import type { SupplyChainNode } from '@/components/shared';
import { Card } from '@/components/ui';

const roleLabels: Record<SupplyChainNode['role'], string> = {
  'api-manufacturer': 'API Manufacturer',
  'finished-goods': 'Finished Goods',
  distributor: 'Distributor / HQ',
};

interface OriginMapProps {
  nodes: SupplyChainNode[];
  className?: string;
}

const OriginMap = ({ nodes, className = '' }: OriginMapProps) => {
  const hasNodes = nodes.length > 0;

  return (
    <Card className={`p-0 overflow-hidden ${className}`}>
      <div className="px-6 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-navy">Supply Chain Origin</h2>
      </div>

      {hasNodes ? (
        <SupplyChainMap nodes={nodes} />
      ) : (
        <div
          className="flex items-center justify-center px-6 pb-6 text-sm text-navy/50"
          data-testid="origin-map-empty"
        >
          No supply chain origin data available.
        </div>
      )}

      {hasNodes && (
        <div className="border-t border-navy/10 px-6 py-4">
          <h3 className="mb-2 text-sm font-medium text-navy/70">Origin Nodes</h3>
          <div className="flex flex-wrap gap-3" data-testid="origin-node-badges">
            {nodes.map((node) => (
              <div
                key={`${node.role}-${node.countryCode}`}
                className="flex items-center gap-2 rounded-lg border border-navy/10 bg-offWhite px-3 py-2 text-sm"
              >
                <CountryFlag countryCode={node.countryCode} size="sm" />
                <div>
                  <span className="font-medium text-navy">{node.country}</span>
                  <span className="ml-1 text-navy/50">
                    ({roleLabels[node.role]})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default OriginMap;
