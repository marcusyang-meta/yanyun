/**
 * @generated SignedSource<<526683b1bcbb2cf75a1ee534096a1170>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type AnnouncementKind = "STANDARD" | "URGENT" | "%future added value";
export type documentsPostGuildAnnouncementMutation$variables = {
  body: string;
  kind: AnnouncementKind;
  slug: string;
  title: string;
};
export type documentsPostGuildAnnouncementMutation$data = {
  readonly postGuildAnnouncement: {
    readonly announcement: {
      readonly id: string;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsPostGuildAnnouncementMutation = {
  response: documentsPostGuildAnnouncementMutation$data;
  variables: documentsPostGuildAnnouncementMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "body"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "kind"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "title"
},
v4 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "body",
        "variableName": "body"
      },
      {
        "kind": "Variable",
        "name": "kind",
        "variableName": "kind"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "title",
        "variableName": "title"
      }
    ],
    "concreteType": "GuildAnnouncementPayload",
    "kind": "LinkedField",
    "name": "postGuildAnnouncement",
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
        "concreteType": "GuildAnnouncement",
        "kind": "LinkedField",
        "name": "announcement",
        "plural": false,
        "selections": [
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
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsPostGuildAnnouncementMutation",
    "selections": (v4/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v3/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "documentsPostGuildAnnouncementMutation",
    "selections": (v4/*:: as any*/)
  },
  "params": {
    "cacheID": "7029c637aa3220fabc6019637d3df2e8",
    "id": null,
    "metadata": {},
    "name": "documentsPostGuildAnnouncementMutation",
    "operationKind": "mutation",
    "text": "mutation documentsPostGuildAnnouncementMutation(\n  $slug: String!\n  $kind: AnnouncementKind!\n  $title: String!\n  $body: String!\n) {\n  postGuildAnnouncement(slug: $slug, kind: $kind, title: $title, body: $body) {\n    ok\n    error\n    errorCode\n    announcement {\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "dbd5245647d014c0f7a28392cf01b22b";

export default node;
