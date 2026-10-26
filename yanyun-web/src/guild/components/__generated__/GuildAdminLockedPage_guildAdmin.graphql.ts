/**
 * @generated SignedSource<<3fa7b48c85dd12c489585e58cbb6a0cc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildAdminLockedPage_guildAdmin$data = {
  readonly adminBackLinkLabel: string;
  readonly adminLockedBody: string;
  readonly adminLockedTitle: string;
  readonly slug: string;
  readonly " $fragmentType": "GuildAdminLockedPage_guildAdmin";
};
export type GuildAdminLockedPage_guildAdmin$key = {
  readonly " $data"?: GuildAdminLockedPage_guildAdmin$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildAdminLockedPage_guildAdmin">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildAdminLockedPage_guildAdmin",
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
      "name": "adminLockedTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminLockedBody",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminBackLinkLabel",
      "storageKey": null
    }
  ],
  "type": "GuildAdminLocked",
  "abstractKey": null
};

(node as any).hash = "16dc488c9158610e691971186d147e49";

export default node;
