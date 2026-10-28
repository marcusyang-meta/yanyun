/**
 * @generated SignedSource<<5b617ef5c4594f5594d78a762c8565bc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRecruitLockedPage_guildRecruit$data = {
  readonly backLabel: string;
  readonly lockedBody: string;
  readonly lockedTitle: string;
  readonly slug: string;
  readonly " $fragmentType": "GuildRecruitLockedPage_guildRecruit";
};
export type GuildRecruitLockedPage_guildRecruit$key = {
  readonly " $data"?: GuildRecruitLockedPage_guildRecruit$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildRecruitLockedPage_guildRecruit">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildRecruitLockedPage_guildRecruit",
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
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "backLabel",
      "storageKey": null
    }
  ],
  "type": "GuildRecruitLocked",
  "abstractKey": null
};

(node as any).hash = "63f959e768ac46f19238bc35b908e9e4";

export default node;
