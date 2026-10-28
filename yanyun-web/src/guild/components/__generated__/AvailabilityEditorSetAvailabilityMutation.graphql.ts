/**
 * @generated SignedSource<<fda9ddfc785215af270e2fa98b6b2b82>>
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
export type AvailabilityEditorSetAvailabilityMutation$variables = {
  input: SetAvailabilityInput;
};
export type AvailabilityEditorSetAvailabilityMutation$data = {
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
export type AvailabilityEditorSetAvailabilityMutation = {
  response: AvailabilityEditorSetAvailabilityMutation$data;
  variables: AvailabilityEditorSetAvailabilityMutation$variables;
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
    "name": "AvailabilityEditorSetAvailabilityMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "AvailabilityEditorSetAvailabilityMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "8f1da54ca904a2a7e1628fdc23e7d760",
    "id": null,
    "metadata": {},
    "name": "AvailabilityEditorSetAvailabilityMutation",
    "operationKind": "mutation",
    "text": "mutation AvailabilityEditorSetAvailabilityMutation(\n  $input: SetAvailabilityInput!\n) {\n  setMyAvailability(input: $input) {\n    ok\n    error\n    errorCode\n    slots {\n      weekday\n      startMinute\n      endMinute\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "1870130823024a4d8735a10fac85b6d1";

export default node;
