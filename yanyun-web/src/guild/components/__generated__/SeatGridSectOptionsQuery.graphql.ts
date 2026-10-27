/**
 * @generated SignedSource<<28ff1bff9308d3a90f1c4e025c5560ab>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SeatGridSectOptionsQuery$variables = Record<PropertyKey, never>;
export type SeatGridSectOptionsQuery$data = {
  readonly dexPage: {
    readonly sectOptions: ReadonlyArray<{
      readonly name: string;
      readonly slug: string;
    }>;
  };
};
export type SeatGridSectOptionsQuery = {
  response: SeatGridSectOptionsQuery$data;
  variables: SeatGridSectOptionsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "DexPage",
    "kind": "LinkedField",
    "name": "dexPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "SectOption",
        "kind": "LinkedField",
        "name": "sectOptions",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          }
        ],
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
    "name": "SeatGridSectOptionsQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SeatGridSectOptionsQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "d11c503cef7198ddb09bcd46f15eacdc",
    "id": null,
    "metadata": {},
    "name": "SeatGridSectOptionsQuery",
    "operationKind": "query",
    "text": "query SeatGridSectOptionsQuery {\n  dexPage {\n    sectOptions {\n      slug\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4f9b1b19f8872519e10daf5dc35a4ae1";

export default node;
