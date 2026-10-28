/**
 * @generated SignedSource<<649e9c1efeae23be74d89a51b28d11f0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AnnouncementKind = "STANDARD" | "URGENT" | "%future added value";
export type documentsAnnouncementsAdminQuery$variables = {
  slug: string;
};
export type documentsAnnouncementsAdminQuery$data = {
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guildAdmin: {
      readonly __typename: "GuildAdmin";
      readonly announcements: {
        readonly announcements: ReadonlyArray<{
          readonly authorText: string | null | undefined;
          readonly body: string;
          readonly createdAtText: string;
          readonly deleteConfirmTitle: string;
          readonly deleteLabel: string;
          readonly id: string;
          readonly kind: AnnouncementKind;
          readonly kindLabel: string;
          readonly readCountText: string | null | undefined;
          readonly receipts: ReadonlyArray<{
            readonly discordId: string;
            readonly displayName: string;
            readonly read: boolean;
            readonly readAtText: string | null | undefined;
          }> | null | undefined;
          readonly title: string;
          readonly urgent: boolean;
          readonly urgentLabel: string | null | undefined;
        }>;
        readonly bodyLabel: string;
        readonly bodyPlaceholder: string;
        readonly canPost: boolean;
        readonly composeTitle: string;
        readonly dailyLimitText: string | null | undefined;
        readonly deleteLabel: string;
        readonly emptyText: string;
        readonly kindLabel: string;
        readonly kindStandardLabel: string;
        readonly kindUrgentLabel: string;
        readonly postLabel: string;
        readonly postedText: string;
        readonly postingLabel: string;
        readonly pushNote: string;
        readonly readListLabel: string;
        readonly receiptsTitle: string;
        readonly title: string;
        readonly titleLabel: string;
        readonly titlePlaceholder: string;
        readonly unreadListLabel: string;
        readonly urgentNote: string;
      };
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type documentsAnnouncementsAdminQuery = {
  response: documentsAnnouncementsAdminQuery$data;
  variables: documentsAnnouncementsAdminQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "kindLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deleteLabel",
  "storageKey": null
},
v4 = [
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
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "guildAdmin",
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
                "concreteType": "GuildAnnouncementPage",
                "kind": "LinkedField",
                "name": "announcements",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "emptyText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "composeTitle",
                    "storageKey": null
                  },
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "kindStandardLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "kindUrgentLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "titleLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "titlePlaceholder",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bodyLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "bodyPlaceholder",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "postLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "postingLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "postedText",
                    "storageKey": null
                  },
                  (v3/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "receiptsTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "readListLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "unreadListLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "pushNote",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "urgentNote",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dailyLimitText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "canPost",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAnnouncement",
                    "kind": "LinkedField",
                    "name": "announcements",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "id",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "kind",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "urgent",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "urgentLabel",
                        "storageKey": null
                      },
                      (v2/*:: as any*/),
                      (v1/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "body",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "authorText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "createdAtText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "readCountText",
                        "storageKey": null
                      },
                      (v3/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "deleteConfirmTitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GuildAnnouncementReceipt",
                        "kind": "LinkedField",
                        "name": "receipts",
                        "plural": true,
                        "selections": [
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
                            "name": "displayName",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "read",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "readAtText",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "GuildAdmin",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsAnnouncementsAdminQuery",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsAnnouncementsAdminQuery",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "3d2c646d5b030bbc48160ff06e08b259",
    "id": null,
    "metadata": {},
    "name": "documentsAnnouncementsAdminQuery",
    "operationKind": "query",
    "text": "query documentsAnnouncementsAdminQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    guildAdmin(slug: $slug) {\n      __typename\n      ... on GuildAdmin {\n        announcements {\n          title\n          emptyText\n          composeTitle\n          kindLabel\n          kindStandardLabel\n          kindUrgentLabel\n          titleLabel\n          titlePlaceholder\n          bodyLabel\n          bodyPlaceholder\n          postLabel\n          postingLabel\n          postedText\n          deleteLabel\n          receiptsTitle\n          readListLabel\n          unreadListLabel\n          pushNote\n          urgentNote\n          dailyLimitText\n          canPost\n          announcements {\n            id\n            kind\n            urgent\n            urgentLabel\n            kindLabel\n            title\n            body\n            authorText\n            createdAtText\n            readCountText\n            deleteLabel\n            deleteConfirmTitle\n            receipts {\n              discordId\n              displayName\n              read\n              readAtText\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "7b5d80370344bb24041158f686dd3e4e";

export default node;
