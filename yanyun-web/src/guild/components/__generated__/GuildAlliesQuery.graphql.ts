/**
 * @generated SignedSource<<e220dac26443b62e9c4365e284f8673a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AllianceStatus = "ACTIVE" | "PENDING" | "%future added value";
export type GuildAlliesQuery$variables = {
  slug: string;
};
export type GuildAlliesQuery$data = {
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guildAllies: {
      readonly __typename: "GuildAlliesLocked";
      readonly lockedBody: string;
      readonly lockedTitle: string;
    } | {
      readonly __typename: "GuildAlliesPage";
      readonly activeEmptyText: string;
      readonly activeTitle: string;
      readonly adminSection: {
        readonly acceptLabel: string;
        readonly adminTitle: string;
        readonly candidates: ReadonlyArray<{
          readonly name: string;
          readonly slug: string;
        }>;
        readonly endLabel: string;
        readonly incomingTitle: string;
        readonly inviteButtonLabel: string;
        readonly inviteHint: string;
        readonly inviteLabel: string;
        readonly outgoingTitle: string;
        readonly rejectLabel: string;
        readonly relations: ReadonlyArray<{
          readonly id: string;
          readonly otherName: string;
          readonly otherSlug: string;
          readonly outgoing: boolean;
          readonly requestedByName: string;
          readonly status: AllianceStatus;
          readonly statusLabel: string;
        }>;
      } | null | undefined;
      readonly allies: ReadonlyArray<{
        readonly name: string;
        readonly slug: string;
      }>;
      readonly alliesBody: string;
      readonly alliesTitle: string;
      readonly sharedEmptyText: string;
      readonly sharedGroupings: ReadonlyArray<{
        readonly dungeon: string;
        readonly hostName: string;
        readonly hostPattern: string;
        readonly id: string;
        readonly joined: boolean;
        readonly startsAtText: string;
        readonly title: string;
        readonly visitorLeftPattern: string;
      }>;
      readonly sharedTitle: string;
      readonly visitorJoinLabel: string;
      readonly visitorJoinedLabel: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined;
  };
};
export type GuildAlliesQuery = {
  response: GuildAlliesQuery$data;
  variables: GuildAlliesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "slug",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
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
        "name": "guildAllies",
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
            "type": "GuildAlliesLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "alliesTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "alliesBody",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "activeTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "activeEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sharedTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "sharedEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "visitorJoinLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "visitorJoinedLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "AllyGuild",
                "kind": "LinkedField",
                "name": "allies",
                "plural": true,
                "selections": (v1/*:: as any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "AllianceAdminSection",
                "kind": "LinkedField",
                "name": "adminSection",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "adminTitle",
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
                    "name": "inviteHint",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "inviteButtonLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "incomingTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "outgoingTitle",
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
                    "name": "rejectLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "AllianceRelation",
                    "kind": "LinkedField",
                    "name": "relations",
                    "plural": true,
                    "selections": [
                      (v2/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "otherSlug",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "otherName",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "status",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "statusLabel",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "outgoing",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "requestedByName",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "AllyGuild",
                    "kind": "LinkedField",
                    "name": "candidates",
                    "plural": true,
                    "selections": (v1/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "AllySharedGrouping",
                "kind": "LinkedField",
                "name": "sharedGroupings",
                "plural": true,
                "selections": [
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hostName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hostPattern",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
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
                    "name": "startsAtText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "visitorLeftPattern",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "joined",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "GuildAlliesPage",
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
    "name": "GuildAlliesQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAlliesQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "432b44b983eca39c34fc4e97869fa9a2",
    "id": null,
    "metadata": {},
    "name": "GuildAlliesQuery",
    "operationKind": "query",
    "text": "query GuildAlliesQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    guildAllies(slug: $slug) {\n      __typename\n      ... on GuildAlliesLocked {\n        lockedTitle\n        lockedBody\n      }\n      ... on GuildAlliesPage {\n        alliesTitle\n        alliesBody\n        activeTitle\n        activeEmptyText\n        sharedTitle\n        sharedEmptyText\n        visitorJoinLabel\n        visitorJoinedLabel\n        allies {\n          slug\n          name\n        }\n        adminSection {\n          adminTitle\n          inviteLabel\n          inviteHint\n          inviteButtonLabel\n          incomingTitle\n          outgoingTitle\n          acceptLabel\n          rejectLabel\n          endLabel\n          relations {\n            id\n            otherSlug\n            otherName\n            status\n            statusLabel\n            outgoing\n            requestedByName\n          }\n          candidates {\n            slug\n            name\n          }\n        }\n        sharedGroupings {\n          id\n          hostName\n          hostPattern\n          title\n          dungeon\n          startsAtText\n          visitorLeftPattern\n          joined\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "b5f5cc7400cf432ac02d55988d13a578";

export default node;
