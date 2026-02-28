import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  runNdcLookup,
  processPasteData,
  processUrl,
  _testing,
  type AgentLogEntry,
} from '../claude';

const { SYSTEM_PROMPTS, createMockResponse } = _testing;

// Mock fetch globally
const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('claude', () => {
  describe('SYSTEM_PROMPTS', () => {
    it('has prompts for all 4 NDC agent phases', () => {
      expect(SYSTEM_PROMPTS['fda-data']).toBeTruthy();
      expect(SYSTEM_PROMPTS['origin-hunt']).toBeTruthy();
      expect(SYSTEM_PROMPTS['pricing']).toBeTruthy();
      expect(SYSTEM_PROMPTS['compilation']).toBeTruthy();
    });

    it('fda-data prompt mentions NDC and FDA', () => {
      expect(SYSTEM_PROMPTS['fda-data']).toContain('FDA');
      expect(SYSTEM_PROMPTS['fda-data']).toContain('NDC');
    });

    it('origin-hunt prompt mentions country of origin and TAA/BAA', () => {
      expect(SYSTEM_PROMPTS['origin-hunt']).toContain('country of origin');
      expect(SYSTEM_PROMPTS['origin-hunt']).toContain('TAA');
      expect(SYSTEM_PROMPTS['origin-hunt']).toContain('BAA');
    });

    it('pricing prompt mentions WAC and pricing', () => {
      expect(SYSTEM_PROMPTS['pricing']).toContain('WAC');
      expect(SYSTEM_PROMPTS['pricing']).toContain('pricing');
    });

    it('compilation prompt mentions MIA and COORS', () => {
      expect(SYSTEM_PROMPTS['compilation']).toContain('MIA');
      expect(SYSTEM_PROMPTS['compilation']).toContain('COORS');
    });
  });

  describe('createMockResponse', () => {
    it('returns mock data for fda-data phase', () => {
      const result = createMockResponse('fda-data', 'test query');
      expect(result._mock).toBe(true);
      expect(result.phase).toBe('fda-data');
      expect(result.drugName).toBeTruthy();
      expect(result.ndc).toBeTruthy();
    });

    it('returns mock data for origin-hunt phase', () => {
      const result = createMockResponse('origin-hunt', 'test');
      expect(result._mock).toBe(true);
      expect(result.apiCountry).toBeTruthy();
      expect(result.fgCountry).toBeTruthy();
      expect(result.taaCompliant).toBeDefined();
    });

    it('returns mock data for pricing phase', () => {
      const result = createMockResponse('pricing', 'test');
      expect(result._mock).toBe(true);
      expect(result.wacPrice).toBeDefined();
      expect(typeof result.wacPrice).toBe('number');
    });

    it('returns mock data for compilation phase', () => {
      const result = createMockResponse('compilation', 'test');
      expect(result._mock).toBe(true);
      expect(result.miaScore).toBeDefined();
      expect(result.riskLevel).toBeTruthy();
    });
  });

  describe('runNdcLookup', () => {
    it('returns completed result with mock data when no API key', async () => {
      // No VITE_CLAUDE_API_KEY in env → falls back to mock
      const result = await runNdcLookup('Lisinopril 10mg');
      expect(result.status).toBe('completed');
      expect(result.data).not.toBeNull();
      expect(result.logs.length).toBeGreaterThan(0);
      expect(result.taskId).toContain('ndc-lookup');
      expect(result.agentId).toBe('ndc-pipeline');
    });

    it('calls all 4 phases in sequence', async () => {
      const logs: AgentLogEntry[] = [];
      await runNdcLookup('test drug', (entry) => logs.push(entry));

      const phases = logs.map(l => l.phase);
      expect(phases).toContain('fda-data');
      expect(phases).toContain('origin-hunt');
      expect(phases).toContain('pricing');
      expect(phases).toContain('compilation');
    });

    it('streams log entries via callback', async () => {
      const logs: AgentLogEntry[] = [];
      await runNdcLookup('test drug', (entry) => logs.push(entry));
      expect(logs.length).toBeGreaterThan(4);

      for (const log of logs) {
        expect(log.timestamp).toBeTruthy();
        expect(log.phase).toBeTruthy();
        expect(log.message).toBeTruthy();
        expect(['info', 'progress', 'result', 'error']).toContain(log.type);
      }
    });

    it('result data contains all 4 phase outputs', async () => {
      const result = await runNdcLookup('test');
      const data = result.data as Record<string, unknown>;
      expect(data.fdaData).toBeDefined();
      expect(data.originData).toBeDefined();
      expect(data.pricingData).toBeDefined();
      expect(data.compiledReport).toBeDefined();
    });

    it('constructs valid API request when key is available', async () => {
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'test-key-123');

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: [{ text: '{"result": "test"}' }],
        }),
      });

      await runNdcLookup('Aspirin');

      // Should have been called 4 times (once per phase)
      expect(mockFetch).toHaveBeenCalledTimes(4);

      // Verify first call structure
      const firstCall = mockFetch.mock.calls[0];
      expect(firstCall[0]).toBe('https://api.anthropic.com/v1/messages');

      const requestBody = JSON.parse(firstCall[1].body);
      expect(requestBody.model).toBeTruthy();
      expect(requestBody.system).toContain('FDA');
      expect(requestBody.messages).toHaveLength(1);
      expect(requestBody.messages[0].role).toBe('user');
      expect(requestBody.max_tokens).toBe(4096);

      const headers = firstCall[1].headers;
      expect(headers['x-api-key']).toBe('test-key-123');
      expect(headers['anthropic-version']).toBe('2023-06-01');
      expect(headers['Content-Type']).toBe('application/json');

      vi.unstubAllEnvs();
    });

    it('falls back to mock on API error', async () => {
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'test-key');

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
      });

      const result = await runNdcLookup('test');
      expect(result.status).toBe('completed');
      expect(result.data).not.toBeNull();

      vi.unstubAllEnvs();
    });

    it('falls back to mock on network error', async () => {
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'test-key');
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await runNdcLookup('test');
      // Still completes because fallback produces mock data per-phase
      expect(result.status).toBe('completed');

      vi.unstubAllEnvs();
    });
  });

  describe('processPasteData', () => {
    it('returns completed result with mock data', async () => {
      const text = 'NDC: 0002-4462-30\nDrug: Lisinopril 10mg\nManufacturer: Merck';
      const result = await processPasteData(text);
      expect(result.status).toBe('completed');
      expect(result.data).not.toBeNull();
      expect(result.agentId).toBe('paste-processor');
    });

    it('streams log entries', async () => {
      const logs: AgentLogEntry[] = [];
      await processPasteData('some data', (entry) => logs.push(entry));
      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('processUrl', () => {
    it('returns completed result with mock data', async () => {
      const result = await processUrl('https://dailymed.nlm.nih.gov/example');
      expect(result.status).toBe('completed');
      expect(result.data).not.toBeNull();
      expect(result.agentId).toBe('url-processor');
    });

    it('streams log entries', async () => {
      const logs: AgentLogEntry[] = [];
      await processUrl('https://example.com/drug', (entry) => logs.push(entry));
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});
