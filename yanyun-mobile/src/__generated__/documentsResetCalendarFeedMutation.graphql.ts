/**
 * @generated SignedSource<<7c7891daf1dfb7badd81ca4aa47a30d8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsResetCalendarFeedMutation$variables = Record<PropertyKey, never>;
export type documentsResetCalendarFeedMutation$data = {
  readonly resetCalendarFeedToken: {
    readonly calendarFeed: {
      readonly calendarUrl: string;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsResetCalendarFeedMutation = {
  response: documentsResetCalendarFeedMutation$data;
  variables: documentsResetCalendarFeedMutation$variables;
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
    "name": "documentsResetCalendarFeedMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsResetCalendarFeedMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "3fb0db331e01dede734feaec6445ec80",
    "id": null,
    "metadata": {},
    "name": "documentsResetCalendarFeedMutation",
    "operationKind": "mutation",
    "text": "mutation documentsResetCalendarFeedMutation {\n  resetCalendarFeedToken {\n    ok\n    error\n    errorCode\n    calendarFeed {\n      calendarUrl\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "72a708b6d60105afa8032672f41c3d2a";

export default node;
