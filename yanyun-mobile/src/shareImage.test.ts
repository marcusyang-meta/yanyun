import { describe, expect, it, vi } from 'vitest';
import { deliverShareImage, shareImageFileName, type ShareImageDeps } from './shareImage';

describe('shareImageFileName', () => {
  it('reuses the OG route file name (<carId>.png)', () => {
    expect(shareImageFileName('https://og.yanyun.app/og/jijiguagua/car/10030400001.png'))
      .toBe('10030400001.png');
  });

  it('falls back when the last segment is not a png', () => {
    expect(shareImageFileName('https://og.yanyun.app/og/jijiguagua')).toBe('car-card.png');
  });

  it('falls back on an unparseable URL', () => {
    expect(shareImageFileName('not a url')).toBe('car-card.png');
  });
});

const IMAGE_URL = 'https://og.yanyun.app/og/jijiguagua/car/10030400001.png';
const LINK_URL = 'https://yanyun.app/c/Jpx9mnv';

function fakeDeps(overrides: Partial<ShareImageDeps> = {}): ShareImageDeps {
  return {
    download: vi.fn(async () => 'file:///cache/10030400001.png'),
    isSharingAvailable: vi.fn(async () => true),
    shareFile: vi.fn(async () => {}),
    shareLink: vi.fn(async () => {}),
    ...overrides,
  };
}

describe('deliverShareImage', () => {
  it('downloads the card and shares the local file as image/png', async () => {
    const deps = fakeDeps();
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: LINK_URL, dialogTitle: '分享图' });
    expect(out).toBe('shared-image');
    expect(deps.download).toHaveBeenCalledWith(IMAGE_URL, '10030400001.png');
    expect(deps.shareFile).toHaveBeenCalledWith('file:///cache/10030400001.png', {
      mimeType: 'image/png',
      dialogTitle: '分享图',
    });
    expect(deps.shareLink).not.toHaveBeenCalled();
  });

  it('falls back to the short link when sharing is unavailable', async () => {
    const deps = fakeDeps({ isSharingAvailable: vi.fn(async () => false) });
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: LINK_URL, dialogTitle: '分享图' });
    expect(out).toBe('shared-link');
    expect(deps.download).not.toHaveBeenCalled();
    expect(deps.shareLink).toHaveBeenCalledWith(LINK_URL);
  });

  it('falls back to the short link when the download fails', async () => {
    const deps = fakeDeps({
      download: vi.fn(async () => { throw new Error('network'); }),
    });
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: LINK_URL, dialogTitle: '分享图' });
    expect(out).toBe('shared-link');
    expect(deps.shareFile).not.toHaveBeenCalled();
    expect(deps.shareLink).toHaveBeenCalledWith(LINK_URL);
  });

  it('falls back to the short link when the share sheet errors', async () => {
    const deps = fakeDeps({
      shareFile: vi.fn(async () => { throw new Error('sheet'); }),
    });
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: LINK_URL, dialogTitle: '分享图' });
    expect(out).toBe('shared-link');
    expect(deps.shareLink).toHaveBeenCalledWith(LINK_URL);
  });

  it('reports failed when the image path fails and there is no link', async () => {
    const deps = fakeDeps({ isSharingAvailable: vi.fn(async () => false) });
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: null, dialogTitle: '分享图' });
    expect(out).toBe('failed');
    expect(deps.shareLink).not.toHaveBeenCalled();
  });

  it('reports failed when the link share also errors', async () => {
    const deps = fakeDeps({
      isSharingAvailable: vi.fn(async () => false),
      shareLink: vi.fn(async () => { throw new Error('share'); }),
    });
    const out = await deliverShareImage(deps, { imageUrl: IMAGE_URL, linkUrl: LINK_URL, dialogTitle: '分享图' });
    expect(out).toBe('failed');
  });
});
