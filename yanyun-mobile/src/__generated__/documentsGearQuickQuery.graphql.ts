/**
 * @generated SignedSource<<2f22ac7da6fa54670e690860ee8bb841>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearQuickQuery$variables = Record<PropertyKey, never>;
export type documentsGearQuickQuery$data = {
  readonly gradPage: {
    readonly gearCalcFailedText: string;
    readonly gearCalcLabel: string;
    readonly gearQuickBarNames: ReadonlyArray<string>;
    readonly gearQuickGapTemplate: string;
    readonly gearQuickOkText: string;
    readonly gearQuickOverTemplate: string;
    readonly gearQuickResLabel: string;
    readonly gearQuickSyncLabel: string;
    readonly gearQuickSyncedToast: string;
    readonly gearQuickTitle: string;
    readonly gearResDefault: number;
    readonly gearWhiteLabel: string;
    readonly gearYAccLabel: string;
    readonly gearYCritLabel: string;
    readonly gearYIntLabel: string;
  };
};
export type documentsGearQuickQuery = {
  response: documentsGearQuickQuery$data;
  variables: documentsGearQuickQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickResLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickSyncLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickSyncedToast",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickOkText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickOverTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickGapTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCalcLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearCalcFailedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYAccLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYCritLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearYIntLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearWhiteLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearQuickBarNames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearResDefault",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGearQuickQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsGearQuickQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "88d86a22982bb1e6b9c2179d4bc01373",
    "id": null,
    "metadata": {},
    "name": "documentsGearQuickQuery",
    "operationKind": "query",
    "text": "query documentsGearQuickQuery {\n  gradPage {\n    gearQuickTitle\n    gearQuickResLabel\n    gearQuickSyncLabel\n    gearQuickSyncedToast\n    gearQuickOkText\n    gearQuickOverTemplate\n    gearQuickGapTemplate\n    gearCalcLabel\n    gearCalcFailedText\n    gearYAccLabel\n    gearYCritLabel\n    gearYIntLabel\n    gearWhiteLabel\n    gearQuickBarNames\n    gearResDefault\n  }\n}\n"
  }
};
})();

(node as any).hash = "e46df27d860d413d0f7566a1650e0571";

export default node;
