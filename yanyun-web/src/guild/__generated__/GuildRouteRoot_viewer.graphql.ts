/**
 * @generated SignedSource<<3c55f5ab765f3f84fa3aa6ed951e1eb6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @dataDrivenDependency GuildRouteRoot_viewer.guild {"branches":{"Guild":{"component":"MemberGuildHome.react","fragment":"MemberGuildHome_guild$normalization.graphql"}},"plural":false}

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRouteRoot_viewer$data = {
  readonly guild: {
    readonly __fragmentPropName: string | null | undefined;
    readonly __module_component: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"MemberGuildHome_guild">;
  } | null | undefined;
  readonly " $fragmentType": "GuildRouteRoot_viewer";
};
export type GuildRouteRoot_viewer$key = {
  readonly " $data"?: GuildRouteRoot_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildRouteRoot_viewer">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "slug"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildRouteRoot_viewer",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "slug",
          "variableName": "slug"
        }
      ],
      "concreteType": "Guild",
      "kind": "LinkedField",
      "name": "guild",
      "plural": false,
      "selections": [
        {
          "args": null,
          "documentName": "GuildRouteRoot_viewer",
          "fragmentName": "MemberGuildHome_guild",
          "fragmentPropName": "guild",
          "kind": "ModuleImport"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "22ff10ef6e51889037ba64bbf7eb0c31";

export default node;
