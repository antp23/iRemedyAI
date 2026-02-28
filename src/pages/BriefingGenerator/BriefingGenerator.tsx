import { useState } from 'react';
import { PatrioticButton, GradientDivider } from '@/components/design-system';
import { useProducts } from '@/hooks/useProducts';
import BriefingPreview from './BriefingPreview';
import type { BriefingData } from './BriefingPreview';
import type { DrugProduct } from '@/types';

export type AudienceType = 'Congressional' | 'Executive' | 'Procurement' | 'Clinical';

const AUDIENCES: AudienceType[] = ['Congressional', 'Executive', 'Procurement', 'Clinical'];

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

function getApiKey(): string {
  return import.meta.env.VITE_CLAUDE_API_KEY ?? '';
}

function buildProductContext(products: DrugProduct[], topic: string): string {
  const topicLower = topic.toLowerCase();
  const relevant = products.filter((p) => {
    const searchable = [
      p.name,
      p.brandName,
      p.genericName,
      p.labelerName,
      p.manufacturer,
      p.category,
      p.description,
      ...p.indications,
      ...p.activeIngredients.map((ai) => ai.name),
    ]
      .join(' ')
      .toLowerCase();
    return searchable.includes(topicLower);
  });

  if (relevant.length === 0) return '';

  return relevant
    .map(
      (p) =>
        `Product: ${p.name} (${p.brandName})\n` +
        `  NDC: ${p.ndc}\n` +
        `  Manufacturer: ${p.manufacturer}\n` +
        `  Category: ${p.category}\n` +
        `  Type: ${p.productType}\n` +
        `  Strength: ${p.strength} ${p.strengthUnit}\n` +
        `  Price: $${p.price} ${p.currency}\n` +
        `  Active Ingredients: ${p.activeIngredients.map((ai) => `${ai.name} ${ai.strength}${ai.unit}`).join(', ')}\n` +
        `  Indications: ${p.indications.join(', ') || 'N/A'}\n` +
        `  DEA Schedule: ${p.schedule}\n` +
        `  Prescription: ${p.requiresPrescription ? 'Yes' : 'No'}`,
    )
    .join('\n\n');
}

function buildSystemPrompt(audience: AudienceType, productContext: string): string {
  const audienceGuidance: Record<AudienceType, string> = {
    Congressional:
      'The audience is U.S. Congressional staff and lawmakers. Emphasize policy implications, regulatory compliance, supply chain security, Buy American Act considerations, and taxpayer value. Use formal, authoritative language suitable for legislative briefings.',
    Executive:
      'The audience is C-suite executives and senior leadership. Focus on strategic risk, competitive landscape, financial impact, and actionable recommendations. Be concise and data-driven.',
    Procurement:
      'The audience is federal and institutional procurement officers. Highlight pricing analysis, supplier reliability, TAA/BAA compliance, contract considerations, and sourcing alternatives.',
    Clinical:
      'The audience is healthcare providers and clinical decision-makers. Emphasize clinical efficacy, safety profiles, drug interactions, formulary considerations, and patient outcomes.',
  };

  let prompt =
    `You are an intelligence briefing analyst for iRemedy AI, a medical product intelligence & compliance platform.\n\n` +
    `${audienceGuidance[audience]}\n\n` +
    `Generate a comprehensive intelligence briefing. You MUST respond with valid JSON in the following exact format:\n` +
    `{\n` +
    `  "title": "Briefing title",\n` +
    `  "sections": [\n` +
    `    { "heading": "Executive Summary", "content": "..." },\n` +
    `    { "heading": "Key Findings", "content": "..." },\n` +
    `    { "heading": "Risk Assessment", "content": "..." },\n` +
    `    { "heading": "Recommendations", "content": "..." }\n` +
    `  ],\n` +
    `  "sources": ["Source 1", "Source 2"]\n` +
    `}\n\n` +
    `Use bullet points (starting with "- ") for lists within content. Use **bold** for emphasis.\n` +
    `Sources should reference real databases: FDA Orange Book, FDA NDCDIR, Federal Supply Schedule, USP, CMS, WHO, etc.\n`;

  if (productContext) {
    prompt +=
      `\nThe following tracked product data from the iRemedy AI platform is relevant to this briefing. ` +
      `Reference specific products and data points in your analysis:\n\n${productContext}\n`;
  } else {
    prompt +=
      `\nNote: No tracked products in the platform match this topic directly. ` +
      `Generate a general intelligence briefing and include a disclaimer that this briefing is based on general knowledge rather than tracked product data.\n`;
  }

  return prompt;
}

function createFallbackBriefing(topic: string, audience: AudienceType): BriefingData {
  return {
    title: `Intelligence Briefing: ${topic}`,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    audience,
    sections: [
      {
        heading: 'Executive Summary',
        content:
          `This briefing provides an overview of **${topic}** for ${audience.toLowerCase()} stakeholders. ` +
          `The analysis covers current market conditions, regulatory landscape, and strategic considerations.\n\n` +
          `**Note:** This is a sample briefing generated with placeholder data. Connect to the Claude API for full AI-powered analysis.`,
      },
      {
        heading: 'Key Findings',
        content:
          `- Market analysis indicates evolving dynamics in the **${topic}** space\n` +
          `- Regulatory frameworks continue to adapt to new developments\n` +
          `- Supply chain considerations remain a priority for procurement decisions\n` +
          `- Clinical evidence supports ongoing evaluation of emerging products`,
      },
      {
        heading: 'Risk Assessment',
        content:
          `- **Supply Chain Risk**: Moderate — multiple sourcing dependencies identified\n` +
          `- **Regulatory Risk**: Low to Moderate — compliance frameworks are established\n` +
          `- **Financial Risk**: Variable — pricing trends require monitoring\n` +
          `- **Clinical Risk**: Low — established safety profiles for current products`,
      },
      {
        heading: 'Recommendations',
        content:
          `- Conduct detailed product-level analysis using iRemedy AI tracking tools\n` +
          `- Monitor regulatory updates from FDA and relevant agencies\n` +
          `- Evaluate BAA/TAA compliance for government procurement pathways\n` +
          `- Review formulary positioning and cost-effectiveness data`,
      },
    ],
    sources: [
      'FDA National Drug Code Directory (NDCDIR)',
      'FDA Orange Book: Approved Drug Products with Therapeutic Equivalence Evaluations',
      'Federal Supply Schedule (FSS) Pricing Data',
      'Centers for Medicare & Medicaid Services (CMS) Drug Pricing Reports',
      'iRemedy AI Platform — Sample Data (API key not configured)',
    ],
  };
}

async function generateBriefingFromAPI(
  topic: string,
  audience: AudienceType,
  productContext: string,
): Promise<BriefingData> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return createFallbackBriefing(topic, audience);
  }

  const systemPrompt = buildSystemPrompt(audience, productContext);

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
      messages: [
        {
          role: 'user',
          content: `Generate an intelligence briefing on the following topic: ${topic}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  const text: string = result.content?.[0]?.text ?? '';

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse briefing response');
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    title: string;
    sections: { heading: string; content: string }[];
    sources: string[];
  };

  return {
    title: parsed.title,
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    audience,
    sections: parsed.sections,
    sources: parsed.sources,
  };
}

const BriefingGenerator = () => {
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState<AudienceType>('Congressional');
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { products } = useProducts();

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setError(null);
    setBriefing(null);

    try {
      const productContext = buildProductContext(products, topic);
      const result = await generateBriefingFromAPI(topic, audience, productContext);
      setBriefing(result);
    } catch {
      setBriefing(createFallbackBriefing(topic, audience));
      setError('AI generation failed. Showing sample briefing with placeholder data.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="font-heading text-3xl font-bold text-navy">
        Intelligence Briefing Generator
      </h1>
      <p className="mt-2 text-navy/70">
        Generate AI-powered intelligence briefings on any topic, product, or risk area.
      </p>

      <GradientDivider className="my-6" />

      {/* Input form */}
      <div className="mb-8 space-y-4 rounded-xl border border-navy/10 bg-white p-6 shadow-sm">
        <div>
          <label
            htmlFor="briefing-topic"
            className="mb-1 block text-sm font-medium text-navy"
          >
            Briefing Topic
          </label>
          <input
            id="briefing-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Insulin Supply Chain Risk, Oncology Drug Pricing, Antibiotic Shortages"
            className="w-full rounded-lg border border-navy/20 px-4 py-2.5 text-navy placeholder-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && topic.trim()) {
                handleGenerate();
              }
            }}
          />
        </div>

        <div>
          <label
            htmlFor="briefing-audience"
            className="mb-1 block text-sm font-medium text-navy"
          >
            Target Audience
          </label>
          <select
            id="briefing-audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value as AudienceType)}
            className="w-full rounded-lg border border-navy/20 bg-white px-4 py-2.5 text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <PatrioticButton
            size="md"
            loading={isGenerating}
            disabled={!topic.trim()}
            onClick={handleGenerate}
          >
            Generate Briefing
          </PatrioticButton>
          {products.length > 0 && (
            <span className="text-sm text-navy/50">
              {products.length} tracked product{products.length !== 1 ? 's' : ''} available for context
            </span>
          )}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-navy/80">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-navy/20 border-t-gold" />
          <p className="font-heading text-lg font-semibold text-navy">
            Generating Intelligence Briefing...
          </p>
          <p className="mt-1 text-sm text-navy/50">
            Analyzing topic, correlating product data, and compiling findings.
          </p>
        </div>
      )}

      {/* Briefing output */}
      {briefing && !isGenerating && <BriefingPreview briefing={briefing} />}
    </div>
  );
};

export default BriefingGenerator;
