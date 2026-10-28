/**
 * @generated SignedSource<<ee3608c4f10f13f08528b400219dfd1c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsMarkGuildAnnouncementReadMutation$variables = {
  id: string;
  slug: string;
};
export type documentsMarkGuildAnnouncementReadMutation$data = {
  readonly markGuildAnnouncementRead: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsMarkGuildAnnouncementReadMutation = {
  response: documentsMarkGuildAnnouncementReadMutation$data;
  variables: documentsMarkGuildAnnouncementReadMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
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
        "name": "announcementId",
        "variableName": "id"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "GuildAnnouncementPayload",
    "kind": "LinkedField",
    "name": "markGuildAnnouncementRead",
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
    "name": "documentsMarkGuildAnnouncementReadMutation",
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
    "name": "documentsMarkGuildAnnouncementReadMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "7aa16d933a56097cc6dd9a0a3cafccbd",
    "id": null,
    "metadata": {},
    "name": "documentsMarkGuildAnnouncementReadMutation",
    "operationKind": "mutation",
    "text": "mutation documentsMarkGuildAnnouncementReadMutation(\n  $slug: String!\n  $id: ID!\n) {\n  markGuildAnnouncementRead(slug: $slug, announcementId: $id) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "07d7a441da970325b4b0ae723c4b1558";

export default node;
