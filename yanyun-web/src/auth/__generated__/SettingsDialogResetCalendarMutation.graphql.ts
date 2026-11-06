/**
 * @generated SignedSource<<cdd403eb44078e670ff052d2d028ab53>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogResetCalendarMutation$variables = Record<PropertyKey, never>;
export type SettingsDialogResetCalendarMutation$data = {
  readonly resetCalendarFeedToken: {
    readonly calendarFeed: {
      readonly calendarUrl: string;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogResetCalendarMutation = {
  response: SettingsDialogResetCalendarMutation$data;
  variables: SettingsDialogResetCalendarMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ResetCalendarFeedPayload",
    "kind": "LinkedField",
    "name": "resetCalendarFeedToken",
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
        "concreteType": "CalendarFeedSettings",
        "kind": "LinkedField",
        "name": "calendarFeed",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "calendarUrl",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "SettingsDialogResetCalendarMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogResetCalendarMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "1d5d5978817d735a53c0d8fd9e79aac7",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogResetCalendarMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogResetCalendarMutation {\n  resetCalendarFeedToken {\n    ok\n    error\n    errorCode\n    calendarFeed {\n      calendarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "3fe3a80eabd4bb8f72ed8137e5d06882";

export default node;
