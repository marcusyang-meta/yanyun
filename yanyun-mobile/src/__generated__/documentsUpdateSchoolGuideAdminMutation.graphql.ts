/**
 * @generated SignedSource<<bc182f4c599759a27c67f47c9845ec36>>
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
export type documentsUpdateSchoolGuideAdminMutation$variables = {
  input: UpdateSchoolGuideInput;
  slug: string;
};
export type documentsUpdateSchoolGuideAdminMutation$data = {
  readonly updateSchoolGuide: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsUpdateSchoolGuideAdminMutation = {
  response: documentsUpdateSchoolGuideAdminMutation$data;
  variables: documentsUpdateSchoolGuideAdminMutation$variables;
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
    "name": "documentsUpdateSchoolGuideAdminMutation",
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
    "name": "documentsUpdateSchoolGuideAdminMutation",
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
    "cacheID": "05487532e51b385a326dadbf180c1b1f",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateSchoolGuideAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateSchoolGuideAdminMutation(\n  $slug: String!\n  $input: UpdateSchoolGuideInput!\n) {\n  updateSchoolGuide(slug: $slug, input: $input) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "c26f482f4c93d1f734a7cc2b5de50cd9";

export default node;
