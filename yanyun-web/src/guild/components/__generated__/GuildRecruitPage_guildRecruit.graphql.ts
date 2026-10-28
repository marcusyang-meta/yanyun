/**
 * @generated SignedSource<<97e91d771cd3887e9e39a69689a468ed>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type MentorPairingStatus = "ACTIVE" | "ENDED" | "%future added value";
export type RecruitApplicationStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type GuildRecruitPage_guildRecruit$data = {
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
  readonly " $fragmentType": "GuildRecruitPage_guildRecruit";
};
export type GuildRecruitPage_guildRecruit$key = {
  readonly " $data"?: GuildRecruitPage_guildRecruit$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildRecruitPage_guildRecruit">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAtText",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildRecruitPage_guildRecruit",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slug",
      "storageKey": null
    },
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
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "backLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "RecruitApplication",
      "kind": "LinkedField",
      "name": "myApplication",
      "plural": false,
      "selections": [
        (v0/*:: as any*/),
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
        (v1/*:: as any*/),
        (v2/*:: as any*/),
        (v3/*:: as any*/),
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
        (v0/*:: as any*/),
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
        (v1/*:: as any*/),
        (v2/*:: as any*/),
        (v3/*:: as any*/),
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
};
})();

(node as any).hash = "292278c01f991a0a22475bf36a284b32";

export default node;
