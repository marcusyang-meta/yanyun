// Guild route entrypoint (Relay server-3D pattern): preloads GuildRouteQuery,
// whose viewer.guild field carries the @match fragment; a viewable guild
// matches the member-home module, and a null guild (missing or not
// viewable) is handled by GuildRouteRoot leaving the route — there is no
// client-side type dispatch anywhere.
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
