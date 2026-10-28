/**
 * @generated SignedSource<<2416e1fb19d8ec35b73ee84a6bc1c63b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SaveRotationAdviceInput = {
  groupingId: string;
};
export type GroupingDetailSaveRotationMutation$variables = {
  input: SaveRotationAdviceInput;
};
export type GroupingDetailSaveRotationMutation$data = {
  readonly saveRotationAdvice: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
    readonly savedText: string | null | undefined;
  };
};
export type GroupingDetailSaveRotationMutation = {
  response: GroupingDetailSaveRotationMutation$data;
  variables: GroupingDetailSaveRotationMutation$variables;
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
    "concreteType": "SchedulingAdvicePayload",
    "kind": "LinkedField",
    "name": "saveRotationAdvice",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "savedText",
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
    "name": "GroupingDetailSaveRotationMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailSaveRotationMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "6c1407968d00c9fbfaaa89978b767d01",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailSaveRotationMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailSaveRotationMutation(\n  $input: SaveRotationAdviceInput!\n) {\n  saveRotationAdvice(input: $input) {\n    ok\n    error\n    savedText\n  }\n}\n"
  }
};
})();

(node as any).hash = "aa46cf062733d4b32b26f5164ab2774f";

export default node;
