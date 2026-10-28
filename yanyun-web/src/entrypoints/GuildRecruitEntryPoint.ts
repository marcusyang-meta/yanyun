// Guild recruit route entrypoint (Relay server-3D pattern, same shape
// as GuildAdminEntryPoint): preloads GuildRecruitRouteQuery, whose
// viewer.guildRecruit field carries the @match fragment over the
// GuildRecruitResult union — the matched module (recruit page /
// locked page) is chosen by the server response's structure.
import JSResource from '../lib/JSResource';
import GuildRecruitRouteQuery from '../guild/__generated__/GuildRecruitRouteQuery.graphql';

export interface GuildRecruitEntryPointParams {
  slug: string;
}

const GuildRecruitEntryPoint = {
  root: JSResource('GuildRecruitRouteRoot.react'),
  getPreloadProps: ({ slug }: GuildRecruitEntryPointParams) => ({
    queries: {
      recruitQuery: {
        parameters: GuildRecruitRouteQuery,
        variables: { slug },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
    extraProps: { slug },
  }),
};

export default GuildRecruitEntryPoint;
