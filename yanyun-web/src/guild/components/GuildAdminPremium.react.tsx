import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import { adminSectionStyle, adminSectionTitleStyle } from './GuildAdminUi.react.tsx';
import { toast } from './Toast.react.tsx';

// Premium surfaces of the guild admin page. Which variant renders is
// the server's composition decision (GuildAdmin.premium / the stats
// result type) — this file only renders what the composed variant
// carries: the locked panel shows the price the BACKEND read from
// Stripe (never a client-side amount) or, while Stripe is not
// configured, the coming-soon copy in its place; the checkout button
// asks the server for a Checkout Session URL and hands the browser
// to Stripe's hosted page.
export interface PremiumTierPlanData {
  tier: number;
  name: string;
  subtitle: string;
  priceLabel: string;
}

export interface PremiumLockedData {
  premiumTitle: string;
  premiumBody: string;
  premiumPriceLabel: string | null;
  premiumComingSoonText: string | null;
  premiumCheckoutLabel: string;
  premiumTierPlans: readonly PremiumTierPlanData[];
}

export interface PremiumActiveData {
  premiumPlanLabel: string;
  premiumSourceText: string;
  premiumPeriodEndText: string | null;
  premiumPastDueText: string | null;
}

const CheckoutMutation = graphql`
  mutation GuildAdminPremiumCheckoutMutation($slug: String!) {
    startPremiumCheckout(slug: $slug) { ok error checkoutUrl }
  }
`;

export function PremiumLockedPanel({ premium, slug, unknownError }: {
  premium: PremiumLockedData;
  slug: string;
  unknownError: string;
}) {
  const [commit] = useMutation(CheckoutMutation);
  const [busy, setBusy] = useState(false);
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{premium.premiumTitle}</h2>
      <p style={{ color: theme.paper, fontSize: 14, lineHeight: 1.7, margin: '0 0 14px' }}>{premium.premiumBody}</p>
      {premium.premiumPriceLabel && (
        <p style={{ color: '#ecd28f', fontSize: 24, margin: '0 0 14px', letterSpacing: '.02em' }}>
          {premium.premiumPriceLabel}
        </p>
      )}
      {/* Tier pricing: every label arrives composed from the
          backend (names + prices); this panel renders, never
          invents. The panel itself only exists while the paygate
          master switch is on (server composition). */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 14px' }}>
        {premium.premiumTierPlans.map((plan) => (
          <div
            key={plan.tier}
            style={{
              flex: '1 1 120px', border: '1px solid rgba(201,163,92,.35)', borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <p style={{ color: theme.paper, fontSize: 15, margin: '0 0 2px' }}>
              {plan.name}
              <span style={{ color: theme.muted, fontSize: 12 }}> · {plan.subtitle}</span>
            </p>
            <p style={{ color: '#ecd28f', fontSize: 17, margin: 0 }}>{plan.priceLabel}</p>
          </div>
        ))}
      </div>
      {premium.premiumComingSoonText ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{premium.premiumComingSoonText}</p>
      ) : (
        <button
          type="button"
          className="yy-btn yy-btn-gold"
          disabled={busy}
          style={{ padding: '9px 22px' }}
          onClick={() => {
            setBusy(true);
            commit({
              variables: { slug },
              onCompleted: (res: any) => {
                const p = res?.startPremiumCheckout;
                if (p?.ok && p.checkoutUrl) {
                  window.location.assign(p.checkoutUrl);
                  return;
                }
                setBusy(false);
                toast(p?.error || unknownError);
              },
              onError: () => { setBusy(false); toast(unknownError); },
            });
          }}
        >
          {premium.premiumCheckoutLabel}
        </button>
      )}
    </section>
  );
}

export function PremiumActivePanel({ title, premium }: {
  title: string;
  premium: PremiumActiveData;
}) {
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{title}</h2>
      <p style={{ color: theme.paper, fontSize: 14, margin: '0 0 6px' }}>
        {premium.premiumPlanLabel} · {premium.premiumSourceText}
      </p>
      {premium.premiumPeriodEndText && (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{premium.premiumPeriodEndText}</p>
      )}
      {premium.premiumPastDueText && (
        <p style={{ color: '#e8a13a', fontSize: 13, margin: '6px 0 0' }}>{premium.premiumPastDueText}</p>
      )}
    </section>
  );
}
