/**
 * @generated SignedSource<<0527c4dbdcc1a3b186235ae351c2c194>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminPageReminderMutation$variables = {
  customText?: string | null | undefined;
  offsets: ReadonlyArray<number>;
  slug: string;
};
export type GuildAdminPageReminderMutation$data = {
  readonly updateGuildReminderSettings: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminPageReminderMutation = {
  response: GuildAdminPageReminderMutation$data;
  variables: GuildAdminPageReminderMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "customText"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offsets"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "customText",
    "variableName": "customText"
  },
  {
    "kind": "Variable",
    "name": "offsets",
    "variableName": "offsets"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
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
    "name": "GuildAdminPageReminderMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildReminderSettings",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminPageReminderMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildReminderSettings",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "73dadac2efc841f3f3833bcd255925c3",
    "id": null,
    "metadata": {},
    "name": "GuildAdminPageReminderMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminPageReminderMutation(\n  $slug: String!\n  $offsets: [Int!]!\n  $customText: String\n) {\n  updateGuildReminderSettings(slug: $slug, offsets: $offsets, customText: $customText) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa754ad387fbf2a56d5d12a77e7a39dc";

export default node;
