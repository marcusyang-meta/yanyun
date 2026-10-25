/**
 * @generated SignedSource<<1f14de79cfcc0860a291b83ca89ca26e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearLibraryPasteMutation$variables = {
  text: string;
};
export type documentsGearLibraryPasteMutation$data = {
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
export type documentsGearLibraryPasteMutation = {
  response: documentsGearLibraryPasteMutation$data;
  variables: documentsGearLibraryPasteMutation$variables;
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
    "name": "documentsGearLibraryPasteMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGearLibraryPasteMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "09cfa48d7d39e489fe873328cf0e19ab",
    "id": null,
    "metadata": {},
    "name": "documentsGearLibraryPasteMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGearLibraryPasteMutation(\n  $text: String!\n) {\n  gearParsePaste(text: $text) {\n    mode\n    unknown\n    gears {\n      slot\n      name\n      lines {\n        key\n        val\n      }\n      dingyin {\n        name\n        val\n      }\n    }\n    fullExportJson\n  }\n}\n"
  }
};
})();

(node as any).hash = "e9d3f5286780786dbb66f75ac0c083da";

export default node;
