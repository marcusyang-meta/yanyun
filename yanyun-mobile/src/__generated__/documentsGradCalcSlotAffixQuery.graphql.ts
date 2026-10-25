/**
 * @generated SignedSource<<3b461dcf33ccf4c4ff861bce4f14410c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGradCalcSlotAffixQuery$variables = {
  build: string;
};
export type documentsGradCalcSlotAffixQuery$data = {
  readonly slotAffixList: ReadonlyArray<{
    readonly affixKey: string;
    readonly slot: string;
  }>;
};
export type documentsGradCalcSlotAffixQuery = {
  response: documentsGradCalcSlotAffixQuery$data;
  variables: documentsGradCalcSlotAffixQuery$variables;
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
    "name": "documentsGradCalcSlotAffixQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGradCalcSlotAffixQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "aa017583bd278e65ad794610a51467f9",
    "id": null,
    "metadata": {},
    "name": "documentsGradCalcSlotAffixQuery",
    "operationKind": "query",
    "text": "query documentsGradCalcSlotAffixQuery(\n  $build: String!\n) {\n  slotAffixList(build: $build) {\n    slot\n    affixKey\n  }\n}\n"
  }
};
})();

(node as any).hash = "cfd54e4c8490918ec2a003deaee41c18";

export default node;
