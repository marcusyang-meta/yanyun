/**
 * @generated SignedSource<<6614262ad666a796d0cb7881fc7075ea>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsDeleteGearStandardAdminMutation$variables = {
  id: string;
  slug: string;
};
export type documentsDeleteGearStandardAdminMutation$data = {
  readonly deleteGearStandard: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsDeleteGearStandardAdminMutation = {
  response: documentsDeleteGearStandardAdminMutation$data;
  variables: documentsDeleteGearStandardAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
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
        "name": "id",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GearStandardPayload",
    "kind": "LinkedField",
    "name": "deleteGearStandard",
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
    "name": "documentsDeleteGearStandardAdminMutation",
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
    "name": "documentsDeleteGearStandardAdminMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "f83f954a5f533ccdfaf6f89530abfd9c",
    "id": null,
    "metadata": {},
    "name": "documentsDeleteGearStandardAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsDeleteGearStandardAdminMutation(\n  $slug: String!\n  $id: ID!\n) {\n  deleteGearStandard(slug: $slug, id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "f466110a507e75c79fd4fe05b410b71d";

export default node;
