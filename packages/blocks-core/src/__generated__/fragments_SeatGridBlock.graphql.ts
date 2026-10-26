/**
 * @generated SignedSource<<2e7b2e4ba8762380924e134d3d471c44>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_SeatGridBlock$data = {
  readonly seats: ReadonlyArray<{
    readonly action: {
      readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockAction">;
    } | null | undefined;
    readonly healer: boolean;
    readonly index: number;
    readonly isLeader: boolean;
    readonly nickname: string | null | undefined;
    readonly occupied: boolean;
    readonly ready: boolean;
    readonly readyAction: {
      readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockAction">;
    } | null | undefined;
    readonly role: string | null | undefined;
    readonly weapon: string | null | undefined;
  }>;
  readonly " $fragmentType": "fragments_SeatGridBlock";
};
export type fragments_SeatGridBlock$key = {
  readonly " $data"?: fragments_SeatGridBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SeatGridBlock">;
};

const node: ReaderFragment = (function(){
var v0 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "fragments_BlockAction"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_SeatGridBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SeatEntry",
      "kind": "LinkedField",
      "name": "seats",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "index",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "occupied",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "nickname",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "weapon",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "role",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "healer",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "isLeader",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "ready",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "readyAction",
          "plural": false,
          "selections": (v0/*:: as any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "action",
          "plural": false,
          "selections": (v0/*:: as any*/),
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SeatGridBlock",
  "abstractKey": null
};
})();

(node as any).hash = "6eb94950cd4bb51c09dd0410dabd9ccd";

export default node;
