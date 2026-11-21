/**
 * @generated SignedSource<<e875a00a80f534e403a247ac87162db3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type JoinGroupingInput = {
  answers?: ReadonlyArray<SignupAnswerInput> | null | undefined;
  confirmWeekDuplicate?: boolean | null | undefined;
  forDiscordId?: string | null | undefined;
  groupingId: string;
  nickname: string;
  seatIndex: number;
  weapon: string;
};
export type SignupAnswerInput = {
  fieldId: string;
  value: string;
};
export type GroupingDetailApplyDraftMutation$variables = {
  input: JoinGroupingInput;
};
export type GroupingDetailApplyDraftMutation$data = {
  readonly joinGrouping: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GroupingDetailApplyDraftMutation = {
  response: GroupingDetailApplyDraftMutation$data;
  variables: GroupingDetailApplyDraftMutation$variables;
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
    "concreteType": "SeatPayload",
    "kind": "LinkedField",
    "name": "joinGrouping",
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
    "name": "GroupingDetailApplyDraftMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GroupingDetailApplyDraftMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "b18228a9213c337c5476aef533cb0e46",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailApplyDraftMutation",
    "operationKind": "mutation",
    "text": "mutation GroupingDetailApplyDraftMutation(\n  $input: JoinGroupingInput!\n) {\n  joinGrouping(input: $input) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "3f1bb93425571cfd3dad6cab58ba85e2";

export default node;
