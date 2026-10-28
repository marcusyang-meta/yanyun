/**
 * @generated SignedSource<<ea441fc401d3b5b5b80a2394ef0b2b79>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogDeleteGoalMutation$variables = {
  goalId: string;
};
export type SettingsDialogDeleteGoalMutation$data = {
  readonly deleteMySeasonGoal: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogDeleteGoalMutation = {
  response: SettingsDialogDeleteGoalMutation$data;
  variables: SettingsDialogDeleteGoalMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "goalId"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "goalId",
        "variableName": "goalId"
      }
    ],
    "concreteType": "SeasonGoalPayload",
    "kind": "LinkedField",
    "name": "deleteMySeasonGoal",
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
    "name": "SettingsDialogDeleteGoalMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogDeleteGoalMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "a0f974052098e921ca798b1f11da2802",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogDeleteGoalMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogDeleteGoalMutation(\n  $goalId: ID!\n) {\n  deleteMySeasonGoal(goalId: $goalId) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "e5c21a02538221197a345d432efcc551";

export default node;
