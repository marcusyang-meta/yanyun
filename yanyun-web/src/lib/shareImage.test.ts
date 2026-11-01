import { describe, expect, it, vi } from 'vitest';
import {
  planShareImage,
  runShareImage,
  shareImageFileName,
  type ShareImageDeps,
} from './shareImage';

const REQ = {
  imageUrl: 'https://og.yanyun.app/og/jijiguagua/car/10029700003.png',
  fileName: '10029700003.png',
  shareText: '周日美东下午5点半双十 https://yanyun.app/c/mffl3BS',
  linkUrl: 'https://yanyun.app/c/mffl3BS',
};

function fakeDeps(overrides: Partial<ShareImageDeps> = {}) {
  const blob = new Blob(['png'], { type: 'image/png' });
  const deps: ShareImageDeps = {
    fetchBlob: vi.fn(async () => blob),
    makeFile: vi.fn((b: Blob, name: string) => new File([b], name, { type: 'image/png' })),
    canShareFiles: vi.fn(() => false),
    shareFiles: vi.fn(async () => {}),
    downloadBlob: vi.fn(),
    copyText: vi.fn(async () => true),
    ...overrides,
  };
  return deps;
}

describe('planShareImage', () => {
  it('uses the native share sheet when file sharing is available', () => {
    expect(planShareImage(true)).toBe('share-file');
  });

  it('falls back to download + copy when file sharing is unavailable', () => {
    expect(planShareImage(false)).toBe('download-and-copy');
  });
});

describe('runShareImage', () => {
  it('shares the fetched file when the browser can share files', async () => {
    const deps = fakeDeps({ canShareFiles: vi.fn(() => true) });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'shared' });
    expect(deps.shareFiles).toHaveBeenCalledTimes(1);
    const [file, text] = (deps.shareFiles as ReturnType<typeof vi.fn>).mock.calls[0];
    expect((file as File).name).toBe(REQ.fileName);
    expect(text).toBe(REQ.shareText);
    expect(deps.downloadBlob).not.toHaveBeenCalled();
    expect(deps.copyText).not.toHaveBeenCalled();
  });

  it('downloads the image and copies the link when file sharing is unavailable', async () => {
    const deps = fakeDeps();
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'fallback', copied: true });
    expect(deps.downloadBlob).toHaveBeenCalledTimes(1);
    expect(deps.copyText).toHaveBeenCalledWith(REQ.linkUrl);
    expect(deps.shareFiles).not.toHaveBeenCalled();
  });

  it('reports copied=false when the fallback copy fails', async () => {
    const deps = fakeDeps({ copyText: vi.fn(async () => false) });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'fallback', copied: false });
    expect(deps.downloadBlob).toHaveBeenCalledTimes(1);
  });

  it('still reports the fallback when the copy step throws', async () => {
    const deps = fakeDeps({
      copyText: vi.fn(async () => { throw new Error('denied'); }),
    });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'fallback', copied: false });
  });

  it('treats a dismissed share sheet as cancelled, with no fallback', async () => {
    const abort = new Error('dismissed');
    abort.name = 'AbortError';
    const deps = fakeDeps({
      canShareFiles: vi.fn(() => true),
      shareFiles: vi.fn(async () => { throw abort; }),
    });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'cancelled' });
    expect(deps.downloadBlob).not.toHaveBeenCalled();
  });

  it('falls back to download + copy when sharing fails for another reason', async () => {
    const deps = fakeDeps({
      canShareFiles: vi.fn(() => true),
      shareFiles: vi.fn(async () => { throw new Error('NotAllowedError'); }),
    });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'fallback', copied: true });
    expect(deps.downloadBlob).toHaveBeenCalledTimes(1);
  });

  it('fails when the card image cannot be fetched', async () => {
    const deps = fakeDeps({
      fetchBlob: vi.fn(async () => { throw new Error('network'); }),
    });
    const result = await runShareImage(deps, REQ);
    expect(result).toEqual({ kind: 'failed' });
    expect(deps.downloadBlob).not.toHaveBeenCalled();
    expect(deps.shareFiles).not.toHaveBeenCalled();
  });
});

describe('shareImageFileName', () => {
  it('reuses the OG image file name from the URL', () => {
    expect(shareImageFileName(REQ.imageUrl)).toBe('10029700003.png');
  });

  it('falls back to a fixed name for unexpected URLs', () => {
    expect(shareImageFileName('https://og.yanyun.app/og/jijiguagua')).toBe('car-card.png');
    expect(shareImageFileName('not a url')).toBe('car-card.png');
  });
});
