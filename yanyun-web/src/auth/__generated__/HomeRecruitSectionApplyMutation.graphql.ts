/**
 * @generated SignedSource<<45f84e88a332e33ebce5b2cb226cdbaa>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type HomeRecruitSectionApplyMutation$variables = {
  message?: string | null | undefined;
  slug: string;
};
export type HomeRecruitSectionApplyMutation$data = {
  readonly applyToGuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type HomeRecruitSectionApplyMutation = {
  response: HomeRecruitSectionApplyMutation$data;
  variables: HomeRecruitSectionApplyMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "message"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "message",
        "variableName": "message"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "RecruitPayload",
    "kind": "LinkedField",
    "name": "applyToGuild",
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
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "HomeRecruitSectionApplyMutation",
    "selections": (v2/*:: as any*/),
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
    "name": "HomeRecruitSectionApplyMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "54dc9d1c8de37de194820d2d11e31265",
    "id": null,
    "metadata": {},
    "name": "HomeRecruitSectionApplyMutation",
    "operationKind": "mutation",
    "text": "mutation HomeRecruitSectionApplyMutation(\n  $slug: String!\n  $message: String\n) {\n  applyToGuild(slug: $slug, message: $message) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "d9e0af529c54fdd6f0f9c37bc82211f2";

export default node;
