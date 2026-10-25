/**
 * @generated SignedSource<<fa3fb1f59326d8e5caa5583d124d8c83>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BannerBlock$data = {
  readonly text: string;
  readonly " $fragmentType": "fragments_BannerBlock";
};
export type fragments_BannerBlock$key = {
  readonly " $data"?: fragments_BannerBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BannerBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BannerBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    }
  ],
  "type": "BannerBlock",
  "abstractKey": null
};

(node as any).hash = "e0e55d2c6794a0e2f3f74d3285d92466";

export default node;
