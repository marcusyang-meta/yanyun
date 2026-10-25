/**
 * @generated SignedSource<<300f86a90fe0bc19ddbc9c8ab6bd2baa>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @dataDrivenDependency GuildRouteRoot_viewer.guild {"branches":{"Guild":{"component":"MemberGuildHome.react","fragment":"MemberGuildHome_guild$normalization.graphql"},"GuildLocked":{"component":"GuildLockedPage.react","fragment":"GuildLockedPage_guild$normalization.graphql"},"GuildReadOnly":{"component":"PublicGuildHome.react","fragment":"PublicGuildHome_guild$normalization.graphql"}},"plural":false}

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRouteRoot_viewer$data = {
  readonly guild: {
    readonly __fragmentPropName?: string | null | undefined;
    readonly __module_component?: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"GuildLockedPage_guild" | "MemberGuildHome_guild" | "PublicGuildHome_guild">;
  };
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "guild",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildRouteRoot_viewer",
              "fragmentName": "MemberGuildHome_guild",
              "fragmentPropName": "guild",
              "kind": "ModuleImport"
            }
          ],
          "type": "Guild",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildRouteRoot_viewer",
              "fragmentName": "PublicGuildHome_guild",
              "fragmentPropName": "guild",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildReadOnly",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildRouteRoot_viewer",
              "fragmentName": "GuildLockedPage_guild",
              "fragmentPropName": "guild",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildLocked",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "d9ca33c96d2a9d52a717422ce6eb5eee";

export default node;
