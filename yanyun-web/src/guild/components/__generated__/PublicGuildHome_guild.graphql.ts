/**
 * @generated SignedSource<<612e8aeff3f73f33a9943703f89c5825>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type PublicGuildHome_guild$data = {
  readonly avatarUrl: string | null | undefined;
  readonly detailBackToListLabel: string;
  readonly detailNotFoundText: string;
  readonly gameVersion: string;
  readonly homeReadOnlyBanner: string;
  readonly homeTabAnnouncementsLabel: string;
  readonly homeTabDexLabel: string;
  readonly homeTabSectLabel: string;
  readonly homeTabTeamLabel: string;
  readonly name: string | null | undefined;
  readonly pageBackLabel: string;
  readonly pageFooterDisclaimerText: string | null | undefined;
  readonly recruitEntryLabel: string;
  readonly slogan: string | null | undefined;
  readonly slug: string;
  readonly " $fragmentType": "PublicGuildHome_guild";
};
export type PublicGuildHome_guild$key = {
  readonly " $data"?: PublicGuildHome_guild$data;
  readonly " $fragmentSpreads": FragmentRefs<"PublicGuildHome_guild">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "PublicGuildHome_guild",
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
      "name": "pageBackLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pageFooterDisclaimerText",
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
      "name": "homeTabAnnouncementsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "recruitEntryLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeReadOnlyBanner",
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
  "type": "GuildReadOnly",
  "abstractKey": null
};

(node as any).hash = "c85f8d8abd76ee1e5e8f56a765852355";

export default node;
