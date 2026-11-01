/**
 * @generated SignedSource<<f4e18b6173d3ca915b1aafb791454b5b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageQuery$variables = Record<PropertyKey, never>;
export type PlatformAdminPageQuery$data = {
  readonly viewer: {
    readonly platformAdmin: {
      readonly __typename: "PlatformAdmin";
      readonly adminRoster: ReadonlyArray<string>;
      readonly auditEmpty: string;
      readonly auditEntries: {
        readonly entries: ReadonlyArray<{
          readonly action: string;
          readonly actor: string;
          readonly at: number;
          readonly id: string;
          readonly summary: string;
          readonly tenant: string;
        }>;
        readonly total: number;
      };
      readonly auditTitle: string;
      readonly backfillCreatorsLabel: string;
      readonly backfillKunpengDexLabel: string;
      readonly backfillReminderIdentityLabel: string;
      readonly backfillsTitle: string;
      readonly backups: {
        readonly available: boolean;
        readonly entries: ReadonlyArray<{
          readonly key: string;
          readonly size: number;
          readonly uploaded: number;
        }>;
      };
      readonly backupsEmpty: string;
      readonly backupsTitle: string;
      readonly backupsUnavailableText: string;
      readonly billing: {
        readonly customDomainSaasConfigured: boolean;
        readonly paygateEnabled: boolean;
        readonly plans: ReadonlyArray<{
          readonly name: string;
          readonly nameEn: string;
          readonly plan: string;
          readonly priceMonthlyCents: number;
          readonly subtitle: string;
          readonly subtitleEn: string;
          readonly tier: number;
        }>;
        readonly stripeConfigured: boolean;
        readonly tenants: ReadonlyArray<{
          readonly currentPeriodEnd: number | null | undefined;
          readonly customDomainHostname: string | null | undefined;
          readonly customDomainStatus: string | null | undefined;
          readonly effectiveTier: number;
          readonly guildName: string;
          readonly hasCard: boolean;
          readonly lapsed: boolean;
          readonly pastDue: boolean;
          readonly plan: string;
          readonly slug: string;
          readonly source: string;
          readonly stripeCustomerId: string;
          readonly stripeSubscriptionId: string;
          readonly subdomainEnabled: boolean;
          readonly tier: number;
          readonly tierName: string;
          readonly tierNameEn: string;
          readonly tierSubtitle: string;
          readonly trialUsed: boolean;
        }>;
      };
      readonly billingTenantsTitle: string;
      readonly billingTitle: string;
      readonly bosses: ReadonlyArray<{
        readonly dungeon: string;
        readonly guide: string;
        readonly id: number;
        readonly mechanicsJson: string | null | undefined;
        readonly name: string;
        readonly note: string;
        readonly shoutsJson: string | null | undefined;
        readonly sortOrder: number;
        readonly source: string;
        readonly talent: string;
        readonly talentsJson: string | null | undefined;
      }>;
      readonly bossesEmpty: string;
      readonly bossesTitle: string;
      readonly customDomainLabel: string;
      readonly deleteTenantLabel: string;
      readonly disabledText: string;
      readonly downloadLabel: string;
      readonly dryRunLabel: string;
      readonly dungeons: ReadonlyArray<{
        readonly id: number;
        readonly isCurrent: boolean;
        readonly name: string;
        readonly size: number;
        readonly version: string;
        readonly videoTitle: string;
        readonly videoUrl: string;
      }>;
      readonly dungeonsEmpty: string;
      readonly dungeonsTitle: string;
      readonly enabledText: string;
      readonly errorCount24h: number;
      readonly errors: ReadonlyArray<{
        readonly at: number;
        readonly context: string;
        readonly id: number;
        readonly message: string;
        readonly name: string;
        readonly source: string;
        readonly tenant: string;
      }>;
      readonly errorsEmpty: string;
      readonly errorsTitle: string;
      readonly exportLabel: string;
      readonly feedbackEmpty: string;
      readonly feedbackEntries: {
        readonly entries: ReadonlyArray<{
          readonly category: string;
          readonly content: string;
          readonly createdAt: number;
          readonly discordId: string;
          readonly id: string;
          readonly resolvedAt: number | null | undefined;
          readonly status: string;
          readonly userName: string;
        }>;
        readonly total: number;
      };
      readonly feedbackTitle: string;
      readonly gameNoticeLabel: string;
      readonly gameVersionCodeLabel: string;
      readonly gameVersionLabel: string;
      readonly grantLabel: string;
      readonly hasCardText: string;
      readonly heirlooms: ReadonlyArray<{
        readonly enabled: boolean;
        readonly guildName: string;
        readonly lastAt: number | null | undefined;
        readonly lastError: string;
        readonly lastEvent: string;
        readonly lastStatus: string;
        readonly slug: string;
        readonly webhookMasked: string;
        readonly webhookSet: boolean;
      }>;
      readonly heirloomsEmpty: string;
      readonly heirloomsTitle: string;
      readonly lastStatusLabel: string;
      readonly migrateBossGuidesLabel: string;
      readonly nextAlarmLabel: string;
      readonly noCardText: string;
      readonly paygateLabel: string;
      readonly paygateOffText: string;
      readonly paygateOnText: string;
      readonly periodEndLabel: string;
      readonly planLabel: string;
      readonly plansTitle: string;
      readonly reminders: ReadonlyArray<{
        readonly enabled: boolean;
        readonly guildName: string;
        readonly lastAt: number | null | undefined;
        readonly lastError: string;
        readonly lastEvent: string;
        readonly lastStatus: string;
        readonly nextAlarmAt: number | null | undefined;
        readonly slug: string;
        readonly webhookMasked: string;
        readonly webhookSet: boolean;
      }>;
      readonly remindersEmpty: string;
      readonly remindersTitle: string;
      readonly revokeLabel: string;
      readonly rosterNote: string;
      readonly rosterTitle: string;
      readonly runBackupLabel: string;
      readonly runLabel: string;
      readonly saasConfiguredText: string;
      readonly saasLabel: string;
      readonly saasMissingText: string;
      readonly saveLabel: string;
      readonly settings: {
        readonly gameNotice: string;
        readonly gameVersion: string;
        readonly gameVersionCode: string;
      };
      readonly settingsTitle: string;
      readonly sourceLabel: string;
      readonly statusOpenText: string;
      readonly statusResolvedText: string;
      readonly stripeConfiguredText: string;
      readonly stripeLabel: string;
      readonly stripeMissingText: string;
      readonly subdomainLabel: string;
      readonly subtitle: string;
      readonly tenants: ReadonlyArray<{
        readonly announcement: string;
        readonly createdAt: string;
        readonly eventCount: number;
        readonly guildName: string;
        readonly slug: string;
      }>;
      readonly tenantsEmpty: string;
      readonly tenantsTitle: string;
      readonly testLabel: string;
      readonly tierLabel: string;
      readonly title: string;
      readonly trialUsedText: string;
      readonly webhookSetText: string;
      readonly webhookUnsetText: string;
    } | {
      readonly __typename: "PlatformAdminLocked";
      readonly lockedBody: string;
      readonly lockedTitle: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type PlatformAdminPageQuery = {
  response: PlatformAdminPageQuery$data;
  variables: PlatformAdminPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "subtitle",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "guildName",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tier",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "plan",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "at",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tenant",
  "storageKey": null
},
v11 = [
  {
    "kind": "Literal",
    "name": "limit",
    "value": 50
  }
],
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "total",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "size",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "webhookSet",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "webhookMasked",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "enabled",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastAt",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastStatus",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastError",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastEvent",
  "storageKey": null
},
v21 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": null,
        "kind": "LinkedField",
        "name": "platformAdmin",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lockedTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lockedBody",
                "storageKey": null
              }
            ],
            "type": "PlatformAdminLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "title",
                "storageKey": null
              },
              (v0/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tenantsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tenantsEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "billingTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "paygateLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "paygateOnText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "paygateOffText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "stripeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "stripeConfiguredText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "stripeMissingText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "saasLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "saasConfiguredText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "saasMissingText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "plansTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "billingTenantsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "errorsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "errorsEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "auditTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "auditEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "feedbackTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "feedbackEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "settingsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "gameVersionLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "gameNoticeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "gameVersionCodeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bossesTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bossesEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dungeonsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dungeonsEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "remindersTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "remindersEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "heirloomsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "heirloomsEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backupsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backupsEmpty",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backupsUnavailableText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rosterTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rosterNote",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backfillsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "saveLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "testLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "runLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "dryRunLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "deleteTenantLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "grantLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "revokeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "subdomainLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "customDomainLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "enabledText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "disabledText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "webhookSetText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "webhookUnsetText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "runBackupLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "downloadLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "exportLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backfillReminderIdentityLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backfillCreatorsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "backfillKunpengDexLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "migrateBossGuidesLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "statusOpenText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "statusResolvedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lastStatusLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "nextAlarmLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "periodEndLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sourceLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "tierLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "planLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "hasCardText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "noCardText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "trialUsedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminTenant",
                "kind": "LinkedField",
                "name": "tenants",
                "plural": true,
                "selections": [
                  (v1/*:: as any*/),
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "announcement",
                    "storageKey": null
                  },
                  (v3/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "eventCount",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminBilling",
                "kind": "LinkedField",
                "name": "billing",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "paygateEnabled",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "stripeConfigured",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "customDomainSaasConfigured",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformAdminPlan",
                    "kind": "LinkedField",
                    "name": "plans",
                    "plural": true,
                    "selections": [
                      (v4/*:: as any*/),
                      (v5/*:: as any*/),
                      (v6/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "nameEn",
                        "storageKey": null
                      },
                      (v0/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "subtitleEn",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "priceMonthlyCents",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformAdminBillingTenant",
                    "kind": "LinkedField",
                    "name": "tenants",
                    "plural": true,
                    "selections": [
                      (v1/*:: as any*/),
                      (v2/*:: as any*/),
                      (v5/*:: as any*/),
                      (v7/*:: as any*/),
                      (v4/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "effectiveTier",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "tierName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "tierNameEn",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "tierSubtitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "currentPeriodEnd",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "lapsed",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "pastDue",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasCard",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "trialUsed",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "stripeCustomerId",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "stripeSubscriptionId",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "subdomainEnabled",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "customDomainHostname",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "customDomainStatus",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminError",
                "kind": "LinkedField",
                "name": "errors",
                "plural": true,
                "selections": [
                  (v8/*:: as any*/),
                  (v9/*:: as any*/),
                  (v7/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "message",
                    "storageKey": null
                  },
                  (v10/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "context",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "errorCount24h",
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v11/*:: as any*/),
                "concreteType": "PlatformAdminAuditPage",
                "kind": "LinkedField",
                "name": "auditEntries",
                "plural": false,
                "selections": [
                  (v12/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformAdminAuditEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": [
                      (v8/*:: as any*/),
                      (v9/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "actor",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "action",
                        "storageKey": null
                      },
                      (v10/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "summary",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "auditEntries(limit:50)"
              },
              {
                "alias": null,
                "args": (v11/*:: as any*/),
                "concreteType": "PlatformAdminFeedbackPage",
                "kind": "LinkedField",
                "name": "feedbackEntries",
                "plural": false,
                "selections": [
                  (v12/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformAdminFeedbackEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": [
                      (v8/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "discordId",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "userName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "category",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "content",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "status",
                        "storageKey": null
                      },
                      (v3/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "resolvedAt",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": "feedbackEntries(limit:50)"
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminSettings",
                "kind": "LinkedField",
                "name": "settings",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "gameVersion",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "gameNotice",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "gameVersionCode",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminBoss",
                "kind": "LinkedField",
                "name": "bosses",
                "plural": true,
                "selections": [
                  (v8/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "talent",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "note",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "sortOrder",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dungeon",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "guide",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mechanicsJson",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "talentsJson",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "shoutsJson",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminDungeon",
                "kind": "LinkedField",
                "name": "dungeons",
                "plural": true,
                "selections": [
                  (v8/*:: as any*/),
                  (v6/*:: as any*/),
                  (v13/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isCurrent",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "version",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "videoUrl",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "videoTitle",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminReminder",
                "kind": "LinkedField",
                "name": "reminders",
                "plural": true,
                "selections": [
                  (v1/*:: as any*/),
                  (v2/*:: as any*/),
                  (v14/*:: as any*/),
                  (v15/*:: as any*/),
                  (v16/*:: as any*/),
                  (v17/*:: as any*/),
                  (v18/*:: as any*/),
                  (v19/*:: as any*/),
                  (v20/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "nextAlarmAt",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminHeirloom",
                "kind": "LinkedField",
                "name": "heirlooms",
                "plural": true,
                "selections": [
                  (v1/*:: as any*/),
                  (v2/*:: as any*/),
                  (v14/*:: as any*/),
                  (v15/*:: as any*/),
                  (v16/*:: as any*/),
                  (v17/*:: as any*/),
                  (v18/*:: as any*/),
                  (v19/*:: as any*/),
                  (v20/*:: as any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "PlatformAdminBackups",
                "kind": "LinkedField",
                "name": "backups",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "available",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "PlatformAdminBackupEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
                        "storageKey": null
                      },
                      (v13/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "uploaded",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRoster",
                "storageKey": null
              }
            ],
            "type": "PlatformAdmin",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageQuery",
    "selections": (v21/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "PlatformAdminPageQuery",
    "selections": (v21/*:: as any*/)
  },
  "params": {
    "cacheID": "5a8bade67ba4933841566acbea6bf2b3",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageQuery",
    "operationKind": "query",
    "text": "query PlatformAdminPageQuery {\n  viewer {\n    platformAdmin {\n      __typename\n      ... on PlatformAdminLocked {\n        lockedTitle\n        lockedBody\n      }\n      ... on PlatformAdmin {\n        title\n        subtitle\n        tenantsTitle\n        tenantsEmpty\n        billingTitle\n        paygateLabel\n        paygateOnText\n        paygateOffText\n        stripeLabel\n        stripeConfiguredText\n        stripeMissingText\n        saasLabel\n        saasConfiguredText\n        saasMissingText\n        plansTitle\n        billingTenantsTitle\n        errorsTitle\n        errorsEmpty\n        auditTitle\n        auditEmpty\n        feedbackTitle\n        feedbackEmpty\n        settingsTitle\n        gameVersionLabel\n        gameNoticeLabel\n        gameVersionCodeLabel\n        bossesTitle\n        bossesEmpty\n        dungeonsTitle\n        dungeonsEmpty\n        remindersTitle\n        remindersEmpty\n        heirloomsTitle\n        heirloomsEmpty\n        backupsTitle\n        backupsEmpty\n        backupsUnavailableText\n        rosterTitle\n        rosterNote\n        backfillsTitle\n        saveLabel\n        testLabel\n        runLabel\n        dryRunLabel\n        deleteTenantLabel\n        grantLabel\n        revokeLabel\n        subdomainLabel\n        customDomainLabel\n        enabledText\n        disabledText\n        webhookSetText\n        webhookUnsetText\n        runBackupLabel\n        downloadLabel\n        exportLabel\n        backfillReminderIdentityLabel\n        backfillCreatorsLabel\n        backfillKunpengDexLabel\n        migrateBossGuidesLabel\n        statusOpenText\n        statusResolvedText\n        lastStatusLabel\n        nextAlarmLabel\n        periodEndLabel\n        sourceLabel\n        tierLabel\n        planLabel\n        hasCardText\n        noCardText\n        trialUsedText\n        tenants {\n          slug\n          guildName\n          announcement\n          createdAt\n          eventCount\n        }\n        billing {\n          paygateEnabled\n          stripeConfigured\n          customDomainSaasConfigured\n          plans {\n            tier\n            plan\n            name\n            nameEn\n            subtitle\n            subtitleEn\n            priceMonthlyCents\n          }\n          tenants {\n            slug\n            guildName\n            plan\n            source\n            tier\n            effectiveTier\n            tierName\n            tierNameEn\n            tierSubtitle\n            currentPeriodEnd\n            lapsed\n            pastDue\n            hasCard\n            trialUsed\n            stripeCustomerId\n            stripeSubscriptionId\n            subdomainEnabled\n            customDomainHostname\n            customDomainStatus\n          }\n        }\n        errors {\n          id\n          at\n          source\n          name\n          message\n          tenant\n          context\n        }\n        errorCount24h\n        auditEntries(limit: 50) {\n          total\n          entries {\n            id\n            at\n            actor\n            action\n            tenant\n            summary\n          }\n        }\n        feedbackEntries(limit: 50) {\n          total\n          entries {\n            id\n            discordId\n            userName\n            category\n            content\n            status\n            createdAt\n            resolvedAt\n          }\n        }\n        settings {\n          gameVersion\n          gameNotice\n          gameVersionCode\n        }\n        bosses {\n          id\n          name\n          talent\n          source\n          note\n          sortOrder\n          dungeon\n          guide\n          mechanicsJson\n          talentsJson\n          shoutsJson\n        }\n        dungeons {\n          id\n          name\n          size\n          isCurrent\n          version\n          videoUrl\n          videoTitle\n        }\n        reminders {\n          slug\n          guildName\n          webhookSet\n          webhookMasked\n          enabled\n          lastAt\n          lastStatus\n          lastError\n          lastEvent\n          nextAlarmAt\n        }\n        heirlooms {\n          slug\n          guildName\n          webhookSet\n          webhookMasked\n          enabled\n          lastAt\n          lastStatus\n          lastError\n          lastEvent\n        }\n        backups {\n          available\n          entries {\n            key\n            size\n            uploaded\n          }\n        }\n        adminRoster\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "365dd50ecfecd457a780af94b32c5066";

export default node;
