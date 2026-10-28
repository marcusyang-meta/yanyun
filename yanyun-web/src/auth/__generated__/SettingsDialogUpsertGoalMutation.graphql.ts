/**
 * @generated SignedSource<<7ab5b97e81343f1848c144a882e125a1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SeasonGoalStatus = "ACTIVE" | "DONE" | "DROPPED" | "%future added value";
export type SeasonGoalInput = {
  dungeonId?: number | null | undefined;
  id?: string | null | undefined;
  note?: string | null | undefined;
  slug: string;
  status?: SeasonGoalStatus | null | undefined;
  title: string;
};
export type SettingsDialogUpsertGoalMutation$variables = {
  input: SeasonGoalInput;
};
export type SettingsDialogUpsertGoalMutation$data = {
  readonly upsertMySeasonGoal: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogUpsertGoalMutation = {
  response: SettingsDialogUpsertGoalMutation$data;
  variables: SettingsDialogUpsertGoalMutation$variables;
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
    "concreteType": "SeasonGoalPayload",
    "kind": "LinkedField",
    "name": "upsertMySeasonGoal",
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
    "name": "SettingsDialogUpsertGoalMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsDialogUpsertGoalMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "0843768d3c6f79970722fdd43c96a9d6",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogUpsertGoalMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogUpsertGoalMutation(\n  $input: SeasonGoalInput!\n) {\n  upsertMySeasonGoal(input: $input) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "18ee836e6d8a939e82f5f7e3f75c42fa";

export default node;
