/**
 * @generated SignedSource<<df79802c756f0b06a766b62c6b9c74d8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsRemoveEventSignupAdminMutation$variables = {
  signupId: string;
  slug: string;
};
export type documentsRemoveEventSignupAdminMutation$data = {
  readonly removeEventSignup: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsRemoveEventSignupAdminMutation = {
  response: documentsRemoveEventSignupAdminMutation$data;
  variables: documentsRemoveEventSignupAdminMutation$variables;
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
    "name": "documentsRemoveEventSignupAdminMutation",
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
    "name": "documentsRemoveEventSignupAdminMutation",
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
    "cacheID": "915577afce1709b161641ea98d2adff6",
    "id": null,
    "metadata": {},
    "name": "documentsRemoveEventSignupAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsRemoveEventSignupAdminMutation(\n  $slug: String!\n  $signupId: ID!\n) {\n  removeEventSignup(slug: $slug, signupId: $signupId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "3464fd2d451113902806f7225862a02c";

export default node;
