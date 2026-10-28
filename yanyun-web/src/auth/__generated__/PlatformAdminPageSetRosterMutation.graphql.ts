/**
 * @generated SignedSource<<0c655e230576c47ff306cb71b5adbe86>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageSetRosterMutation$variables = {
  discordIds: ReadonlyArray<string>;
};
export type PlatformAdminPageSetRosterMutation$data = {
  readonly platformAdminSetRoster: {
    readonly adminRoster: ReadonlyArray<string>;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageSetRosterMutation = {
  response: PlatformAdminPageSetRosterMutation$data;
  variables: PlatformAdminPageSetRosterMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "discordIds"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "discordIds",
        "variableName": "discordIds"
      }
    ],
    "concreteType": "PlatformAdminRosterPayload",
    "kind": "LinkedField",
    "name": "platformAdminSetRoster",
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
        "kind": "ScalarField",
        "name": "adminRoster",
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
    "name": "PlatformAdminPageSetRosterMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "PlatformAdminPageSetRosterMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "4e75d6d9db5d14d2426973af55f86414",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageSetRosterMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageSetRosterMutation(\n  $discordIds: [String!]!\n) {\n  platformAdminSetRoster(discordIds: $discordIds) {\n    ok\n    error\n    errorCode\n    adminRoster\n  }\n}\n"
  }
};
})();

(node as any).hash = "b2b191171b6f18165127ee2a8f9a06c1";

export default node;
