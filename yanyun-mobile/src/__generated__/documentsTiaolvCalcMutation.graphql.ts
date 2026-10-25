/**
 * @generated SignedSource<<402aabeb2c32df6e78ac353758dcfc60>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type TiaolvInput = {
  attrRequire?: number | null | undefined;
  bowSkill?: string | null | undefined;
  innerSkills: ReadonlyArray<string>;
  suit: string;
  tunes?: ReadonlyArray<TiaolvCellInput> | null | undefined;
  wuku?: string | null | undefined;
  wuxue?: string | null | undefined;
};
export type TiaolvCellInput = {
  cell: string;
  value: number;
};
export type documentsTiaolvCalcMutation$variables = {
  input: TiaolvInput;
};
export type documentsTiaolvCalcMutation$data = {
  readonly calcTiaolv: {
    readonly rows: ReadonlyArray<{
      readonly base: number | null | undefined;
      readonly final: number | null | undefined;
      readonly key: string;
      readonly label: string;
      readonly panel: number | null | undefined;
    }>;
  };
};
export type documentsTiaolvCalcMutation = {
  response: documentsTiaolvCalcMutation$data;
  variables: documentsTiaolvCalcMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "TiaolvResult",
    "kind": "LinkedField",
    "name": "calcTiaolv",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "TiaolvRow",
        "kind": "LinkedField",
        "name": "rows",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "key",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "label",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "base",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "panel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "final",
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsTiaolvCalcMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsTiaolvCalcMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "5a4e432f2dfe77988e2f5c9b05804451",
    "id": null,
    "metadata": {},
    "name": "documentsTiaolvCalcMutation",
    "operationKind": "mutation",
    "text": "mutation documentsTiaolvCalcMutation(\n  $input: TiaolvInput!\n) {\n  calcTiaolv(input: $input) {\n    rows {\n      key\n      label\n      base\n      panel\n      final\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d4f0da34f581f2663f1ac7c69c590408";

export default node;
