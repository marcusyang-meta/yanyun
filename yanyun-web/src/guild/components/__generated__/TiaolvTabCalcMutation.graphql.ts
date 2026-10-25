/**
 * @generated SignedSource<<08910dd39fb4a605eb9d295245660f97>>
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
export type TiaolvTabCalcMutation$variables = {
  input: TiaolvInput;
};
export type TiaolvTabCalcMutation$data = {
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
export type TiaolvTabCalcMutation = {
  response: TiaolvTabCalcMutation$data;
  variables: TiaolvTabCalcMutation$variables;
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
    "name": "TiaolvTabCalcMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "TiaolvTabCalcMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "355e572abbbff1c77034e6fa28073ccf",
    "id": null,
    "metadata": {},
    "name": "TiaolvTabCalcMutation",
    "operationKind": "mutation",
    "text": "mutation TiaolvTabCalcMutation(\n  $input: TiaolvInput!\n) {\n  calcTiaolv(input: $input) {\n    rows {\n      key\n      label\n      base\n      panel\n      final\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9db6ff7bd37c259e468f0a0f70c04f69";

export default node;
