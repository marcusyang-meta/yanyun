/**
 * @generated SignedSource<<6f1a91ea0634bf46028675c3cfdce78a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearLibraryPasteMutation$variables = {
  text: string;
};
export type GearLibraryPasteMutation$data = {
  readonly gearParsePaste: {
    readonly fullExportJson: string | null | undefined;
    readonly gears: ReadonlyArray<{
      readonly dingyin: {
        readonly name: string;
        readonly val: number;
      } | null | undefined;
      readonly lines: ReadonlyArray<{
        readonly key: string;
        readonly val: number;
      }>;
      readonly name: string;
      readonly slot: string;
    }>;
    readonly mode: string;
    readonly unknown: number;
  };
};
export type GearLibraryPasteMutation = {
  response: GearLibraryPasteMutation$data;
  variables: GearLibraryPasteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "text"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "val",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "text",
        "variableName": "text"
      }
    ],
    "concreteType": "GearParseResult",
    "kind": "LinkedField",
    "name": "gearParsePaste",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "mode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "unknown",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearParsedItem",
        "kind": "LinkedField",
        "name": "gears",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slot",
            "storageKey": null
          },
          (v1/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "GearLine",
            "kind": "LinkedField",
            "name": "lines",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "key",
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearDingyin",
            "kind": "LinkedField",
            "name": "dingyin",
            "plural": false,
            "selections": [
              (v1/*:: as any*/),
              (v2/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "fullExportJson",
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
    "name": "GearLibraryPasteMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GearLibraryPasteMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "6ac04fc6d677c93d1447938d9e32efc3",
    "id": null,
    "metadata": {},
    "name": "GearLibraryPasteMutation",
    "operationKind": "mutation",
    "text": "mutation GearLibraryPasteMutation(\n  $text: String!\n) {\n  gearParsePaste(text: $text) {\n    mode\n    unknown\n    gears {\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n    }\n    fullExportJson\n  }\n}\n"
  }
};
})();

(node as any).hash = "88c7108faa5fb58a734dba70fad14884";

export default node;
