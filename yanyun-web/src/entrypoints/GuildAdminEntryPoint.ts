// Guild admin route entrypoint (Relay server-3D pattern, same shape
// as GuildEntryPoint): preloads GuildAdminRouteQuery, whose
// viewer.guildAdmin field carries the @match fragment over the
// GuildAdminResult union — the matched module (admin page / locked
// page) is chosen by the server response's structure.
import JSResource from '../lib/JSResource';
import GuildAdminRouteQuery from '../guild/__generated__/GuildAdminRouteQuery.graphql';

export interface GuildAdminEntryPointParams {
  slug: string;
}

const GuildAdminEntryPoint = {
  root: JSResource('GuildAdminRouteRoot.react'),
  getPreloadProps: ({ slug }: GuildAdminEntryPointParams) => ({
    queries: {
      adminQuery: {
        parameters: GuildAdminRouteQuery,
        variables: { slug },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
    extraProps: { slug },
  }),
};

export default GuildAdminEntryPoint;
