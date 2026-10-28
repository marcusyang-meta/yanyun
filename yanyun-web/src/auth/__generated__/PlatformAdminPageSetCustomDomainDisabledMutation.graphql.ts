/**
 * @generated SignedSource<<ce78ece1bcd9606380e806bc23911131>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type PlatformAdminPageSetCustomDomainDisabledMutation$variables = {
  disabled: boolean;
  slug: string;
};
export type PlatformAdminPageSetCustomDomainDisabledMutation$data = {
  readonly platformAdminSetCustomDomainDisabled: {
    readonly error: string | null | undefined;
    readonly errorCode: string | null | undefined;
    readonly ok: boolean;
  };
};
export type PlatformAdminPageSetCustomDomainDisabledMutation = {
  response: PlatformAdminPageSetCustomDomainDisabledMutation$data;
  variables: PlatformAdminPageSetCustomDomainDisabledMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "disabled"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "disabled",
        "variableName": "disabled"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "PlatformAdminBillingPayload",
    "kind": "LinkedField",
    "name": "platformAdminSetCustomDomainDisabled",
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "PlatformAdminPageSetCustomDomainDisabledMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "PlatformAdminPageSetCustomDomainDisabledMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "6ecd2de88b263cb3a630accd9d092c97",
    "id": null,
    "metadata": {},
    "name": "PlatformAdminPageSetCustomDomainDisabledMutation",
    "operationKind": "mutation",
    "text": "mutation PlatformAdminPageSetCustomDomainDisabledMutation(\n  $slug: String!\n  $disabled: Boolean!\n) {\n  platformAdminSetCustomDomainDisabled(slug: $slug, disabled: $disabled) {\n    ok\n    error\n    errorCode\n  }\n}\n"
  }
};
})();

(node as any).hash = "b3cfce2fbe48bac61e9421c00d181eb5";

export default node;
