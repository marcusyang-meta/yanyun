/* ===================================================
 * AI recap provider seam (P18 AI activity recaps, premium T3).
 *
 * The recap feature talks to its text-generation backend ONLY
 * through the RecapProvider interface: input is the structured
 * recap data package (groupings/recap-service.ts), output is the
 * recap text as a list of paragraphs. The generated text is
 * content, not UI copy — it never enters the strings catalog.
 *
 * Configuration is env-only, following the platform's existing
 * secret pattern (Stripe / Statsig in context.ts):
 *   AI_RECAP_API_KEY   — required; the provider credential.
 *   AI_RECAP_MODEL     — required; the model id to call.
 *   AI_RECAP_BASE_URL  — optional; OpenAI-compatible API origin
 *                        (default https://api.openai.com/v1).
 *   AI_RECAP_PROVIDER  — optional; provider label used in the
 *                        stored provider id (default 'openai').
 * ALL of key + model must be present before a provider exists.
 * Unconfigured (production today, pending the provider/key
 * decision) recapProviderFromEnv returns null, and every recap
 * surface composes its not-enabled variant: nothing is generated,
 * nothing is stored, no recap content is ever dispatched.
 *
 * The built-in implementation speaks the OpenAI-compatible
 * chat-completions shape, so a conforming endpoint (OpenAI,
 * Azure, DeepSeek, a local gateway, ...) drops in by env alone.
 * Tests inject a fake provider through the service's provider
 * parameter — never through env.
 * =================================================== */
import type { Env } from './context.ts';

/** Structured recap data package: everything the provider may see.
 *  Assembled by the groupings recap service from platform data
 *  only; `missing` names the sections the platform has no data
 *  for, so the provider is told to omit them instead of inventing
 *  them. Mirrored in groupings/recap-service.ts (the assembler
 *  builds exactly this shape). */
export interface RecapDataPackage {
  language: string;
  grouping: {
    title: string;
    type: string;
    dungeon: string;
    startsAtUtc: number | null;
    maxSlots: number;
  };
  timeline: {
    createdAt: string | null;
    startsAtUtc: number | null;
    reminderSentAt: number | null;
    completedAt: number | null;
  };
  attendance: {
    seatedCount: number;
    capacity: number;
    emptySeats: number;
    readyCount: number;
    seats: { nickname: string; role: string; weapon: string; ready: boolean }[];
  };
  results: { teamName: string; members: string; timeMs: number; note: string }[] | null;
  missing: string[];
}

export interface RecapProvider {
  /** Stored on the recap row: '<provider label>:<model>'. */
  id: string;
  /** Generate the recap paragraphs for one data package. Throws on
   *  provider failure of every kind; the caller records the failure state. */
  generate(pkg: RecapDataPackage): Promise<string[]>;
}

export interface AiRecapConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  providerLabel: string;
}

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_PROVIDER_LABEL = 'openai';

/** The env configuration, or null when the seam is unconfigured. */
export function aiRecapConfig(env: Env): AiRecapConfig | null {
  const apiKey = String(env.AI_RECAP_API_KEY || '').trim();
  const model = String(env.AI_RECAP_MODEL || '').trim();
  if (!apiKey || !model) return null;
  const baseUrl = String(env.AI_RECAP_BASE_URL || '').trim().replace(/\/+$/, '') || DEFAULT_BASE_URL;
  const providerLabel = String(env.AI_RECAP_PROVIDER || '').trim() || DEFAULT_PROVIDER_LABEL;
  return { apiKey, model, baseUrl, providerLabel };
}

const SYSTEM_PROMPT = [
  'You write a short post-activity recap for a gaming guild, from the structured data package provided.',
  'Write in the language named by the package\'s "language" field.',
  'Return ONLY a JSON object of the form {"paragraphs": ["...", "..."]} with 2 to 4 paragraphs.',
  'Use ONLY facts present in the package. The "missing" array names data the platform does not have:',
  'never mention, estimate or invent anything about those sections (for example absentees or a',
  'completion time). Do not output member identifiers other than the nicknames given.',
  'Tone: warm, concrete, brief — a guild notice-board recap, not marketing copy.',
].join(' ');

function parseParagraphs(content: string): string[] {
  const text = String(content || '').trim();
  if (!text) throw new Error('recap provider returned empty content');
  try {
    const obj = JSON.parse(text) as { paragraphs?: unknown };
    if (Array.isArray(obj.paragraphs)) {
      const ps = obj.paragraphs.map((p) => String(p || '').trim()).filter(Boolean);
      if (ps.length) return ps.slice(0, 8);
    }
  } catch { /* fall through to the plain-text split */ }
  const ps = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!ps.length) throw new Error('recap provider returned no paragraphs');
  return ps.slice(0, 8);
}

class OpenAiCompatibleRecapProvider implements RecapProvider {
  id: string;
  cfg: AiRecapConfig;
  constructor(cfg: AiRecapConfig) {
    this.cfg = cfg;
    this.id = `${cfg.providerLabel}:${cfg.model}`;
  }
  async generate(pkg: RecapDataPackage): Promise<string[]> {
    const res = await fetch(`${this.cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.cfg.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.cfg.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(pkg) },
        ],
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    const data = (await res.json().catch(() => ({}))) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(`recap provider ${res.status}: ${(data.error && data.error.message) || 'request failed'}`);
    }
    const content = data.choices && data.choices[0] && data.choices[0].message
      ? String(data.choices[0].message.content || '')
      : '';
    return parseParagraphs(content);
  }
}

/** Assemble the configured provider, or null when the seam is
 *  unconfigured — the feature's not-enabled state. */
export function recapProviderFromEnv(env: Env): RecapProvider | null {
  const cfg = aiRecapConfig(env);
  return cfg ? new OpenAiCompatibleRecapProvider(cfg) : null;
}
