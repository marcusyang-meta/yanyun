/**
 * @generated SignedSource<<34c83c5e52eed37b320fe0b22fa4dcfd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsAvailabilityPageQuery$variables = Record<PropertyKey, never>;
export type documentsAvailabilityPageQuery$data = {
  readonly settingsPage: {
    readonly availabilityAddSlotLabel: string;
    readonly availabilityEmptyText: string;
    readonly availabilityGuilds: ReadonlyArray<{
      readonly guildName: string;
      readonly slots: ReadonlyArray<{
        readonly endMinute: number;
        readonly startMinute: number;
        readonly weekday: number;
      }>;
      readonly slug: string;
    }>;
    readonly availabilityHint: string;
    readonly availabilityNoGuildsText: string;
    readonly availabilityRemoveLabel: string;
    readonly availabilitySaveFailedTemplate: string;
    readonly availabilitySaveLabel: string;
    readonly availabilitySavedText: string;
    readonly availabilityTitle: string;
    readonly availabilityWeekdayNames: ReadonlyArray<string>;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
  };
};
export type documentsAvailabilityPageQuery = {
  response: documentsAvailabilityPageQuery$data;
  variables: documentsAvailabilityPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "SettingsPage",
    "kind": "LinkedField",
    "name": "settingsPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityWeekdayNames",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityAddSlotLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySaveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySavedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilitySaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "availabilityNoGuildsText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "SettingsAvailabilityGuild",
        "kind": "LinkedField",
        "name": "availabilityGuilds",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "guildName",
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsAvailabilityPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsAvailabilityPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "347c11f8ee4a625cd4bc29d24415155c",
    "id": null,
    "metadata": {},
    "name": "documentsAvailabilityPageQuery",
    "operationKind": "query",
    "text": "query documentsAvailabilityPageQuery {\n  viewer {\n    commonUnknownErrorText\n  }\n  settingsPage {\n    availabilityTitle\n    availabilityHint\n    availabilityWeekdayNames\n    availabilityAddSlotLabel\n    availabilityRemoveLabel\n    availabilitySaveLabel\n    availabilitySavedText\n    availabilitySaveFailedTemplate\n    availabilityEmptyText\n    availabilityNoGuildsText\n    availabilityGuilds {\n      slug\n      guildName\n      slots {\n        weekday\n        startMinute\n        endMinute\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "0aa22a8c8e38cc25774a8817aa5a79dc";

export default node;
