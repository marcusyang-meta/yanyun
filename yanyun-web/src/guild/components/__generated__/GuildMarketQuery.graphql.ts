/**
 * @generated SignedSource<<e3214a0e3974c1b9103c1c2a866caa0d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type FillInviteStatus = "ACCEPTED" | "DECLINED" | "EXPIRED" | "PENDING" | "%future added value";
export type GuildMarketQuery$variables = {
  slug: string;
};
export type GuildMarketQuery$data = {
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly fillMarket: {
      readonly __typename: "FillMarketLocked";
      readonly lockedBody: string;
      readonly lockedTitle: string;
    } | {
      readonly __typename: "FillMarketPage";
      readonly demand: {
        readonly __typename: "FillDemandLocked";
        readonly lockedBody: string;
        readonly lockedTitle: string;
      } | {
        readonly __typename: "FillDemandSection";
        readonly demandTitle: string;
        readonly manage: {
          readonly createLabel: string;
          readonly createTitle: string;
          readonly groupingLabel: string;
          readonly myGroupings: ReadonlyArray<{
            readonly id: string;
            readonly title: string;
          }>;
          readonly neededRoleLabel: string;
          readonly neededSchoolLabel: string;
          readonly noteLabel: string;
          readonly roleDpsLabel: string;
          readonly roleHealerLabel: string;
        } | null | undefined;
        readonly noManageHint: string;
        readonly offers: ReadonlyArray<{
          readonly displayName: string;
          readonly homeGuildPattern: string;
          readonly id: string;
          readonly note: string;
          readonly roleLabel: string;
          readonly school: string;
          readonly windows: ReadonlyArray<{
            readonly endMinute: number;
            readonly startMinute: number;
            readonly weekday: number;
          }>;
        }>;
        readonly offersEmptyText: string;
        readonly offersTitle: string;
        readonly requests: ReadonlyArray<{
          readonly groupingId: string;
          readonly groupingTitle: string;
          readonly id: string;
          readonly manageActions: {
            readonly closeLabel: string;
            readonly inviteLabel: string;
            readonly invitedLabel: string;
            readonly invites: ReadonlyArray<{
              readonly id: string;
              readonly offerId: string | null | undefined;
              readonly requestId: string;
              readonly seatAction: {
                readonly seatLabel: string;
              } | null | undefined;
              readonly status: FillInviteStatus;
              readonly statusLabel: string;
              readonly toName: string;
            }>;
            readonly seatLabel: string;
            readonly seatedLabel: string;
          } | null | undefined;
          readonly neededRoleLabel: string;
          readonly neededSchool: string | null | undefined;
          readonly note: string;
          readonly startsAtText: string;
          readonly statusLabel: string;
        }>;
        readonly requestsEmptyText: string;
        readonly requestsTitle: string;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      };
      readonly marketBody: string;
      readonly marketTitle: string;
      readonly supply: {
        readonly acceptLabel: string;
        readonly declineLabel: string;
        readonly inboxEmptyText: string;
        readonly inboxTitle: string;
        readonly myInvites: ReadonlyArray<{
          readonly id: string;
          readonly sourcePattern: string;
          readonly status: FillInviteStatus;
          readonly statusLabel: string;
        }>;
        readonly myOffer: {
          readonly id: string;
          readonly note: string;
          readonly roleLabel: string;
          readonly school: string;
          readonly windows: ReadonlyArray<{
            readonly endMinute: number;
            readonly startMinute: number;
            readonly weekday: number;
          }>;
        } | null | undefined;
        readonly noteLabel: string;
        readonly notePlaceholder: string;
        readonly publishLabel: string;
        readonly schoolLabel: string;
        readonly supplyEmptyText: string;
        readonly supplyHint: string;
        readonly supplyTitle: string;
        readonly windowsLabel: string;
        readonly withdrawLabel: string;
      };
      readonly weekdayNames: ReadonlyArray<string>;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type GuildMarketQuery = {
  response: GuildMarketQuery$data;
  variables: GuildMarketQuery$variables;
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
  "name": "__typename",
  "storageKey": null
},
v2 = [
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
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "noteLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "school",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "roleLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "concreteType": "AvailabilitySlot",
  "kind": "LinkedField",
  "name": "windows",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "weekday",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "startMinute",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "endMinute",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "neededRoleLabel",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatLabel",
  "storageKey": null
},
v13 = [
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
        "name": "fillMarket",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": (v2/*:: as any*/),
            "type": "FillMarketLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "marketTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "marketBody",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "weekdayNames",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "FillSupplySection",
                "kind": "LinkedField",
                "name": "supply",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "supplyTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "supplyHint",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "supplyEmptyText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "schoolLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "windowsLabel",
                    "storageKey": null
                  },
                  (v3/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "notePlaceholder",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "publishLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "withdrawLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "inboxTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "inboxEmptyText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "acceptLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "declineLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FillOffer",
                    "kind": "LinkedField",
                    "name": "myOffer",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/),
                      (v5/*:: as any*/),
                      (v6/*:: as any*/),
                      (v7/*:: as any*/),
                      (v8/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FillInvite",
                    "kind": "LinkedField",
                    "name": "myInvites",
                    "plural": true,
                    "selections": [
                      (v4/*:: as any*/),
                      (v9/*:: as any*/),
                      (v10/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "sourcePattern",
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
                "concreteType": null,
                "kind": "LinkedField",
                "name": "demand",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": (v2/*:: as any*/),
                    "type": "FillDemandLocked",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "demandTitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "requestsTitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "requestsEmptyText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "offersTitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "offersEmptyText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "noManageHint",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FillRequest",
                        "kind": "LinkedField",
                        "name": "requests",
                        "plural": true,
                        "selections": [
                          (v4/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "groupingId",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "groupingTitle",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "startsAtText",
                            "storageKey": null
                          },
                          (v11/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "neededSchool",
                            "storageKey": null
                          },
                          (v7/*:: as any*/),
                          (v10/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "FillRequestManageActions",
                            "kind": "LinkedField",
                            "name": "manageActions",
                            "plural": false,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "closeLabel",
                                "storageKey": null
                              },
                              (v12/*:: as any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "seatedLabel",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "inviteLabel",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "invitedLabel",
                                "storageKey": null
                              },
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "FillInvite",
                                "kind": "LinkedField",
                                "name": "invites",
                                "plural": true,
                                "selections": [
                                  (v4/*:: as any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "requestId",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "offerId",
                                    "storageKey": null
                                  },
                                  (v9/*:: as any*/),
                                  (v10/*:: as any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "toName",
                                    "storageKey": null
                                  },
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": "FillSeatAction",
                                    "kind": "LinkedField",
                                    "name": "seatAction",
                                    "plural": false,
                                    "selections": [
                                      (v12/*:: as any*/)
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
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FillOffer",
                        "kind": "LinkedField",
                        "name": "offers",
                        "plural": true,
                        "selections": [
                          (v4/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "displayName",
                            "storageKey": null
                          },
                          (v5/*:: as any*/),
                          (v6/*:: as any*/),
                          (v7/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "homeGuildPattern",
                            "storageKey": null
                          },
                          (v8/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FillDemandManage",
                        "kind": "LinkedField",
                        "name": "manage",
                        "plural": false,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "createTitle",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "groupingLabel",
                            "storageKey": null
                          },
                          (v11/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "neededSchoolLabel",
                            "storageKey": null
                          },
                          (v3/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "createLabel",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "roleHealerLabel",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "roleDpsLabel",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "FillDemandGrouping",
                            "kind": "LinkedField",
                            "name": "myGroupings",
                            "plural": true,
                            "selections": [
                              (v4/*:: as any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "title",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "FillDemandSection",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "FillMarketPage",
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
    "name": "GuildMarketQuery",
    "selections": (v13/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildMarketQuery",
    "selections": (v13/*:: as any*/)
  },
  "params": {
    "cacheID": "64b6952e21a7c7795fa54f71c77a33a7",
    "id": null,
    "metadata": {},
    "name": "GuildMarketQuery",
    "operationKind": "query",
    "text": "query GuildMarketQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    fillMarket(slug: $slug) {\n      __typename\n      ... on FillMarketLocked {\n        lockedTitle\n        lockedBody\n      }\n      ... on FillMarketPage {\n        marketTitle\n        marketBody\n        weekdayNames\n        supply {\n          supplyTitle\n          supplyHint\n          supplyEmptyText\n          schoolLabel\n          windowsLabel\n          noteLabel\n          notePlaceholder\n          publishLabel\n          withdrawLabel\n          inboxTitle\n          inboxEmptyText\n          acceptLabel\n          declineLabel\n          myOffer {\n            id\n            school\n            roleLabel\n            note\n            windows {\n              weekday\n              startMinute\n              endMinute\n            }\n          }\n          myInvites {\n            id\n            status\n            statusLabel\n            sourcePattern\n          }\n        }\n        demand {\n          __typename\n          ... on FillDemandLocked {\n            lockedTitle\n            lockedBody\n          }\n          ... on FillDemandSection {\n            demandTitle\n            requestsTitle\n            requestsEmptyText\n            offersTitle\n            offersEmptyText\n            noManageHint\n            requests {\n              id\n              groupingId\n              groupingTitle\n              startsAtText\n              neededRoleLabel\n              neededSchool\n              note\n              statusLabel\n              manageActions {\n                closeLabel\n                seatLabel\n                seatedLabel\n                inviteLabel\n                invitedLabel\n                invites {\n                  id\n                  requestId\n                  offerId\n                  status\n                  statusLabel\n                  toName\n                  seatAction {\n                    seatLabel\n                  }\n                }\n              }\n            }\n            offers {\n              id\n              displayName\n              school\n              roleLabel\n              note\n              homeGuildPattern\n              windows {\n                weekday\n                startMinute\n                endMinute\n              }\n            }\n            manage {\n              createTitle\n              groupingLabel\n              neededRoleLabel\n              neededSchoolLabel\n              noteLabel\n              createLabel\n              roleHealerLabel\n              roleDpsLabel\n              myGroupings {\n                id\n                title\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "f1dcef428b2c8d966b24a125a725805d";

export default node;
