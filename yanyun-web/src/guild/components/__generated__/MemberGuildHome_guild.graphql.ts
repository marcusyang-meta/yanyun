/**
 * @generated SignedSource<<1a7f62fe9c86232dd8279f3d11e09468>>
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
  readonly homeAdminLabel: string | null | undefined;
  readonly homeTabAlliesLabel: string;
  readonly homeTabAnnouncementsLabel: string;
  readonly homeTabDexLabel: string;
  readonly homeTabMarketLabel: string;
  readonly homeTabScheduleLabel: string;
  readonly homeTabSectLabel: string;
  readonly homeTabTeamLabel: string;
  readonly name: string | null | undefined;
  readonly pageBackLabel: string;
  readonly pageFooterDisclaimerText: string | null | undefined;
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
      "name": "homeTabScheduleLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabMarketLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeTabAlliesLabel",
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

(node as any).hash = "2629ad64129b88fe7bca4b9e04254f66";

export default node;
