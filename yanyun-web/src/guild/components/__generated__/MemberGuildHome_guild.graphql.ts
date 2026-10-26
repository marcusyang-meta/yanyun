/**
 * @generated SignedSource<<67deb47e5a14562692b05db5d02380e2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type MemberGuildHome_guild$data = {
  readonly avatarUrl: string | null | undefined;
  readonly detailBackToListLabel: string;
  readonly detailNotFoundText: string;
  readonly gameVersion: string;
  readonly homeAdminLabel: string;
  readonly homeBackToHubLabel: string;
  readonly homeTabDexLabel: string;
  readonly homeTabSectLabel: string;
  readonly homeTabTeamLabel: string;
  readonly name: string | null | undefined;
  readonly slogan: string | null | undefined;
  readonly slug: string;
  readonly viewerNick: string | null | undefined;
  readonly " $fragmentType": "MemberGuildHome_guild";
};
export type MemberGuildHome_guild$key = {
  readonly " $data"?: MemberGuildHome_guild$data;
  readonly " $fragmentSpreads": FragmentRefs<"MemberGuildHome_guild">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "MemberGuildHome_guild",
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
      "name": "name",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slogan",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "gameVersion",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "avatarUrl",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerNick",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeBackToHubLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabTeamLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabDexLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabSectLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeAdminLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "detailNotFoundText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "detailBackToListLabel",
      "storageKey": null
    }
  ],
  "type": "Guild",
  "abstractKey": null
};

(node as any).hash = "4457810355f6f4e0b9955aa88fc25e9e";

export default node;
