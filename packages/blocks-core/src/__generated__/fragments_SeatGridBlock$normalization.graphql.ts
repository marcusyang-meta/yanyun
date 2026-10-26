/**
 * @generated SignedSource<<5113012f3eb2083a4c1c4336c78ba24e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { NormalizationSplitOperation } from 'relay-runtime';


const node: NormalizationSplitOperation = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmTitle",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmMessage",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "okLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cancelLabel",
  "storageKey": null
},
v5 = [
  (v0/*:: as any*/),
  (v1/*:: as any*/),
  (v2/*:: as any*/),
  (v3/*:: as any*/),
  (v4/*:: as any*/)
],
v6 = [
  (v0/*:: as any*/)
];
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "fragments_SeatGridBlock$normalization",
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
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "__typename",
              "storageKey": null
            },
            {
              "kind": "TypeDiscriminator",
              "abstractKey": "__isAction"
            },
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "slug",
                  "storageKey": null
                },
                (v0/*:: as any*/),
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
                  "name": "readOnly",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "nick",
                  "storageKey": null
                }
              ],
              "type": "NavigateAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v0/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "seatIndex",
                  "storageKey": null
                }
              ],
              "type": "JoinAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": [
                (v0/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "uid",
                  "storageKey": null
                },
                (v1/*:: as any*/),
                (v2/*:: as any*/),
                (v3/*:: as any*/),
                (v4/*:: as any*/)
              ],
              "type": "LeaveAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v5/*:: as any*/),
              "type": "DisbandAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v6/*:: as any*/),
              "type": "EditAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v5/*:: as any*/),
              "type": "CompleteAction",
              "abstractKey": null
            },
            {
              "kind": "InlineFragment",
              "selections": (v6/*:: as any*/),
              "type": "UncompleteAction",
              "abstractKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
};
})();

(node as any).hash = "c866f27d55214d759795c6d0ec78ca94";

export default node;
