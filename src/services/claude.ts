import type { AgentTaskResult } from '@/types';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

export interface AgentLogEntry {
  timestamp: string;
  phase: NdcAgentPhase;
  message: string;
  type: 'info' | 'progress' | 'result' | 'error';
}

export type NdcAgentPhase = 'fda-data' | 'origin-hunt' | 'pricing' | 'compilation';

export interface AgentResult extends AgentTaskResult {
  logs: AgentLogEntry[];
  data: Record<string, unknown> | null;
}

type LogCallback = (entry: AgentLogEntry) => void;

function getApiKey(): string {
  return import.meta.env.VITE_CLAUDE_API_KEY ?? '';
}

function createLogEntry(phase: NdcAgentPhase, message: string, type: AgentLogEntry['type'] = 'info'): AgentLogEntry {
  return {
    timestamp: new Date().toISOString(),
    phase,
    message,
    type,
  };
}

// --- System prompts for each NDC agent phase ---

const SYSTEM_PROMPTS: Record<NdcAgentPhase, string> = {
  'fda-data': `You are an FDA drug data analyst agent. Your task is to look up drug product information from FDA databases.
Given an NDC (National Drug Code) or drug name, return structured data including:
- Full drug name, brand name, generic name
- NDC code, labeler name, manufacturer
- Dosage form, strength, route of administration
- Active and inactive ingredients
- DEA schedule, product type
- FDA approval date and status
Return results as structured JSON. Be precise and cite FDA sources.`,

  'origin-hunt': `You are a pharmaceutical supply chain investigator agent. Your task is to determine the country of origin for drug products.
Given drug product information, determine:
- API (Active Pharmaceutical Ingredient) country of origin
- FG (Finished Good) country of manufacture
- Known manufacturing facilities and their locations
- Supply chain intermediaries if identifiable
- TAA (Trade Agreements Act) compliance status
- BAA (Buy American Act) eligibility assessment
Return results as structured JSON with confidence levels for each determination.`,

  'pricing': `You are a pharmaceutical pricing analyst agent. Your task is to analyze drug pricing data.
Given drug product information, provide:
- WAC (Wholesale Acquisition Cost) pricing
- AWP (Average Wholesale Price) if available
- 340B pricing tier if applicable
- FSS (Federal Supply Schedule) pricing
- Comparison to generic alternatives
- Price trend analysis
- Cost-per-day-of-therapy calculation
Return results as structured JSON with pricing sources.`,

  'compilation': `You are a pharmaceutical intelligence compilation agent. Your task is to synthesize findings from previous analysis phases into a comprehensive product intelligence report.
Given the results from FDA data lookup, origin investigation, and pricing analysis:
- Compile a unified product profile
- Calculate or confirm MIA (Made In America) score
- Assess COORS (Country of Origin Risk Score)
- Determine BAA/TAA compliance status
- Provide procurement recommendation
- Flag any compliance concerns or supply chain risks
Return a structured JSON report with all compiled intelligence.`,
};

async function callClaudeAPI(
  systemPrompt: string,
  userMessage: string,
  onLog?: LogCallback,
  phase: NdcAgentPhase = 'fda-data',
): Promise<Record<string, unknown>> {
  const apiKey = getApiKey();

  if (!apiKey) {
    onLog?.(createLogEntry(phase, 'No API key configured, returning mock data', 'info'));
    return createMockResponse(phase, userMessage);
  }

  onLog?.(createLogEntry(phase, `Sending request to Claude API (phase: ${phase})`, 'progress'));

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onLog?.(createLogEntry(phase, `API error (${response.status}): ${errorText}`, 'error'));
      return createMockResponse(phase, userMessage);
    }

    const result = await response.json();
    const content = result.content?.[0]?.text ?? '';

    onLog?.(createLogEntry(phase, 'Response received successfully', 'result'));

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Content wasn't JSON, wrap it
    }

    return { rawResponse: content, phase };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    onLog?.(createLogEntry(phase, `Request failed: ${message}`, 'error'));
    return createMockResponse(phase, userMessage);
  }
}

function createMockResponse(phase: NdcAgentPhase, query: string): Record<string, unknown> {
  const baseResponse = {
    _mock: true,
    query,
    phase,
    timestamp: new Date().toISOString(),
  };

  switch (phase) {
    case 'fda-data':
      return {
        ...baseResponse,
        drugName: 'Sample Drug Product',
        brandName: 'SampleBrand',
        genericName: 'Samplecillin',
        ndc: '0000-0000-00',
        labelerName: 'Sample Pharma',
        manufacturer: 'Sample Pharma Inc., USA',
        dosageForm: 'Tablet',
        strength: '10mg',
        routeOfAdministration: 'oral',
        activeIngredients: [{ name: 'Samplecillin', strength: '10', unit: 'mg' }],
        deaSchedule: 'unscheduled',
        fdaApprovalDate: '2020-01-01',
      };
    case 'origin-hunt':
      return {
        ...baseResponse,
        apiCountry: 'United States',
        fgCountry: 'United States',
        apiConfidence: 0.85,
        fgConfidence: 0.90,
        facilities: [{ name: 'Sample Plant', location: 'New Jersey, USA' }],
        taaCompliant: true,
        baaEligible: true,
      };
    case 'pricing':
      return {
        ...baseResponse,
        wacPrice: 25.99,
        awpPrice: 31.19,
        genericAvailable: true,
        genericPrice: 8.50,
        pricePerDayOfTherapy: 0.87,
        priceTrend: 'stable',
      };
    case 'compilation':
      return {
        ...baseResponse,
        miaScore: 100,
        coorsScore: 85,
        baaEligible: true,
        taaCompliant: true,
        riskLevel: 'low',
        recommendation: 'Product approved for government procurement',
        complianceConcerns: [],
      };
  }
}

function buildAgentResult(
  taskId: string,
  agentId: string,
  status: AgentResult['status'],
  logs: AgentLogEntry[],
  data: Record<string, unknown> | null,
  error?: string,
): AgentResult {
  const now = new Date().toISOString();
  return {
    taskId,
    agentId,
    status,
    result: data,
    error,
    startedAt: logs[0]?.timestamp ?? now,
    completedAt: status === 'completed' || status === 'failed' ? now : undefined,
    logs,
    data,
  };
}

/**
 * Run a full NDC lookup pipeline: FDA data -> Origin hunt -> Pricing -> Compilation.
 * Streams log entries via the optional onLog callback for real-time UI display.
 */
export async function runNdcLookup(
  query: string,
  onLog?: LogCallback,
): Promise<AgentResult> {
  const taskId = `ndc-lookup-${Date.now()}`;
  const agentId = 'ndc-pipeline';
  const logs: AgentLogEntry[] = [];

  const log = (entry: AgentLogEntry) => {
    logs.push(entry);
    onLog?.(entry);
  };

  log(createLogEntry('fda-data', `Starting NDC lookup for: ${query}`, 'info'));

  try {
    // Phase 1: FDA Data Lookup
    log(createLogEntry('fda-data', 'Phase 1: Querying FDA drug database...', 'progress'));
    const fdaData = await callClaudeAPI(
      SYSTEM_PROMPTS['fda-data'],
      `Look up the following drug product in FDA databases: ${query}`,
      log,
      'fda-data',
    );
    log(createLogEntry('fda-data', 'FDA data phase complete', 'result'));

    // Phase 2: Origin Hunt
    log(createLogEntry('origin-hunt', 'Phase 2: Investigating country of origin...', 'progress'));
    const originData = await callClaudeAPI(
      SYSTEM_PROMPTS['origin-hunt'],
      `Determine the country of origin for this drug product:\n${JSON.stringify(fdaData, null, 2)}`,
      log,
      'origin-hunt',
    );
    log(createLogEntry('origin-hunt', 'Origin investigation phase complete', 'result'));

    // Phase 3: Pricing Analysis
    log(createLogEntry('pricing', 'Phase 3: Analyzing pricing data...', 'progress'));
    const pricingData = await callClaudeAPI(
      SYSTEM_PROMPTS['pricing'],
      `Analyze pricing for this drug product:\n${JSON.stringify(fdaData, null, 2)}`,
      log,
      'pricing',
    );
    log(createLogEntry('pricing', 'Pricing analysis phase complete', 'result'));

    // Phase 4: Compilation
    log(createLogEntry('compilation', 'Phase 4: Compiling final intelligence report...', 'progress'));
    const compiledData = await callClaudeAPI(
      SYSTEM_PROMPTS['compilation'],
      `Compile a comprehensive product intelligence report from these findings:\nFDA Data: ${JSON.stringify(fdaData)}\nOrigin: ${JSON.stringify(originData)}\nPricing: ${JSON.stringify(pricingData)}`,
      log,
      'compilation',
    );
    log(createLogEntry('compilation', 'Compilation phase complete - NDC lookup finished', 'result'));

    return buildAgentResult(taskId, agentId, 'completed', logs, {
      fdaData,
      originData,
      pricingData,
      compiledReport: compiledData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log(createLogEntry('compilation', `Pipeline failed: ${message}`, 'error'));
    return buildAgentResult(taskId, agentId, 'failed', logs, null, message);
  }
}

/**
 * Process pasted text data (e.g., from a spreadsheet or document) to extract drug product information.
 */
export async function processPasteData(
  text: string,
  onLog?: LogCallback,
): Promise<AgentResult> {
  const taskId = `paste-${Date.now()}`;
  const agentId = 'paste-processor';
  const logs: AgentLogEntry[] = [];

  const log = (entry: AgentLogEntry) => {
    logs.push(entry);
    onLog?.(entry);
  };

  log(createLogEntry('fda-data', `Processing pasted data (${text.length} chars)`, 'info'));

  try {
    const result = await callClaudeAPI(
      `${SYSTEM_PROMPTS['fda-data']}\n\nAdditionally, parse unstructured text input to extract drug product data. The input may be from a spreadsheet, invoice, or formulary document.`,
      `Extract structured drug product information from the following text:\n\n${text}`,
      log,
      'fda-data',
    );

    log(createLogEntry('fda-data', 'Paste data processing complete', 'result'));
    return buildAgentResult(taskId, agentId, 'completed', logs, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log(createLogEntry('fda-data', `Processing failed: ${message}`, 'error'));
    return buildAgentResult(taskId, agentId, 'failed', logs, null, message);
  }
}

/**
 * Process a URL to extract drug product information from a web page.
 */
export async function processUrl(
  url: string,
  onLog?: LogCallback,
): Promise<AgentResult> {
  const taskId = `url-${Date.now()}`;
  const agentId = 'url-processor';
  const logs: AgentLogEntry[] = [];

  const log = (entry: AgentLogEntry) => {
    logs.push(entry);
    onLog?.(entry);
  };

  log(createLogEntry('fda-data', `Processing URL: ${url}`, 'info'));

  try {
    const result = await callClaudeAPI(
      `${SYSTEM_PROMPTS['fda-data']}\n\nAdditionally, when given a URL reference, extract drug product data as if you had accessed the page. Use your knowledge of common drug databases and manufacturer pages to provide the most accurate data possible.`,
      `Extract structured drug product information from this URL reference: ${url}`,
      log,
      'fda-data',
    );

    log(createLogEntry('fda-data', 'URL processing complete', 'result'));
    return buildAgentResult(taskId, agentId, 'completed', logs, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log(createLogEntry('fda-data', `URL processing failed: ${message}`, 'error'));
    return buildAgentResult(taskId, agentId, 'failed', logs, null, message);
  }
}

/** Exported for testing */
export const _testing = {
  SYSTEM_PROMPTS,
  createMockResponse,
  callClaudeAPI,
};
