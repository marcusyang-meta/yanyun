/* ===================================================
 * AI recap provider seam (P18 AI activity recaps, premium T3).
 *
 * The recap feature talks to its text-generation backend ONLY
 * through the RecapProvider interface: input is the structured
 * recap data package (groupings/recap-service.ts), output is the
 * recap text as a list of paragraphs. The generated text is
 * content, not UI copy — it never enters the strings catalog.
 *
 * Provider (marcus, 2026-10-28): Cloudflare Workers AI, reached
 * through the AI binding (env.AI, declared as [ai] in
 * wrangler.toml — no API key, no external account). The model is
 * pinned in code (RECAP_MODEL): Qwen3 30B A3B FP8 — a current
 * catalog instruct model with strong Chinese output, which is
 * what the recap packages ask for (language zh-CN).
 *
 * QUOTA DISCIPLINE: Workers AI's free allocation is 10,000
 * neurons/day account-wide; this model prices at 4,625 neurons
 * per million input tokens and 30,475 per million output tokens
 * (Cloudflare pricing page, 2026-10-28), so one recap — roughly
 * 1k input tokens of data package, a few hundred output tokens —
 * costs on the order of 15–25 neurons: hundreds of generations a
 * day fit inside the free allocation, far above the per-guild
 * daily cap in platform/limits.ts. Do NOT enable Workers Paid to
 * raise this: overage fails as a provider error (recorded as the
 * recap's failed state, retryable) until marcus decides.
 *
 * Defensive path, unchanged: when the binding is absent,
 * recapProviderFromEnv returns null and every recap surface
 * composes its not-enabled variant — nothing is generated,
 * nothing is stored, no recap content is ever dispatched. Tests
 * inject a fake provider (or a stub AI binding) — never a real
 * account call.
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

/** The Workers AI model every recap is generated with. Pinned in
 *  code on purpose: changing the voice of the feature is a release
 *  decision, not an environment tweak. */
export const RECAP_MODEL = '@cf/qwen/qwen3-30b-a3b-fp8';

const PROVIDER_LABEL = 'workers-ai';

const SYSTEM_PROMPT = [
  'You write a short post-activity recap for a gaming guild, from the structured data package provided.',
  'Write in the language named by the package\'s "language" field.',
  'Return ONLY a JSON object of the form {"paragraphs": ["...", "..."]} with 2 to 4 paragraphs.',
  'Use ONLY facts present in the package. The "missing" array names data the platform does not have:',
  'never mention, estimate or invent anything about those sections (for example absentees or a',
  'completion time). Do not output member identifiers other than the nicknames given.',
  'Tone: warm, concrete, brief — a guild notice-board recap, not marketing copy.',
  // Qwen3 hybrid-thinking switch: answer directly, no reasoning block.
  '/no_think',
].join(' ');

function parseParagraphs(content: string): string[] {
  // Defensive: strip a reasoning block if the model emitted one
  // despite /no_think, ahead of paragraph parsing.
  const text = String(content || '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
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

/** Pull the generated text out of a Workers AI run result. The
 *  binding's typed output for this model is a union (chat-completion
 *  shape, text-completion shape, or a bare string), so read the
 *  text from whichever member arrived. */
function extractContent(out: unknown): string {
  if (typeof out === 'string') return out;
  if (out && typeof out === 'object') {
    const o = out as {
      response?: unknown;
      choices?: { message?: { content?: unknown }; text?: unknown }[];
    };
    if (typeof o.response === 'string') return o.response;
    const choice = o.choices && o.choices[0];
    if (choice) {
      if (choice.message && typeof choice.message.content === 'string') return choice.message.content;
      if (typeof choice.text === 'string') return choice.text;
    }
  }
  return '';
}

class WorkersAiRecapProvider implements RecapProvider {
  id: string;
  ai: Ai;
  constructor(ai: Ai) {
    this.ai = ai;
    this.id = `${PROVIDER_LABEL}:${RECAP_MODEL}`;
  }
  async generate(pkg: RecapDataPackage): Promise<string[]> {
    const out: unknown = await this.ai.run(RECAP_MODEL, {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(pkg) },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });
    const content = extractContent(out);
    if (!content) throw new Error('recap provider returned empty content');
    return parseParagraphs(content);
  }
}

/** Assemble the provider from the worker env, or null when the AI
 *  binding is absent — the feature's not-enabled state. */
export function recapProviderFromEnv(env: Env): RecapProvider | null {
  return env.AI ? new WorkersAiRecapProvider(env.AI) : null;
}
