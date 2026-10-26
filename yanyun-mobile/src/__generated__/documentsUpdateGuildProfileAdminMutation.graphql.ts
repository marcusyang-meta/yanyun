/**
 * @generated SignedSource<<ee2b84fa1793f3ad95fc1c17a0269e52>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateGuildProfileInput = {
  announcement?: string | null | undefined;
  bgImageUrl?: string | null | undefined;
  logoUrl?: string | null | undefined;
  masterName?: string | null | undefined;
  name?: string | null | undefined;
  slogan?: string | null | undefined;
};
export type documentsUpdateGuildProfileAdminMutation$variables = {
  input: UpdateGuildProfileInput;
  slug: string;
};
export type documentsUpdateGuildProfileAdminMutation$data = {
  readonly updateGuildProfile: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateGuildProfileAdminMutation = {
  response: documentsUpdateGuildProfileAdminMutation$data;
  variables: documentsUpdateGuildProfileAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
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
    "name": "documentsUpdateGuildProfileAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildProfile",
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
    "name": "documentsUpdateGuildProfileAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateGuildProfile",
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
    "cacheID": "ca63078d34afd5490d4b351a705d089f",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateGuildProfileAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateGuildProfileAdminMutation(\n  $slug: String!\n  $input: UpdateGuildProfileInput!\n) {\n  updateGuildProfile(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6db95b858e853784927715f8d2968370";

export default node;
