/**
 * @generated SignedSource<<832fedf2508d30e5c3cb1bb61325a92b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_ChipRowBlock$data = {
  readonly chips: ReadonlyArray<string>;
  readonly " $fragmentType": "fragments_ChipRowBlock";
};
export type fragments_ChipRowBlock$key = {
  readonly " $data"?: fragments_ChipRowBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_ChipRowBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_ChipRowBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "chips",
      "storageKey": null
    }
  ],
  "type": "ChipRowBlock",
  "abstractKey": null
};

(node as any).hash = "ca737116660f950c898cff3e3979c2e2";

export default node;
