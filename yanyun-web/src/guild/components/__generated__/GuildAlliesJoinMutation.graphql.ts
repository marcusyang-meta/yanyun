/**
 * @generated SignedSource<<514195431a7a222eb9771c7735833018>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAlliesJoinMutation$variables = {
  groupingId: string;
  slug: string;
  weapon: string;
};
export type GuildAlliesJoinMutation$data = {
  readonly joinAllyGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAlliesJoinMutation = {
  response: GuildAlliesJoinMutation$data;
  variables: GuildAlliesJoinMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "groupingId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "weapon"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "groupingId",
        "variableName": "groupingId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "weapon",
        "variableName": "weapon"
      }
    ],
    "concreteType": "NetworkOkPayload",
    "kind": "LinkedField",
    "name": "joinAllyGrouping",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAlliesJoinMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAlliesJoinMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "ab8140dc7fa7622f4eb689ee8803c708",
    "id": null,
    "metadata": {},
    "name": "GuildAlliesJoinMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAlliesJoinMutation(\n  $slug: String!\n  $groupingId: ID!\n  $weapon: String!\n) {\n  joinAllyGrouping(slug: $slug, groupingId: $groupingId, weapon: $weapon) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "42c08903c1b1529e142ad8a81ad40823";

export default node;
