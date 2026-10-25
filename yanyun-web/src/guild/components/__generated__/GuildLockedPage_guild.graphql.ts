/**
 * @generated SignedSource<<08244b715449a4252dd995b6c9087fcd>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildLockedPage_guild$data = {
  readonly lockedBackButtonLabel: string;
  readonly lockedBackLinkLabel: string;
  readonly lockedBody1: string;
  readonly lockedBody2: string;
  readonly lockedTitle: string;
  readonly slug: string;
  readonly " $fragmentType": "GuildLockedPage_guild";
};
export type GuildLockedPage_guild$key = {
  readonly " $data"?: GuildLockedPage_guild$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildLockedPage_guild">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildLockedPage_guild",
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
      "name": "lockedBackLinkLabel",
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
      "name": "lockedBody1",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lockedBody2",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lockedBackButtonLabel",
      "storageKey": null
    }
  ],
  "type": "GuildLocked",
  "abstractKey": null
};

(node as any).hash = "12d1fe0319c9210ed2d861e8a79437c8";

export default node;
