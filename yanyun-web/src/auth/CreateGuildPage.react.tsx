import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { graphql, loadQuery, useMutation, usePreloadedQuery } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { relayEnvironment } from '../lib/relay';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import { toast, ToastHost } from '../guild/components/Toast.react.tsx';
import UserBar from './UserBar.react';
import type { CreateGuildPageQuery as CreateGuildPageQueryType } from './__generated__/CreateGuildPageQuery.graphql';
import type { CreateGuildMutation as CreateGuildMutationType } from './__generated__/CreateGuildMutation.graphql';


const CreateGuildPageQueryNode = graphql`
  query CreateGuildPageQuery {
    viewer {
      discordServers {
        id
        name
        icon
      }
      userBarLogoutLabel
      userBarLoggingOutLabel
      userBarSettingsLabel
      createBackLinkLabel
      createTitle
      createSubtitle
      createNameLabel
      createNamePlaceholder
      createSlugLabel
      createSlugPlaceholder
      createSlugCheckingText
      createSlugTakenText
      createSlugNote
      createServerLabel
      createNoServers1
      createNoServers2
      createSubmitLabel
      createSubmittingLabel
      createToastNameShort
      createToastSlugRequired
      createToastSlugBad
      createToastServerRequired
      createToastCreated
      createToastFailed
    }
  }
`;

const SlugAvailableQueryNode = graphql`
  query SlugAvailableQuery($slug: String!) {
    slugAvailable(slug: $slug)
    viewer {
      slugAvailableMessage(slug: $slug)
    }
  }
`;

const CreateGuildMutationNode = graphql`
  mutation CreateGuildMutation($input: CreateGuildInput!) {
    createGuild(input: $input) {
      ok
      error
      guild {
        slug
        name
      }
    }
  }
`;

// Create a guild (self-serve onboarding): name + slug + binding one Discord
// server the user can manage. The server list is backend-filtered (manageable
// ones only); slug availability is judged by a backend query and re-verified
// at creation time. All copy comes from the viewer's create* text fields.
export default function CreateGuildPage({ user }: { user: ViewerUser }) {
  const queryRef = useMemo(
    () => loadQuery(relayEnvironment, CreateGuildPageQueryNode, {}, { fetchPolicy: 'store-or-network' }),
    [],
  );
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 20px 48px' }}>
        <Suspense fallback={<div className="yy-skeleton" style={{ height: 300 }} />}>
          <CreateForm queryRef={queryRef} user={user} />
        </Suspense>
      </div>
      <ToastHost />
    </div>
  );
}

function CreateForm({ queryRef, user }: { queryRef: any; user: ViewerUser }) {
  const data = usePreloadedQuery<CreateGuildPageQueryType>(CreateGuildPageQueryNode, queryRef);
  const viewer = (data as any)?.viewer ?? {};
  const servers = viewer?.discordServers ?? [];
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [serverId, setServerId] = useState('');
  const [slugState, setSlugState] = useState<'idle' | 'checking' | 'ok' | 'bad'>('idle');
  const [slugOkMessage, setSlugOkMessage] = useState('');
  const [commit, committing] = useMutation<CreateGuildMutationType>(CreateGuildMutationNode);
  const timer = useRef<any>(null);

  // Slug input: normalize + debounce, then ask the backend — both the verdict
  // and the availability copy live on the backend; this only shows the result
  useEffect(() => {
    const v = slug.trim().toLowerCase();
    if (!v) { setSlugState('idle'); return; }
    setSlugState('checking');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetchQuery(relayEnvironment, SlugAvailableQueryNode, { slug: v }).toPromise()
        .then((res: any) => {
          if (res?.slugAvailable) {
            setSlugOkMessage(res?.viewer?.slugAvailableMessage ?? '');
            setSlugState('ok');
          } else {
            setSlugState('bad');
          }
        })
        .catch(() => setSlugState('idle'));
    }, 400);
    return () => clearTimeout(timer.current);
  }, [slug]);

  const submit = () => {
    const n = name.trim();
    const sl = slug.trim().toLowerCase();
    if (n.length < 2) { toast(viewer.createToastNameShort); return; }
    if (!sl) { toast(viewer.createToastSlugRequired); return; }
    if (slugState === 'bad') { toast(viewer.createToastSlugBad); return; }
    if (!serverId) { toast(viewer.createToastServerRequired); return; }
    commit({
      variables: { input: { name: n, slug: sl, discordGuildId: serverId } },
      onCompleted: (res: any) => {
        const p = res?.createGuild;
        if (p?.ok && p?.guild?.slug) {
          toast(viewer.createToastCreated);
          navigate('/' + p.guild.slug);
        } else {
          toast(p?.error || viewer.createToastFailed);
        }
      },
      onError: () => toast(viewer.createToastFailed),
    });
  };

  const label: React.CSSProperties = { display: 'block', color: theme.accent, fontSize: 13.5, letterSpacing: '.08em', margin: '20px 0 8px' };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{viewer.createBackLinkLabel}</Link>
        <UserBar user={user} text={{ logoutLabel: viewer.userBarLogoutLabel, loggingOutLabel: viewer.userBarLoggingOutLabel, settingsLabel: viewer.userBarSettingsLabel }} />
      </div>
      <h1 style={{
        fontFamily: "inherit", fontWeight: 400, fontSize: 34,
        color: theme.accentHi, letterSpacing: '.1em', margin: '26px 0 6px',
      }}>{viewer.createTitle}</h1>
      <p style={{ color: theme.muted, fontSize: 13.5, margin: '0 0 24px' }}>
        {viewer.createSubtitle}
      </p>
      <div className="yy-card" style={{ padding: '8px 22px 26px' }}>
        <label style={label}>{viewer.createNameLabel}</label>
        <input
          className="yy-input"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder={viewer.createNamePlaceholder}
          style={{ width: '100%' }}
        />

        <label style={label}>{viewer.createSlugLabel}</label>
        <input
          className="yy-input"
          value={slug}
          maxLength={40}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          placeholder={viewer.createSlugPlaceholder}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: 12.5, marginTop: 6, color: slugState === 'ok' ? '#9db87c' : slugState === 'bad' ? '#d08a7a' : theme.muted }}>
          {slugState === 'checking' && viewer.createSlugCheckingText}
          {slugState === 'ok' && slugOkMessage}
          {slugState === 'bad' && viewer.createSlugTakenText}
          {slugState === 'idle' && viewer.createSlugNote}
        </div>

        <label style={label}>{viewer.createServerLabel}</label>
        {servers.length === 0 ? (
          <div style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.8, border: '1px dashed rgba(67,160,134,.3)', borderRadius: 10, padding: '14px 16px' }}>
            {viewer.createNoServers1}<br />
            {viewer.createNoServers2}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {servers.map((sv: any) => {
              const active = serverId === sv.id;
              return (
                <button
                  key={sv.id}
                  onClick={() => setServerId(sv.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                    padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    background: active ? 'rgba(67,160,134,.14)' : 'rgba(255,255,255,.02)',
                    border: `1px solid ${active ? theme.accent : 'rgba(67,160,134,.25)'}`,
                    color: theme.paper,
                  }}
                >
                  {sv.icon ? (
                    <img src={`https://cdn.discordapp.com/icons/${sv.id}/${sv.icon}.png`} alt="" style={{ width: 34, height: 34, borderRadius: '50%' }} />
                  ) : (
                    <span style={{
                      width: 34, height: 34, borderRadius: '50%', background: 'rgba(67,160,134,.15)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: theme.accentHi, fontSize: 15,
                    }}>{(sv.name || '?').slice(0, 1)}</span>
                  )}
                  <span style={{ flex: 1, fontSize: 15 }}>{sv.name}</span>
                  {active && <span style={{ color: theme.accentHi }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}

        <button
          className="yy-btn yy-btn-primary"
          onClick={submit}
          disabled={committing || servers.length === 0}
          style={{ width: '100%', marginTop: 28, padding: '13px 0', fontSize: 16 }}
        >
          {committing ? viewer.createSubmittingLabel : viewer.createSubmitLabel}
        </button>
      </div>
    </>
  );
}
