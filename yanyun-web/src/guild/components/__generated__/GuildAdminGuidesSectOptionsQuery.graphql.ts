/**
 * @generated SignedSource<<2c5301a7c582f8d06e065dd58c44fdde>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGuidesSectOptionsQuery$variables = Record<PropertyKey, never>;
export type GuildAdminGuidesSectOptionsQuery$data = {
  readonly dexPage: {
    readonly sectOptions: ReadonlyArray<{
      readonly name: string;
      readonly slug: string;
    }>;
  };
};
export type GuildAdminGuidesSectOptionsQuery = {
  response: GuildAdminGuidesSectOptionsQuery$data;
  variables: GuildAdminGuidesSectOptionsQuery$variables;
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
    "name": "GuildAdminGuidesSectOptionsQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GuildAdminGuidesSectOptionsQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "da4eff6567f15cdf245c72a6cca19fde",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGuidesSectOptionsQuery",
    "operationKind": "query",
    "text": "query GuildAdminGuidesSectOptionsQuery {\n  dexPage {\n    sectOptions {\n      slug\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebfe59349bc349e6121b9237a946620f";

export default node;
