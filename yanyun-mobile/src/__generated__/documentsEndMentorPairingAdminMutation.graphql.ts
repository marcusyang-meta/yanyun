/**
 * @generated SignedSource<<f1594ff0e571d392df7fb5a240848074>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsEndMentorPairingAdminMutation$variables = {
  pairingId: string;
  slug: string;
};
export type documentsEndMentorPairingAdminMutation$data = {
  readonly endMentorPairing: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsEndMentorPairingAdminMutation = {
  response: documentsEndMentorPairingAdminMutation$data;
  variables: documentsEndMentorPairingAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "pairingId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "pairingId",
    "variableName": "pairingId"
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
    "name": "documentsEndMentorPairingAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "endMentorPairing",
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
    "name": "documentsEndMentorPairingAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "endMentorPairing",
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
    "cacheID": "8101546b275a55952cbe3e11b56b87a8",
    "id": null,
    "metadata": {},
    "name": "documentsEndMentorPairingAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsEndMentorPairingAdminMutation(\n  $slug: String!\n  $pairingId: ID!\n) {\n  endMentorPairing(slug: $slug, pairingId: $pairingId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "8ecf38ff50b319f6d04577af8234b2b4";

export default node;
