/**
 * @generated SignedSource<<b0665dd463613772a5e17194eaa4e133>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type UpdateSchoolGuideInput = {
  attr?: string | null | undefined;
  bisJson?: string | null | undefined;
  build?: string | null | undefined;
  rate?: string | null | undefined;
  rotationJson?: string | null | undefined;
  school: string;
};
export type GuildAdminGuidesUpdateMutation$variables = {
  input: UpdateSchoolGuideInput;
  slug: string;
};
export type GuildAdminGuidesUpdateMutation$data = {
  readonly updateSchoolGuide: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminGuidesUpdateMutation = {
  response: GuildAdminGuidesUpdateMutation$data;
  variables: GuildAdminGuidesUpdateMutation$variables;
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
    "name": "GuildAdminGuidesUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateSchoolGuide",
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
    "name": "GuildAdminGuidesUpdateMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "updateSchoolGuide",
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
    "cacheID": "50dda8a676c21d8235ef60ba3dd0b6d7",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGuidesUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminGuidesUpdateMutation(\n  $slug: String!\n  $input: UpdateSchoolGuideInput!\n) {\n  updateSchoolGuide(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c5aaf10b5c2b601b3990b72766238294";

export default node;
