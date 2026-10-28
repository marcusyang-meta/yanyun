import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, SaveButton, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Custom domain section of the guild admin page (P23, T3). Which
// variant renders is the server's composition decision
// (GuildAdmin.customDomain): the Locked variant carries only the
// premium copy and this section renders it as a plain upsell; the
// full variant carries the binding, its state-machine status and
// the DNS guidance, all backend-issued — the client never composes
// hostnames, record values or status copy itself.
export interface CustomDomainData {
  __typename?: string;
  status?: string;
  hostname?: string | null;
  statusText?: string;
  guidanceText?: string | null;
  dnsCnameName?: string | null;
  dnsCnameValue?: string | null;
  dnsTxtName?: string | null;
  dnsTxtValue?: string | null;
  boundAtText?: string | null;
  premiumTitle?: string;
  premiumBody?: string;
}

const BindMutation = graphql`
  mutation GuildAdminCustomDomainBindMutation($slug: String!, $hostname: String!) {
    bindGuildCustomDomain(slug: $slug, hostname: $hostname) { ok error }
  }
`;

const VerifyMutation = graphql`
  mutation GuildAdminCustomDomainVerifyMutation($slug: String!) {
    verifyGuildCustomDomain(slug: $slug) { ok error }
  }
`;

const RemoveMutation = graphql`
  mutation GuildAdminCustomDomainRemoveMutation($slug: String!) {
    removeGuildCustomDomain(slug: $slug) { ok error }
  }
`;

function RecordRow({ label, name, value, nameLabel, valueLabel }: {
  label: string; name: string; value: string; nameLabel: string; valueLabel: string;
}) {
  const cell = { fontFamily: 'monospace', fontSize: 13, color: theme.paper, wordBreak: 'break-all' as const };
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ color: theme.muted, fontSize: 12, letterSpacing: '.08em', margin: '0 0 6px' }}>{label}</p>
      <div style={{
        display: 'grid', gridTemplateColumns: 'minmax(90px, auto) 1fr', gap: '4px 14px',
        padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(201,163,92,.22)',
        background: 'rgba(12,11,9,.45)',
      }}>
        <span style={{ color: theme.muted, fontSize: 12 }}>{nameLabel}</span>
        <span style={cell}>{name}</span>
        <span style={{ color: theme.muted, fontSize: 12 }}>{valueLabel}</span>
        <span style={cell}>{value}</span>
      </div>
    </div>
  );
}

export default function GuildAdminCustomDomain({ slug, customDomain, text, commonText, refresh }: {
  slug: string;
  customDomain: CustomDomainData | null | undefined;
  text: AdminText;
  commonText: CommonText;
  refresh: () => void;
}) {
  const [hostname, setHostname] = useState('');
  const [commitBind] = useMutation(BindMutation);
  const [commitVerify] = useMutation(VerifyMutation);
  const [commitRemove] = useMutation(RemoveMutation);
  const runBind = useAdminMutation(commitBind, 'bindGuildCustomDomain', refresh, commonText.unknownError);
  const runVerify = useAdminMutation(commitVerify, 'verifyGuildCustomDomain', refresh, commonText.unknownError);
  const runRemove = useAdminMutation(commitRemove, 'removeGuildCustomDomain', refresh, commonText.unknownError);

  if (!customDomain) return null;
  if (customDomain.__typename === 'GuildAdminCustomDomainLocked') {
    return (
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminCustomDomainTitle}</h2>
        <p style={{ color: theme.paper, fontSize: 14, lineHeight: 1.7, margin: '0 0 6px' }}>{customDomain.premiumTitle}</p>
        <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{customDomain.premiumBody}</p>
      </section>
    );
  }

  const bound = customDomain.status && customDomain.status !== 'NONE';
  const statusColor = customDomain.status === 'ACTIVE' ? '#ecd28f' : theme.muted;
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{text.adminCustomDomainTitle}</h2>
      <p style={{ color: theme.muted, fontSize: 12, lineHeight: 1.7, margin: '-4px 0 14px' }}>{text.adminCustomDomainHint}</p>

      <p style={{ fontSize: 14, color: theme.paper, margin: '0 0 4px' }}>
        <span style={{ color: statusColor }}>{customDomain.statusText}</span>
        {bound && customDomain.hostname && (
          <span style={{ fontFamily: 'monospace', marginLeft: 10 }}>{customDomain.hostname}</span>
        )}
      </p>
      {customDomain.boundAtText && (
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 12px' }}>{customDomain.boundAtText}</p>
      )}

      {customDomain.dnsCnameName && customDomain.dnsCnameValue && customDomain.dnsTxtName && customDomain.dnsTxtValue && (
        <div style={{ margin: '14px 0 4px' }}>
          <h3 style={{ fontSize: 13, color: '#ecd28f', letterSpacing: '.06em', margin: '0 0 10px' }}>
            {text.adminCustomDomainDnsTitle}
          </h3>
          <RecordRow label={text.adminCustomDomainCnameLabel} name={customDomain.dnsCnameName} value={customDomain.dnsCnameValue}
            nameLabel={text.adminCustomDomainRecordNameLabel} valueLabel={text.adminCustomDomainRecordValueLabel} />
          <RecordRow label={text.adminCustomDomainTxtLabel} name={customDomain.dnsTxtName} value={customDomain.dnsTxtValue}
            nameLabel={text.adminCustomDomainRecordNameLabel} valueLabel={text.adminCustomDomainRecordValueLabel} />
        </div>
      )}

      {customDomain.guidanceText && (
        <p style={{ color: theme.muted, fontSize: 12, lineHeight: 1.7, margin: '6px 0 14px' }}>{customDomain.guidanceText}</p>
      )}

      <Field label={text.adminCustomDomainHostnameLabel}>
        <input style={adminInputStyle} value={hostname}
          placeholder={bound && customDomain.hostname ? customDomain.hostname : text.adminCustomDomainHostnamePlaceholder}
          onChange={(e) => setHostname(e.target.value)} autoComplete="off" />
      </Field>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <SaveButton label={bound ? text.adminCustomDomainRebindLabel : text.adminCustomDomainBindLabel}
          savedLabel={text.adminSavedText}
          disabled={!hostname.trim()}
          onSave={() => runBind({ slug, hostname: hostname.trim() })} />
        {customDomain.status === 'PENDING' && (
          <button type="button" className="yy-btn" style={{ padding: '9px 20px' }}
            onClick={() => runVerify({ slug })}>
            {text.adminCustomDomainVerifyLabel}
          </button>
        )}
        {bound && (
          <ConfirmButton label={text.adminCustomDomainRemoveLabel} confirmLabel={commonText.confirm}
            onConfirm={() => runRemove({ slug })} />
        )}
      </div>
    </section>
  );
}
