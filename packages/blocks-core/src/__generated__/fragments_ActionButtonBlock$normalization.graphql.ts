/**
 * @generated SignedSource<<a0fa2e05c4281d28052900201cd96700>>
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
  "name": "fragments_ActionButtonBlock$normalization",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "style",
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
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v0/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "ready",
              "storageKey": null
            }
          ],
          "type": "SetReadyAction",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ]
};
})();

(node as any).hash = "ab787214f1d5351d95a561ff5a1df590";

export default node;
