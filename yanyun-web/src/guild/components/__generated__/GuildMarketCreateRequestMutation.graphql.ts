/**
 * @generated SignedSource<<b19fa987d9a2a04edda190b71fbf5de6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketCreateRequestMutation$variables = {
  groupingId: string;
  neededRole: string;
  neededSchool?: string | null | undefined;
  note?: string | null | undefined;
  slug: string;
};
export type GuildMarketCreateRequestMutation$data = {
  readonly createFillRequest: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketCreateRequestMutation = {
  response: GuildMarketCreateRequestMutation$data;
  variables: GuildMarketCreateRequestMutation$variables;
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
  "name": "neededRole"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "neededSchool"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "note"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v5 = [
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
        "name": "neededRole",
        "variableName": "neededRole"
      },
      {
        "kind": "Variable",
        "name": "neededSchool",
        "variableName": "neededSchool"
      },
      {
        "kind": "Variable",
        "name": "note",
        "variableName": "note"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "FillRequestPayload",
    "kind": "LinkedField",
    "name": "createFillRequest",
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
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildMarketCreateRequestMutation",
    "selections": (v5/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v4/*:: as any*/),
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildMarketCreateRequestMutation",
    "selections": (v5/*:: as any*/)
  },
  "params": {
    "cacheID": "12220a73060ceec6dbde012fce0ce4d7",
    "id": null,
    "metadata": {},
    "name": "GuildMarketCreateRequestMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketCreateRequestMutation(\n  $slug: String!\n  $groupingId: ID!\n  $neededRole: String!\n  $neededSchool: String\n  $note: String\n) {\n  createFillRequest(slug: $slug, groupingId: $groupingId, neededRole: $neededRole, neededSchool: $neededSchool, note: $note) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "44c06656891dc58580a0b11d3f8be18a";

export default node;
