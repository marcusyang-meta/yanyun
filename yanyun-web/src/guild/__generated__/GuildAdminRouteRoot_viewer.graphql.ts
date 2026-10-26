/**
 * @generated SignedSource<<96cb35b6fa9a08eddbdf54035bef8113>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @dataDrivenDependency GuildAdminRouteRoot_viewer.guildAdmin {"branches":{"GuildAdmin":{"component":"GuildAdminPage.react","fragment":"GuildAdminPage_guildAdmin$normalization.graphql"},"GuildAdminLocked":{"component":"GuildAdminLockedPage.react","fragment":"GuildAdminLockedPage_guildAdmin$normalization.graphql"}},"plural":false}

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildAdminRouteRoot_viewer$data = {
  readonly guildAdmin: {
    readonly __fragmentPropName?: string | null | undefined;
    readonly __module_component?: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"GuildAdminLockedPage_guildAdmin" | "GuildAdminPage_guildAdmin">;
  };
  readonly " $fragmentType": "GuildAdminRouteRoot_viewer";
};
export type GuildAdminRouteRoot_viewer$key = {
  readonly " $data"?: GuildAdminRouteRoot_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildAdminRouteRoot_viewer">;
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
  "name": "GuildAdminRouteRoot_viewer",
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
      "name": "guildAdmin",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildAdminRouteRoot_viewer",
              "fragmentName": "GuildAdminPage_guildAdmin",
              "fragmentPropName": "guildAdmin",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildAdmin",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildAdminRouteRoot_viewer",
              "fragmentName": "GuildAdminLockedPage_guildAdmin",
              "fragmentPropName": "guildAdmin",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildAdminLocked",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "b7bbaee74e1fe141f11a35dcbb7bb351";

export default node;
