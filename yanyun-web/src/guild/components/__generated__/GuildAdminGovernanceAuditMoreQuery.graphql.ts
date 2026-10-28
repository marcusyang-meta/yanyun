/**
 * @generated SignedSource<<228b9a099ec55f61ddc5732d1b20e8dc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGovernanceAuditMoreQuery$variables = {
  limit: number;
  offset: number;
  slug: string;
};
export type GuildAdminGovernanceAuditMoreQuery$data = {
  readonly viewer: {
    readonly guildAdmin: {
      readonly governance?: {
        readonly auditEvents?: ReadonlyArray<{
          readonly action: string;
          readonly actionLabel: string;
          readonly actorName: string;
          readonly createdAtText: string;
          readonly id: string;
          readonly targetLabel: string;
          readonly targetType: string;
        }>;
      };
    };
  };
};
export type GuildAdminGovernanceAuditMoreQuery = {
  response: GuildAdminGovernanceAuditMoreQuery$data;
  variables: GuildAdminGovernanceAuditMoreQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "limit"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offset"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "limit",
          "variableName": "limit"
        },
        {
          "kind": "Variable",
          "name": "offset",
          "variableName": "offset"
        }
      ],
      "concreteType": "GuildAuditEvent",
      "kind": "LinkedField",
      "name": "auditEvents",
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
          "name": "action",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "actionLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "actorName",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "targetType",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "targetLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "createdAtText",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "GuildGovernancePage",
  "abstractKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminGovernanceAuditMoreQuery",
    "selections": [
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
            "args": (v3/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guildAdmin",
            "plural": false,
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "governance",
                    "plural": false,
                    "selections": [
                      (v4/*:: as any*/)
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminGovernanceAuditMoreQuery",
    "selections": [
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
            "args": (v3/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guildAdmin",
            "plural": false,
            "selections": [
              (v5/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "governance",
                    "plural": false,
                    "selections": [
                      (v5/*:: as any*/),
                      (v4/*:: as any*/)
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
    ]
  },
  "params": {
    "cacheID": "ee47a6e9610496611e56184ff0c25a10",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGovernanceAuditMoreQuery",
    "operationKind": "query",
    "text": "query GuildAdminGovernanceAuditMoreQuery(\n  $slug: String!\n  $limit: Int!\n  $offset: Int!\n) {\n  viewer {\n    guildAdmin(slug: $slug) {\n      __typename\n      ... on GuildAdmin {\n        governance {\n          __typename\n          ... on GuildGovernancePage {\n            auditEvents(limit: $limit, offset: $offset) {\n              id\n              action\n              actionLabel\n              actorName\n              targetType\n              targetLabel\n              createdAtText\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c4ea42b36a0a4cc7b3843dcdebd79fad";

export default node;
