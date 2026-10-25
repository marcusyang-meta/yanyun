/**
 * @generated SignedSource<<86488bd686da6eae20565c40615cd428>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type fragments_GroupingCardBlock$data = {
  readonly action: {
    readonly " $fragmentSpreads": FragmentRefs<"fragments_BlockAction">;
  } | null | undefined;
  readonly badgeText: string;
  readonly cardTitle: string;
  readonly dungeonName: string | null | undefined;
  readonly groupingId: string;
  readonly peopleText: string;
  readonly statusText: string;
  readonly timeText: string;
  readonly " $fragmentType": "fragments_GroupingCardBlock";
};
export type fragments_GroupingCardBlock$key = {
  readonly " $data"?: fragments_GroupingCardBlock$data;
  readonly " $fragmentSpreads": FragmentRefs<"fragments_GroupingCardBlock">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fragments_GroupingCardBlock",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "groupingId",
      "storageKey": null
    },
    {
      "alias": "cardTitle",
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "badgeText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "timeText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dungeonName",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "peopleText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "statusText",
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
  "type": "GroupingCardBlock",
  "abstractKey": null
};

(node as any).hash = "9d4e2dc8cc61d3c9599a1434444890cc";

export default node;
