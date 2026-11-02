/* Share-image action for the mobile squad (car) detail page.
 *
 * Chat apps like WeChat render no preview card for a pasted link, so
 * the squad card has to travel as an image file (the Web client
 * learned this first; see yanyun-web/src/lib/shareImage.ts). The
 * server composes the car's OG card URL and ships it as the detail
 * page shell's shareImageUrl field — clients never compose OG URLs.
 * Sharing that remote URL through the system sheet would send the
 * link, not the picture (and Android's share targets expect a local
 * file), so the PNG is downloaded into the cache directory first and
 * the local file goes to expo-sharing's shareAsync.
 *
 * Any failure along the image path — sharing API unavailable,
 * download or share-sheet error — falls back to sharing the car's
 * short link, which is exactly what the header's plain share entry
 * does; only when that also fails does the caller surface the
 * shell's detailShareImageFailed copy. Never silence.
 *
 * The orchestration is dependency-injected here so vitest covers
 * every branch without native modules; the screen wires the real
 * expo-file-system / expo-sharing calls. This module must stay free
 * of native imports (the test runner only stubs react-native,
 * expo-secure-store and expo-constants). */

/* File name for the downloaded card: the OG route already names the
 * image <carId>.png, so reuse its last path segment (mirrors the Web
 * helper of the same name). */
export function shareImageFileName(imageUrl: string): string {
  try {
    const seg = new URL(imageUrl).pathname.split('/').filter(Boolean).pop() || '';
    return seg.endsWith('.png') ? seg : 'car-card.png';
  } catch {
    return 'car-card.png';
  }
}

export interface ShareImageDeps {
  /* Download url into the cache dir under fileName; resolves the
   * local file URI. Rejects on any network/HTTP failure. */
  download: (url: string, fileName: string) => Promise<string>;
  isSharingAvailable: () => Promise<boolean>;
  shareFile: (uri: string, options: { mimeType: string; dialogTitle: string }) => Promise<void>;
  shareLink: (url: string) => Promise<void>;
}

export type ShareImageOutcome = 'shared-image' | 'shared-link' | 'failed';

export async function deliverShareImage(
  deps: ShareImageDeps,
  req: { imageUrl: string; linkUrl: string | null; dialogTitle: string },
): Promise<ShareImageOutcome> {
  try {
    if (await deps.isSharingAvailable()) {
      const uri = await deps.download(req.imageUrl, shareImageFileName(req.imageUrl));
      await deps.shareFile(uri, { mimeType: 'image/png', dialogTitle: req.dialogTitle });
      return 'shared-image';
    }
  } catch { /* fall through to the link share below */ }
  if (req.linkUrl) {
    try {
      await deps.shareLink(req.linkUrl);
      return 'shared-link';
    } catch { /* fall through */ }
  }
  return 'failed';
}
