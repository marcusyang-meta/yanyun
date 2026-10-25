/**
 * @generated SignedSource<<f708423e7a9c88eed6d683a5c4cfdff3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_SectionHeaderBlock$data = {
  readonly text: string;
  readonly " $fragmentType": "fragments_SectionHeaderBlock";
};
export type fragments_SectionHeaderBlock$key = {
  readonly " $data"?: fragments_SectionHeaderBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SectionHeaderBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_SectionHeaderBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "text",
      "storageKey": null
    }
  ],
  "type": "SectionHeaderBlock",
  "abstractKey": null
};

(node as any).hash = "cd139d299f6ed30b134206c84371a230";

export default node;
