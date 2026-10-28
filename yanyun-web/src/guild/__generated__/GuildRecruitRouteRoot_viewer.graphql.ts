/**
 * @generated SignedSource<<ca0ac03312a94fb00ef69ebfe61a0519>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @dataDrivenDependency GuildRecruitRouteRoot_viewer.guildRecruit {"branches":{"GuildRecruitLocked":{"component":"GuildRecruitLockedPage.react","fragment":"GuildRecruitLockedPage_guildRecruit$normalization.graphql"},"GuildRecruitPage":{"component":"GuildRecruitPage.react","fragment":"GuildRecruitPage_guildRecruit$normalization.graphql"}},"plural":false}

import { ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildRecruitRouteRoot_viewer$data = {
  readonly guildRecruit: {
    readonly __fragmentPropName?: string | null | undefined;
    readonly __module_component?: string | null | undefined;
    readonly " $fragmentSpreads": FragmentRefs<"GuildRecruitLockedPage_guildRecruit" | "GuildRecruitPage_guildRecruit">;
  };
  readonly " $fragmentType": "GuildRecruitRouteRoot_viewer";
};
export type GuildRecruitRouteRoot_viewer$key = {
  readonly " $data"?: GuildRecruitRouteRoot_viewer$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildRecruitRouteRoot_viewer">;
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
  "name": "GuildRecruitRouteRoot_viewer",
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
      "name": "guildRecruit",
      "plural": false,
      "selections": [
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildRecruitRouteRoot_viewer",
              "fragmentName": "GuildRecruitPage_guildRecruit",
              "fragmentPropName": "guildRecruit",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildRecruitPage",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "args": null,
              "documentName": "GuildRecruitRouteRoot_viewer",
              "fragmentName": "GuildRecruitLockedPage_guildRecruit",
              "fragmentPropName": "guildRecruit",
              "kind": "ModuleImport"
            }
          ],
          "type": "GuildRecruitLocked",
          "abstractKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

(node as any).hash = "0ea4fc9b3e0f3b4b3ac49df7e0dfdcc5";

export default node;
