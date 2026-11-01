import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { fill, fmtDate, theme } from './lib/format.ts';
import { runShareImage, browserShareImageDeps, shareImageFileName } from './lib/shareImage.ts';
import { toast, ToastHost } from './guild/components/Toast.react.tsx';
import type { CarSharePageQuery as CarSharePageQueryType } from './__generated__/CarSharePageQuery.graphql';

/* Public car share page (/s/:code): the anonymous visiting surface
 * for one shared squad. Everything on it comes from the
 * sharedGrouping page shell (the code is the capability — the shell
 * composes only the car's public face: title, guild, type, dungeon,
 * time, headcount, per-seat occupancy; no member detail exists in
 * the payload at all). The page is read-only by construction: the
 * only way onward is the short link itself — signed-out visitors go
 * through Discord login with the short link as the return target
 * (after login the /c landing split sends members to the full squad
 * page), and signed-in visitors follow the same link straight to
 * the full page. Unknown / dead codes render the shell's not-found
 * state. */

const CarSharePageQueryNode = graphql`
  query CarSharePageQuery($code: String!) {
    viewer {
      user {
        discordId
      }
    }
    sharedGrouping(code: $code) {
      exists
      guildName
      title
      dungeonName
      startsAt
      status
      occupiedCount
      maxSlots
      seats {
        index
        occupied
      }
      shareKicker
      shareLoginLabel
      shareOpenLabel
      shareNotFoundTitle
      shareNotFoundBody
      shareReadonlyHint
      shareStatusOpenLabel
      shareStatusClosedLabel
      shareStatusCompletedLabel
      sharePeopleTemplate
      shareSeatsTitle
      shareTypeLabel
      shareImageUrl
      shareImageLabel
      shareImageSaved
      shareImageFailed
      shareCopyFailedManual
    }
  }
`;

const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.22)', borderRadius: 10, padding: '14px 16px', background: 'rgba(0,0,0,.25)',
};
const btnGold: React.CSSProperties = {
  padding: '7px 15px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
  border: `1px solid ${theme.gold}`, color: theme.goldHi, fontSize: 13, textDecoration: 'none',
  display: 'inline-block',
};
const chip: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.35)', borderRadius: 999, padding: '2px 10px',
  color: theme.goldHi, fontSize: 12, letterSpacing: 1,
};

export default function CarSharePage({ queries, extraProps }: {
  queries: { carShareQuery: PreloadedQuery<CarSharePageQueryType> };
  extraProps: { code: string };
}) {
  const data = usePreloadedQuery<CarSharePageQueryType>(CarSharePageQueryNode, queries.carShareQuery);
  const page = data.sharedGrouping as any;
  const loggedIn = !!(data.viewer as any)?.user;
  const code = extraProps?.code || '';
  // The short link is the one onward path: its landing split sends
  // members to the full squad page; login returns here first.
  const shortPath = `/c/${code}`;
  const ctaHref = loggedIn
    ? shortPath
    : `/auth/discord/login?returnTo=${encodeURIComponent(shortPath)}`;
  const statusLabel = page.status === 'open'
    ? page.shareStatusOpenLabel
    : page.status === 'completed'
      ? page.shareStatusCompletedLabel
      : page.shareStatusClosedLabel;

  // Share this squad's card image: native file share when the
  // browser supports it, otherwise download the PNG + copy the short
  // link (chat groups like WeChat show no link preview, so the card
  // travels as a picture with the link pasted under it).
  const shareCardImage = async () => {
    const imageUrl = page.shareImageUrl;
    if (!imageUrl) return;
    const linkUrl = `${window.location.origin}${shortPath}`;
    const result = await runShareImage(browserShareImageDeps(), {
      imageUrl,
      fileName: shareImageFileName(imageUrl),
      shareText: `${page.title} ${linkUrl}`,
      linkUrl,
    });
    if (result.kind === 'fallback') {
      toast(result.copied ? page.shareImageSaved : page.shareCopyFailedManual);
    } else if (result.kind === 'failed') {
      toast(page.shareImageFailed);
    }
  };

  return (
    <div className="yy-page">
      <ToastHost />
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 3 }}>{page.shareKicker}</span>
          {page.exists && page.shareImageUrl && (
            <button onClick={shareCardImage} style={{ ...btnGold, marginLeft: 'auto' }}>
              {page.shareImageLabel}
            </button>
          )}
          {page.exists && (
            <a href={ctaHref} style={{ ...btnGold, marginLeft: page.shareImageUrl ? undefined : 'auto' }}>
              {loggedIn ? page.shareOpenLabel : page.shareLoginLabel}
            </a>
          )}
        </div>
        {page.exists ? (
          <>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 30, fontWeight: 700, letterSpacing: 2, marginTop: 14 }}>
              {page.title}
            </div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 4 }}>{page.guildName}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <span style={chip}>{page.shareTypeLabel}</span>
              {page.dungeonName && <span style={chip}>{page.dungeonName}</span>}
              <span style={chip}>{statusLabel}</span>
              <span style={{ color: theme.paper, fontSize: 13 }}>
                {fmtDate(page.startsAt)} · {fill(page.sharePeopleTemplate ?? '', { occupied: page.occupiedCount, max: page.maxSlots })}
              </span>
            </div>
            <div style={{ ...card, marginTop: 16 }}>
              <div style={{ color: theme.muted, fontSize: 12, letterSpacing: 2 }}>{page.shareSeatsTitle}</div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
                {(page.seats as ReadonlyArray<{ index: number; occupied: boolean }>).map((seat) => (
                  <div
                    key={seat.index}
                    style={{
                      width: 40, height: 40, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: seat.occupied ? 700 : 400,
                      border: `1px solid ${seat.occupied ? theme.gold : 'rgba(201,163,92,.25)'}`,
                      background: seat.occupied ? 'rgba(201,163,92,.18)' : 'transparent',
                      color: seat.occupied ? theme.goldHi : theme.muted,
                    }}
                  >
                    {seat.index + 1}
                  </div>
                ))}
              </div>
              <div style={{ color: theme.muted, fontSize: 12.5, marginTop: 12, lineHeight: 1.7 }}>
                {page.shareReadonlyHint}
              </div>
            </div>
          </>
        ) : (
          <div style={{ ...card, marginTop: 22, textAlign: 'center', padding: '34px 16px' }}>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
              {page.shareNotFoundTitle}
            </div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 10 }}>{page.shareNotFoundBody}</div>
          </div>
        )}
      </div>
    </div>
  );
}
