/**
 * @generated SignedSource<<359a902285a9efdcac5705eccecd5062>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type documentsGroupingListPrimQuery$variables = {
  primitivesVersion?: number | null | undefined;
  slug: string;
  tab: GroupingTab;
  weekOffset?: number | null | undefined;
};
export type documentsGroupingListPrimQuery$data = {
  readonly groupingListPage: {
    readonly primTree: any | null | undefined;
  };
};
export type documentsGroupingListPrimQuery = {
  response: documentsGroupingListPrimQuery$data;
  variables: documentsGroupingListPrimQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "primitivesVersion"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "tab"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "weekOffset"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "tab",
        "variableName": "tab"
      }
    ],
    "concreteType": "GroupingListPage",
    "kind": "LinkedField",
    "name": "groupingListPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "primitivesVersion",
            "variableName": "primitivesVersion"
          },
          {
            "kind": "Variable",
            "name": "weekOffset",
            "variableName": "weekOffset"
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
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGroupingListPrimQuery",
    "selections": (v4/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsGroupingListPrimQuery",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "2a43c8deab84f89af31a6d170ed8a39f",
    "id": null,
    "metadata": {},
    "name": "documentsGroupingListPrimQuery",
    "operationKind": "query",
    "text": "query documentsGroupingListPrimQuery(\n  $slug: String!\n  $tab: GroupingTab!\n  $weekOffset: Int\n  $primitivesVersion: Int\n) {\n  groupingListPage(slug: $slug, tab: $tab) {\n    primTree(primitivesVersion: $primitivesVersion, weekOffset: $weekOffset)\n  }\n}\n"
  }
};
})();

(node as any).hash = "259619a3baacdf0a145efc88554bfd70";

export default node;
