/**
 * @generated SignedSource<<c9e6e8044c7576ddc45df1968446bc1d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsExportMyDataMutation$variables = Record<PropertyKey, never>;
export type documentsExportMyDataMutation$data = {
  readonly exportMyData: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly filename: string | null | undefined;
    readonly json: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsExportMyDataMutation = {
  response: documentsExportMyDataMutation$data;
  variables: documentsExportMyDataMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ExportMyDataPayload",
    "kind": "LinkedField",
    "name": "exportMyData",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "errorCode",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "json",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "filename",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsExportMyDataMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsExportMyDataMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "e958995ce0cf21afa4978f46c095b13e",
    "id": null,
    "metadata": {},
    "name": "documentsExportMyDataMutation",
    "operationKind": "mutation",
    "text": "mutation documentsExportMyDataMutation {\n  exportMyData {\n    ok\n    error\n    errorCode\n    json\n    filename\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c9c65351123cbb434d7555f3feb571c";

export default node;
