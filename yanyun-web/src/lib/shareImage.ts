/* Share-image action for squad (car) pages.
 *
 * Chat apps like WeChat render no preview card for a pasted link, so
 * the squad card has to travel as an image file. This module fetches
 * the car's OG card PNG (the URL is composed server-side and shipped
 * as the page's shareImageUrl field; clients never compose OG URLs)
 * and either hands it to the system share sheet — when the browser
 * can share files — or falls back to downloading the image while
 * copying the short link, so the user posts the picture into the
 * group and pastes the link under it in two steps.
 *
 * The plan decision and the effect orchestration are pure /
 * dependency-injected here so vitest covers every branch without a
 * DOM; browserShareImageDeps() is the production wiring. */

export type ShareImagePlan = 'share-file' | 'download-and-copy';

/* The whole branch decision: native file sharing when the browser
 * can share this file, the download+copy fallback otherwise. */
export function planShareImage(canShareFiles: boolean): ShareImagePlan {
  return canShareFiles ? 'share-file' : 'download-and-copy';
}

export type ShareImageResult =
  | { kind: 'shared' }
  | { kind: 'cancelled' }
  | { kind: 'fallback'; copied: boolean }
  | { kind: 'failed' };

export interface ShareImageDeps {
  fetchBlob: (url: string) => Promise<Blob>;
  makeFile: (blob: Blob, fileName: string) => File;
  canShareFiles: (file: File) => boolean;
  shareFiles: (file: File, text: string) => Promise<void>;
  downloadBlob: (blob: Blob, fileName: string) => void;
  copyText: (text: string) => Promise<boolean>;
}

export interface ShareImageRequest {
  imageUrl: string;
  fileName: string;
  shareText: string;
  linkUrl: string;
}

function isAbortError(err: unknown): boolean {
  return !!err && typeof err === 'object' && (err as { name?: unknown }).name === 'AbortError';
}

export async function runShareImage(
  deps: ShareImageDeps,
  req: ShareImageRequest,
): Promise<ShareImageResult> {
  let blob: Blob;
  let file: File;
  try {
    blob = await deps.fetchBlob(req.imageUrl);
    file = deps.makeFile(blob, req.fileName);
  } catch {
    return { kind: 'failed' };
  }
  if (planShareImage(deps.canShareFiles(file)) === 'share-file') {
    try {
      await deps.shareFiles(file, req.shareText);
      return { kind: 'shared' };
    } catch (err) {
      // The user closing the share sheet is a choice, not a failure.
      if (isAbortError(err)) return { kind: 'cancelled' };
      // Any other share failure still leaves the fallback path: the
      // user gets the image file plus the link on the clipboard.
    }
  }
  deps.downloadBlob(blob, req.fileName);
  const copied = await deps.copyText(req.linkUrl).catch(() => false);
  return { kind: 'fallback', copied };
}

/* File name for the shared/downloaded card: the OG route already
 * names the image <carId>.png, so reuse its last path segment. */
export function shareImageFileName(imageUrl: string): string {
  try {
    const seg = new URL(imageUrl).pathname.split('/').filter(Boolean).pop() || '';
    return seg.endsWith('.png') ? seg : 'car-card.png';
  } catch {
    return 'car-card.png';
  }
}

/* Browser-backed dependencies (production wiring; unit tests inject
 * fakes instead). */
export function browserShareImageDeps(): ShareImageDeps {
  return {
    fetchBlob: async (url) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`share image fetch ${res.status}`);
      return res.blob();
    },
    makeFile: (blob, fileName) => new File([blob], fileName, { type: blob.type || 'image/png' }),
    canShareFiles: (file) => {
      const nav = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      return typeof nav.canShare === 'function' && nav.canShare({ files: [file] });
    },
    shareFiles: async (file, text) => {
      await navigator.share({ files: [file], text });
    },
    downloadBlob: (blob, fileName) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    },
    copyText: async (text) => {
      // Same two-stage copy as the detail page's link share: async
      // clipboard first, hidden-textarea execCommand as the fallback.
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          return true;
        }
        throw new Error('no clipboard');
      } catch {
        try {
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          return true;
        } catch {
          return false;
        }
      }
    },
  };
}
