/**
 * @generated SignedSource<<9cb6c9d72217b96e18bec24e83a518e9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SettingsPageUpdateMutation$variables = {
  locale?: string | null | undefined;
};
export type SettingsPageUpdateMutation$data = {
  readonly updateMyLocale: {
    readonly effectiveLocale: string;
    readonly error: string | null | undefined;
    readonly localePref: string | null | undefined;
    readonly ok: boolean;
  };
};
export type SettingsPageUpdateMutation = {
  response: SettingsPageUpdateMutation$data;
  variables: SettingsPageUpdateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "locale"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "locale",
        "variableName": "locale"
      }
    ],
    "concreteType": "UpdateLocalePayload",
    "kind": "LinkedField",
    "name": "updateMyLocale",
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
        "name": "localePref",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "effectiveLocale",
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
    "name": "SettingsPageUpdateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SettingsPageUpdateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "2b23437d21bbbada7c81ada1ef3d5368",
    "id": null,
    "metadata": {},
    "name": "SettingsPageUpdateMutation",
    "operationKind": "mutation",
    "text": "mutation SettingsPageUpdateMutation(\n  $locale: String\n) {\n  updateMyLocale(locale: $locale) {\n    ok\n    error\n    localePref\n    effectiveLocale\n  }\n}\n"
  }
};
})();

(node as any).hash = "31d53ea12149556981237dc40eb171f0";

export default node;
