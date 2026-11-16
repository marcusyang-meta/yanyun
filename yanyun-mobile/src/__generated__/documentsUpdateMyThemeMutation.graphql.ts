/**
 * @generated SignedSource<<79225dac1ef4422ab488e324b483dd0d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsUpdateMyThemeMutation$variables = {
  theme: string;
};
export type documentsUpdateMyThemeMutation$data = {
  readonly updateMyTheme: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
    readonly themePref: string;
  };
};
export type documentsUpdateMyThemeMutation = {
  response: documentsUpdateMyThemeMutation$data;
  variables: documentsUpdateMyThemeMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "theme"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "theme",
        "variableName": "theme"
      }
    ],
    "concreteType": "UpdateThemePayload",
    "kind": "LinkedField",
    "name": "updateMyTheme",
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
        "name": "themePref",
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
    "name": "documentsUpdateMyThemeMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsUpdateMyThemeMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "5356dfa08d7584badd1b5ce31746079f",
    "id": null,
    "metadata": {},
    "name": "documentsUpdateMyThemeMutation",
    "operationKind": "mutation",
    "text": "mutation documentsUpdateMyThemeMutation(\n  $theme: String!\n) {\n  updateMyTheme(theme: $theme) {\n    ok\n    error\n    errorCode\n    themePref\n  }\n}\n"
  }
};
})();

(node as any).hash = "ca433e109e3871e8fe7f0cbfbad48dc6";

export default node;
