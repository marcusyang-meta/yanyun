/**
 * @generated SignedSource<<35d81f5a1a214609ae863616d98ef5ab>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildRecruitPageApplyMutation$variables = {
  message?: string | null | undefined;
  slug: string;
};
export type GuildRecruitPageApplyMutation$data = {
  readonly applyToGuild: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildRecruitPageApplyMutation = {
  response: GuildRecruitPageApplyMutation$data;
  variables: GuildRecruitPageApplyMutation$variables;
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
    "name": "GuildRecruitPageApplyMutation",
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
    "name": "GuildRecruitPageApplyMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "1592b29ad699fbcf01a001316cf4a710",
    "id": null,
    "metadata": {},
    "name": "GuildRecruitPageApplyMutation",
    "operationKind": "mutation",
    "text": "mutation GuildRecruitPageApplyMutation(\n  $slug: String!\n  $message: String\n) {\n  applyToGuild(slug: $slug, message: $message) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "90fdff3d04358497200b6d1e2b8225d3";

export default node;
