/* Share-image action for squad (car) pages.
 *
 * Chat apps like WeChat render no preview card for a pasted link, so
 * the squad card has to travel as an image file. This module fetches
 * the car's OG card PNG (the URL is composed server-side and shipped
 * as the page's shareImageUrl field; clients never compose OG URLs)
 * and delivers it by the best channel the browser offers, in order:
 * the system share sheet when the browser can share files; the
 * system clipboard as an image on desktop (the card carries its own
 * short-link QR since #114, so the pasted picture is self-contained);
 * or, as the last resort, downloading the image while copying the
 * short link, so the user posts the picture into the group and
 * pastes the link under it in two steps.
 *
 * The plan decision and the effect orchestration are pure /
 * dependency-injected here so vitest covers every branch without a
 * DOM; browserShareImageDeps() is the production wiring. */

export type ShareImagePlan = 'share-file' | 'copy-image' | 'download-and-copy';

/* First branch decision: native file sharing when the browser can
 * share this file; the fallback stage decides the rest. */
export function planShareImage(canShareFiles: boolean): ShareImagePlan {
  return canShareFiles ? 'share-file' : 'download-and-copy';
}

/* Fallback-stage decision (no file sharing): write the image to the
 * clipboard when the browser can do that, download+copy otherwise. */
export function planShareImageFallback(canCopyImage: boolean): ShareImagePlan {
  return canCopyImage ? 'copy-image' : 'download-and-copy';
}

export type ShareImageResult =
  | { kind: 'shared' }
  | { kind: 'cancelled' }
  | { kind: 'clipboard' }
  | { kind: 'fallback'; copied: boolean }
  | { kind: 'failed' };

export interface ShareImageDeps {
  fetchBlob: (url: string) => Promise<Blob>;
  makeFile: (blob: Blob, fileName: string) => File;
  canShareFiles: (file: File) => boolean;
  shareFiles: (file: File, text: string) => Promise<void>;
  canCopyImage: () => boolean;
  writeImageToClipboard: (blob: Blob, text: string) => Promise<void>;
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
      // Any other share failure still leaves the fallback stage: the
      // clipboard on desktop, the download path below it.
    }
  }
  if (planShareImageFallback(deps.canCopyImage()) === 'copy-image') {
    try {
      await deps.writeImageToClipboard(blob, req.linkUrl);
      return { kind: 'clipboard' };
    } catch {
      // Clipboard refused (permission, expired user activation, an
      // item shape the browser rejects): degrade to the download
      // path instead of failing the whole action.
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
    canCopyImage: () => {
      // Async Clipboard image writes need both the write method and
      // the ClipboardItem constructor (Chromium ships both; where
      // either is missing the plan falls through to download+copy).
      return typeof ClipboardItem !== 'undefined'
        && !!navigator.clipboard
        && typeof navigator.clipboard.write === 'function';
    },
    writeImageToClipboard: async (blob, text) => {
      // The ClipboardItem type key must be the PNG mime even if the
      // fetched blob reports an empty/generic type.
      const png = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });
      try {
        // Preferred shape: the image plus the short link as plain
        // text, so a paste into a rich editor can offer either. The
        // card already prints the link as a QR, so the text is a
        // bonus — never let it sink the image write.
        await navigator.clipboard.write([new ClipboardItem({
          'image/png': png,
          'text/plain': new Blob([text], { type: 'text/plain' }),
        })]);
      } catch {
        // Browsers that accept only one item type (or reject the
        // text payload) get the image alone.
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      }
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
