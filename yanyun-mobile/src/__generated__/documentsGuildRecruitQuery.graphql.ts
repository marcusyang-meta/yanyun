/**
 * @generated SignedSource<<16c6ec28d7558f6e81767f1e857b5b5d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type MentorPairingStatus = "ACTIVE" | "ENDED" | "%future added value";
export type RecruitApplicationStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type documentsGuildRecruitQuery$variables = {
  slug: string;
};
export type documentsGuildRecruitQuery$data = {
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guildRecruit: {
      readonly __typename: "GuildRecruitLocked";
      readonly backLabel: string;
      readonly lockedBody: string;
      readonly lockedTitle: string;
      readonly slug: string;
    } | {
      readonly __typename: "GuildRecruitPage";
      readonly applySectionTitle: string;
      readonly approvedNextStepText: string;
      readonly backLabel: string;
      readonly checklist: {
        readonly items: ReadonlyArray<{
          readonly done: boolean;
          readonly hint: string;
          readonly key: string;
          readonly label: string;
        }>;
        readonly progressText: string;
      } | null | undefined;
      readonly checklistTitle: string;
      readonly guildName: string;
      readonly messageLabel: string;
      readonly messagePlaceholder: string;
      readonly myApplication: {
        readonly applicantName: string;
        readonly createdAtText: string;
        readonly id: string;
        readonly message: string;
        readonly reviewedAtText: string | null | undefined;
        readonly reviewedByName: string | null | undefined;
        readonly status: RecruitApplicationStatus;
        readonly statusLabel: string;
      } | null | undefined;
      readonly myApplicationTitle: string;
      readonly myPairings: ReadonlyArray<{
        readonly createdAtText: string;
        readonly endedAtText: string | null | undefined;
        readonly id: string;
        readonly menteeName: string;
        readonly mentorName: string;
        readonly status: MentorPairingStatus;
        readonly statusLabel: string;
      }>;
      readonly myPairingsTitle: string;
      readonly pairingMenteeRoleLabel: string;
      readonly pairingMentorRoleLabel: string;
      readonly pendingHint: string;
      readonly recruitBody: string;
      readonly recruitTitle: string;
      readonly rejectedHint: string;
      readonly slug: string;
      readonly submitLabel: string;
      readonly submittingLabel: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type documentsGuildRecruitQuery = {
  response: documentsGuildRecruitQuery$data;
  variables: documentsGuildRecruitQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "backLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAtText",
  "storageKey": null
},
v7 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "guildRecruit",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lockedTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "lockedBody",
                "storageKey": null
              },
              (v2/*:: as any*/)
            ],
            "type": "GuildRecruitLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "guildName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recruitTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "recruitBody",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "applySectionTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "messageLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "messagePlaceholder",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "submitLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "submittingLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "myApplicationTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "pendingHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "approvedNextStepText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "rejectedHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "checklistTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "myPairingsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "pairingMentorRoleLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "pairingMenteeRoleLabel",
                "storageKey": null
              },
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "RecruitApplication",
                "kind": "LinkedField",
                "name": "myApplication",
                "plural": false,
                "selections": [
                  (v3/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "applicantName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "message",
                    "storageKey": null
                  },
                  (v4/*:: as any*/),
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reviewedByName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reviewedAtText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "NewcomerChecklist",
                "kind": "LinkedField",
                "name": "checklist",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "NewcomerChecklistItem",
                    "kind": "LinkedField",
                    "name": "items",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "key",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "label",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hint",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "done",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MentorPairing",
                "kind": "LinkedField",
                "name": "myPairings",
                "plural": true,
                "selections": [
                  (v3/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mentorName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "menteeName",
                    "storageKey": null
                  },
                  (v4/*:: as any*/),
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endedAtText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "GuildRecruitPage",
            "abstractKey": null
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGuildRecruitQuery",
    "selections": (v7/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGuildRecruitQuery",
    "selections": (v7/*:: as any*/)
  },
  "params": {
    "cacheID": "4cc23c11fec19b24fcb29794dc931e9d",
    "id": null,
    "metadata": {},
    "name": "documentsGuildRecruitQuery",
    "operationKind": "query",
    "text": "query documentsGuildRecruitQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    guildRecruit(slug: $slug) {\n      __typename\n      ... on GuildRecruitLocked {\n        slug\n        lockedTitle\n        lockedBody\n        backLabel\n      }\n      ... on GuildRecruitPage {\n        slug\n        guildName\n        recruitTitle\n        recruitBody\n        applySectionTitle\n        messageLabel\n        messagePlaceholder\n        submitLabel\n        submittingLabel\n        myApplicationTitle\n        pendingHint\n        approvedNextStepText\n        rejectedHint\n        checklistTitle\n        myPairingsTitle\n        pairingMentorRoleLabel\n        pairingMenteeRoleLabel\n        backLabel\n        myApplication {\n          id\n          applicantName\n          message\n          status\n          statusLabel\n          createdAtText\n          reviewedByName\n          reviewedAtText\n        }\n        checklist {\n          progressText\n          items {\n            key\n            label\n            hint\n            done\n          }\n        }\n        myPairings {\n          id\n          mentorName\n          menteeName\n          status\n          statusLabel\n          createdAtText\n          endedAtText\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "ef2f77d869af66b222888f9f3d7165e2";

export default node;
