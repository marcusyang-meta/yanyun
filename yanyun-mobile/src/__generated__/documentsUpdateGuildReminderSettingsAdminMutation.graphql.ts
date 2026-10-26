/**
 * @generated SignedSource<<0f9d43a0b5806e815fe1f40af3d3084b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateGuildReminderSettingsAdminMutation$variables = {
  customText?: string | null | undefined;
  offsets: ReadonlyArray<number>;
  slug: string;
};
export type documentsUpdateGuildReminderSettingsAdminMutation$data = {
  readonly updateGuildReminderSettings: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildReminderSettingsAdminMutation = {
  response: documentsUpdateGuildReminderSettingsAdminMutation$data;
  variables: documentsUpdateGuildReminderSettingsAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "customText"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offsets"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "customText",
    "variableName": "customText"
  },
  {
    "kind": "Variable",
    "name": "offsets",
    "variableName": "offsets"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsUpdateGuildReminderSettingsAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildReminderSettings",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsUpdateGuildReminderSettingsAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildReminderSettings",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a86cd793428ee0a030a5fd4e3f0e3d8f",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildReminderSettingsAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildReminderSettingsAdminMutation(\n  $slug: String!\n  $offsets: [Int!]!\n  $customText: String\n) {\n  updateGuildReminderSettings(slug: $slug, offsets: $offsets, customText: $customText) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ba4253dbe38b58218456015a5a1f9965";

export default node;
