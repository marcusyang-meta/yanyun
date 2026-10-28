// Roster screenshot OCR — the member-list sibling of the gear OCR
// engine (GearOcr.ts): same tesseract.js worker (chi_sim+eng), same
// image preparation (original + enhanced pass), images never leave
// the browser. Gear OCR parses affix panels; a member list is just
// lines of names, so this module only collects the recognized text
// lines — classification (matched / new / unrecognized) happens on
// the backend against the guild's real rosters, never here.
import Tesseract from 'tesseract.js';
import { ocrPrepare, ocrEnhance, ocrClean } from './GearOcr.ts';

export async function runRosterOcr(files: File[]): Promise<string[]> {
  const worker = await Tesseract.createWorker('chi_sim+eng');
  try {
    const lines: string[] = [];
    const seen = new Set<string>();
    const pushText = (text: string) => {
      for (const raw of String(text || '').split(/\r?\n/)) {
        const line = ocrClean(raw).trim();
        if (!line || seen.has(line)) continue;
        seen.add(line);
        lines.push(line);
      }
    };
    for (const file of files) {
      const prepared = await ocrPrepare(file);
      const r1 = await worker.recognize(prepared);
      pushText(r1.data?.text || '');
      const enhanced = await ocrEnhance(file);
      await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK });
      const r2 = await worker.recognize(enhanced);
      pushText(r2.data?.text || '');
      await worker.setParameters({ tessedit_pageseg_mode: Tesseract.PSM.AUTO });
    }
    return lines;
  } finally {
    await worker.terminate().catch(() => undefined);
  }
}
