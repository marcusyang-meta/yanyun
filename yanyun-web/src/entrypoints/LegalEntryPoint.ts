// 法律页 entrypoint (Relay server-3D pattern): 与 AppEntryPoint 同构 —
// 根组件经 JSResource 懒加载, legalPage 查询在渲染前按 kind 预加载。
// kind 由路由决定 (/terms -> TERMS, /privacy -> PRIVACY), 经 props 传入。
import JSResource from '../lib/JSResource';
import LegalPageQuery from '../__generated__/LegalPageQuery.graphql';

const LegalEntryPoint = {
  root: JSResource('LegalPage.react'),
  getPreloadProps: (props: { kind: string }) => ({
    queries: {
      legalQuery: {
        parameters: LegalPageQuery,
        variables: { kind: props.kind },
        options: { fetchPolicy: 'store-or-network' },
      },
    },
  }),
};

export default LegalEntryPoint;
