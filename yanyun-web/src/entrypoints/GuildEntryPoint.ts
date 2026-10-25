// Guild route entrypoint (Relay server-3D pattern): preloads GuildRouteQuery,
// whose viewer.guild field carries the @match fragment over the GuildResult
// union. The matched module (MemberGuildHome / PublicGuildHome /
// GuildLockedPage) is chosen by the response structure via MatchContainer in
// GuildRouteRoot — there is no client-side type dispatch anywhere.
import JSResource from '../lib/JSResource';
import GuildRouteQuery from '../guild/__generated__/GuildRouteQuery.graphql';

export interface GuildEntryPointParams {
  slug: string;
  carId?: string;
}

const GuildEntryPoint = {
  root: JSResource('GuildRouteRoot.react'),
  getPreloadProps: ({ slug, carId }: GuildEntryPointParams) => ({
    queries: {
      guildQuery: {
        parameters: GuildRouteQuery,
        variables: { slug },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
    extraProps: { slug, carId: carId ?? null },
  }),
};

export default GuildEntryPoint;
