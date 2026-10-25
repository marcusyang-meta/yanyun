/**
 * @generated SignedSource<<bce7e269d6711df628c2ef82ff9084d6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_BlockKind$data = {
  readonly __typename: string;
  readonly " $fragmentType": "fragments_BlockKind";
};
export type fragments_BlockKind$key = {
  readonly " $data"?: fragments_BlockKind$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockKind">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_BlockKind",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    }
  ],
  "type": "Block",
  "abstractKey": "__isBlock"
};

(node as any).hash = "608fa3405076707506a2fd272f3ebaab";

export default node;
