/**
 * @generated SignedSource<<089035e1960933b5a4ef74a4444fa3e6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAlliesEndMutation$variables = {
  allianceId: string;
  slug: string;
};
export type GuildAlliesEndMutation$data = {
  readonly endAlliance: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAlliesEndMutation = {
  response: GuildAlliesEndMutation$data;
  variables: GuildAlliesEndMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "allianceId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "allianceId",
        "variableName": "allianceId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "AlliancePayload",
    "kind": "LinkedField",
    "name": "endAlliance",
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAlliesEndMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAlliesEndMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "59bdf5945069a17cf1a82dd5b50cb759",
    "id": null,
    "metadata": {},
    "name": "GuildAlliesEndMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAlliesEndMutation(\n  $slug: String!\n  $allianceId: ID!\n) {\n  endAlliance(slug: $slug, allianceId: $allianceId) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "edb4405c94589a52d52260b31f6b3b9c";

export default node;
