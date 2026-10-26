/**
 * @generated SignedSource<<0abd839c7a1673805d622a486ef0c2c1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type LegalKind = "PRIVACY" | "TERMS" | "%future added value";
export type LegalPageQuery$variables = {
  kind: LegalKind;
};
export type LegalPageQuery$data = {
  readonly legalPage: {
    readonly backLabel: string;
    readonly kind: LegalKind;
    readonly sections: ReadonlyArray<{
      readonly body: string;
      readonly heading: string;
    }>;
    readonly title: string;
    readonly updatedText: string;
  };
};
export type LegalPageQuery = {
  response: LegalPageQuery$data;
  variables: LegalPageQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "kind"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "kind",
        "variableName": "kind"
      }
    ],
    "concreteType": "LegalPage",
    "kind": "LinkedField",
    "name": "legalPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "kind",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "title",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "updatedText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "backLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "LegalSection",
        "kind": "LinkedField",
        "name": "sections",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "heading",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "body",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "LegalPageQuery",
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "LegalPageQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "0ba9db0c5d800e3644031fa077f82671",
    "id": null,
    "metadata": {},
    "name": "LegalPageQuery",
    "operationKind": "query",
    "text": "query LegalPageQuery(\n  $kind: LegalKind!\n) {\n  legalPage(kind: $kind) {\n    kind\n    title\n    updatedText\n    backLabel\n    sections {\n      heading\n      body\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "16fb989849340a79d98bdfdb4edb6eb6";

export default node;
