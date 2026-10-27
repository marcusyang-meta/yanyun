/**
 * @generated SignedSource<<2ffb42e977ac4e978d73cf60dbae1b59>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsDialogExportMutation$variables = Record<PropertyKey, never>;
export type SettingsDialogExportMutation$data = {
  readonly exportMyData: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly filename: string | null | undefined;
    readonly json: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsDialogExportMutation = {
  response: SettingsDialogExportMutation$data;
  variables: SettingsDialogExportMutation$variables;
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
    "name": "SettingsDialogExportMutation",
    "selections": (v0/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "SettingsDialogExportMutation",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "10948ca500137dee38194f2131b5936e",
    "id": null,
    "metadata": {},
    "name": "SettingsDialogExportMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsDialogExportMutation {\n  exportMyData {\n    ok\n    error\n    errorCode\n    json\n    filename\n  }\n}\n"
  }
};
})();

(node as any).hash = "71fea01c313d5892a48dfb5dca011262";

export default node;
