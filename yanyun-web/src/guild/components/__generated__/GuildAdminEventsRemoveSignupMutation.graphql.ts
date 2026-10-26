/**
 * @generated SignedSource<<e9869ed27502077e157a62af45a838d5>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminEventsRemoveSignupMutation$variables = {
  signupId: string;
  slug: string;
};
export type GuildAdminEventsRemoveSignupMutation$data = {
  readonly removeEventSignup: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminEventsRemoveSignupMutation = {
  response: GuildAdminEventsRemoveSignupMutation$data;
  variables: GuildAdminEventsRemoveSignupMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "signupId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "signupId",
    "variableName": "signupId"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminEventsRemoveSignupMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeEventSignup",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
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
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminEventsRemoveSignupMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "removeEventSignup",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
    "cacheID": "211dde96bbf8490d059f4854b7b339c4",
    "id": null,
    "metadata": {},
    "name": "GuildAdminEventsRemoveSignupMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminEventsRemoveSignupMutation(\n  $slug: String!\n  $signupId: ID!\n) {\n  removeEventSignup(slug: $slug, signupId: $signupId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "7fcab42c59117acc1615924ea24b0a29";

export default node;
