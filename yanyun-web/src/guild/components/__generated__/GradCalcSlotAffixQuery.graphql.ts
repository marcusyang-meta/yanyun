/**
 * @generated SignedSource<<9ccb4a38a856f2f74f38b754583db18e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GradCalcSlotAffixQuery$variables = {
  build: string;
};
export type GradCalcSlotAffixQuery$data = {
  readonly slotAffixList: ReadonlyArray<{
    readonly affixKey: string;
    readonly slot: string;
  }>;
};
export type GradCalcSlotAffixQuery = {
  response: GradCalcSlotAffixQuery$data;
  variables: GradCalcSlotAffixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "build"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "build",
        "variableName": "build"
      }
    ],
    "concreteType": "SlotAffix",
    "kind": "LinkedField",
    "name": "slotAffixList",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "slot",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "affixKey",
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
    "name": "GradCalcSlotAffixQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GradCalcSlotAffixQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "9c7b23cf9a24dd0831f7195968f22dfb",
    "id": null,
    "metadata": {},
    "name": "GradCalcSlotAffixQuery",
    "operationKind": "query",
    "text": "query GradCalcSlotAffixQuery(\n  $build: String!\n) {\n  slotAffixList(build: $build) {\n    slot\n    affixKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "8a75d6a672cd7e7da7acd85e7f218ce5";

export default node;
