/**
 * @generated SignedSource<<fb2ed106bd16eeba04d33795057a4043>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_SpacerBlock$data = {
  readonly size: number;
  readonly " $fragmentType": "fragments_SpacerBlock";
};
export type fragments_SpacerBlock$key = {
  readonly " $data"?: fragments_SpacerBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_SpacerBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_SpacerBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "size",
      "storageKey": null
    }
  ],
  "type": "SpacerBlock",
  "abstractKey": null
};

(node as any).hash = "1d2d66bd318fd088f38746c05ecd622c";

export default node;
