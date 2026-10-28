/**
 * @generated SignedSource<<e45ad10e88204a8bf367f5ca2f409cf2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SetAvailabilityInput = {
  slots: ReadonlyArray<AvailabilitySlotInput>;
  slug: string;
};
export type AvailabilitySlotInput = {
  endMinute: number;
  startMinute: number;
  weekday: number;
};
export type documentsSetMyAvailabilityMutation$variables = {
  input: SetAvailabilityInput;
};
export type documentsSetMyAvailabilityMutation$data = {
  readonly setMyAvailability: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly slots: ReadonlyArray<{
      readonly endMinute: number;
      readonly startMinute: number;
      readonly weekday: number;
    }>;
  };
};
export type documentsSetMyAvailabilityMutation = {
  response: documentsSetMyAvailabilityMutation$data;
  variables: documentsSetMyAvailabilityMutation$variables;
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
    "concreteType": "AvailabilityPayload",
    "kind": "LinkedField",
    "name": "setMyAvailability",
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
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "AvailabilitySlot",
        "kind": "LinkedField",
        "name": "slots",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "weekday",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "startMinute",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "endMinute",
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
    "name": "documentsSetMyAvailabilityMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsSetMyAvailabilityMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a285c16559a400c0d728d468fda473ea",
    "id": null,
    "metadata": {},
    "name": "documentsSetMyAvailabilityMutation",
    "operationKind": "mutation",
    "text": "mutation documentsSetMyAvailabilityMutation(\n  $input: SetAvailabilityInput!\n) {\n  setMyAvailability(input: $input) {\n    ok\n    error\n    errorCode\n    slots {\n      weekday\n      startMinute\n      endMinute\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "86a9b38ce060fb4523cab726941f4ac7";

export default node;
