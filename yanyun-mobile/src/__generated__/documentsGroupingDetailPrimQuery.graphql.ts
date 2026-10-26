/**
 * @generated SignedSource<<2be9d094f217f44bc90376bd4a03d45b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGroupingDetailPrimQuery$variables = {
  id: string;
  primitivesVersion?: number | null | undefined;
  slug?: string | null | undefined;
};
export type documentsGroupingDetailPrimQuery$data = {
  readonly groupingDetailPage: {
    readonly primTree: any | null | undefined;
  };
};
export type documentsGroupingDetailPrimQuery = {
  response: documentsGroupingDetailPrimQuery$data;
  variables: documentsGroupingDetailPrimQuery$variables;
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
  "name": "primitivesVersion"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
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
    "concreteType": "GroupingDetailPage",
    "kind": "LinkedField",
    "name": "groupingDetailPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "primitivesVersion",
            "variableName": "primitivesVersion"
          }
        ],
        "kind": "ScalarField",
        "name": "primTree",
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
    "name": "documentsGroupingDetailPrimQuery",
    "selections": (v3/*:: as any*/),
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
    "name": "documentsGroupingDetailPrimQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "fbc7efe38d137ae654ddb95971ac6a00",
    "id": null,
    "metadata": {},
    "name": "documentsGroupingDetailPrimQuery",
    "operationKind": "query",
    "text": "query documentsGroupingDetailPrimQuery(\n  $slug: String\n  $id: ID!\n  $primitivesVersion: Int\n) {\n  groupingDetailPage(slug: $slug, id: $id) {\n    primTree(primitivesVersion: $primitivesVersion)\n  }\n}\n"
  }
};
})();

(node as any).hash = "346d86d6e7a0819f364158f9354ddcbe";

export default node;
