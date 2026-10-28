/**
 * @generated SignedSource<<01856077dd4ecf064a6434d6b563792d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGenerateGuildAnnouncementTranslationsMutation$variables = {
  id: string;
  slug: string;
};
export type documentsGenerateGuildAnnouncementTranslationsMutation$data = {
  readonly generateGuildAnnouncementTranslations: {
    readonly announcement: {
      readonly id: string;
      readonly translationStatusText: string | null | undefined;
      readonly translations: ReadonlyArray<{
        readonly locale: string;
        readonly status: string;
      }> | null | undefined;
    } | null | undefined;
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsGenerateGuildAnnouncementTranslationsMutation = {
  response: documentsGenerateGuildAnnouncementTranslationsMutation$data;
  variables: documentsGenerateGuildAnnouncementTranslationsMutation$variables;
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
    "name": "generateGuildAnnouncementTranslations",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "translationStatusText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GuildAnnouncementTranslation",
            "kind": "LinkedField",
            "name": "translations",
            "plural": true,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "locale",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "status",
                "storageKey": null
              }
            ],
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
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGenerateGuildAnnouncementTranslationsMutation",
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
    "name": "documentsGenerateGuildAnnouncementTranslationsMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "280c5adba8d4490e116431721589f99e",
    "id": null,
    "metadata": {},
    "name": "documentsGenerateGuildAnnouncementTranslationsMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGenerateGuildAnnouncementTranslationsMutation(\n  $slug: String!\n  $id: ID!\n) {\n  generateGuildAnnouncementTranslations(slug: $slug, announcementId: $id) {\n    ok\n    error\n    errorCode\n    announcement {\n      id\n      translationStatusText\n      translations {\n        locale\n        status\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a14c075f82446636abc1de4050c64adc";

export default node;
