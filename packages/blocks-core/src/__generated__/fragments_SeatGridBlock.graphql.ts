/**
 * @generated SignedSource<<5f9fb5356910d4e25b02d327ac88eb3d>>
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
    readonly nickname: string | null | undefined;
    readonly occupied: boolean;
    readonly role: string | null | undefined;
    readonly weapon: string | null | undefined;
  }>;
  readonly " $fragmentType": "fragments_SeatGridBlock";
};
export type fragments_SeatGridBlock$key = {
  readonly " $data"?: fragments_SeatGridBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SeatGridBlock">;
};

const node: ReaderFragment = {
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
          "concreteType": null,
          "kind": "LinkedField",
          "name": "action",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "fragments_BlockAction"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SeatGridBlock",
  "abstractKey": null
};

(node as any).hash = "c866f27d55214d759795c6d0ec78ca94";

export default node;
