import { useState } from 'react';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, SaveButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// School guides panel of the guild admin page: per-sect BiS builds
// and rotation documents — the same dex data the public sect pages
// read. BiS and rotation are JSON documents edited as text (the
// retired gadmin upsert semantics, unchanged).
const UpdateGuideMutation = graphql`
  mutation GuildAdminGuidesUpdateMutation($slug: String!, $input: UpdateSchoolGuideInput!) {
    updateSchoolGuide(slug: $slug, input: $input) { ok error }
  }
`;

const GuidesSectOptionsQuery = graphql`
  query GuildAdminGuidesSectOptionsQuery {
    dexPage {
      sectOptions { slug name }
    }
  }
`;

type Guides = {
  schools: {
    school: string;
    builds: { build: string; attr: string; rate: string; bisJson: string }[];
    rotationJson: string;
  }[];
};

function BuildEditor({ slug, text, commonText, school, build, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; school: string;
  build: { build: string; attr: string; rate: string; bisJson: string };
  refresh: () => void;
}) {
  const [commit] = useMutation(UpdateGuideMutation);
  const run = useAdminMutation(commit, 'updateSchoolGuide', refresh, commonText.unknownError);
  const [name, setName] = useState(build.build);
  const [attr, setAttr] = useState(build.attr || '');
  const [rate, setRate] = useState(build.rate || '');
  const [bisJson, setBisJson] = useState(build.bisJson || '');
  return (
    <div style={{ borderTop: '1px solid rgba(201,163,92,.12)', paddingTop: 12, marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Field label={text.adminGuideBuildLabel}>
          <input style={adminInputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={text.adminGuideAttrLabel}>
          <input style={adminInputStyle} value={attr} onChange={(e) => setAttr(e.target.value)} />
        </Field>
        <Field label={text.adminGuideRateLabel}>
          <input style={adminInputStyle} value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
      </div>
      <Field label={text.adminGuideBisLabel}>
        <textarea style={{ ...adminInputStyle, minHeight: 72, fontFamily: 'monospace', fontSize: 12 }} value={bisJson} onChange={(e) => setBisJson(e.target.value)} />
      </Field>
      <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
        onSave={() => run({ slug, input: { school, build: name, attr, rate, bisJson } })} />
    </div>
  );
}

function SchoolBlock({ slug, text, commonText, guide, refresh }: {
  slug: string; text: AdminText; commonText: CommonText;
  guide: Guides['schools'][number];
  refresh: () => void;
}) {
  const [commit] = useMutation(UpdateGuideMutation);
  const run = useAdminMutation(commit, 'updateSchoolGuide', refresh, commonText.unknownError);
  const [rotationJson, setRotationJson] = useState(guide.rotationJson || '');
  const [newBuild, setNewBuild] = useState('');
  return (
    <section style={adminSectionStyle}>
      <h3 style={adminSectionTitleStyle}>{guide.school}</h3>
      {guide.builds.map((b) => (
        <BuildEditor key={b.build} slug={slug} text={text} commonText={commonText} school={guide.school} build={b} refresh={refresh} />
      ))}
      <div style={{ borderTop: '1px solid rgba(201,163,92,.12)', paddingTop: 12, marginTop: 12 }}>
        <Field label={text.adminGuideRotationLabel}>
          <textarea style={{ ...adminInputStyle, minHeight: 72, fontFamily: 'monospace', fontSize: 12 }} value={rotationJson} onChange={(e) => setRotationJson(e.target.value)} />
        </Field>
        <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
          onSave={() => run({ slug, input: { school: guide.school, rotationJson } })} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'end' }}>
        <div style={{ flex: 1 }}>
          <Field label={text.adminGuideBuildLabel}>
            <input style={adminInputStyle} value={newBuild} onChange={(e) => setNewBuild(e.target.value)} />
          </Field>
        </div>
        <div style={{ marginBottom: 14 }}>
          <SaveButton label={text.adminAddLabel} savedLabel={text.adminSavedText}
            onSave={() => { run({ slug, input: { school: guide.school, build: newBuild, attr: '', rate: '', bisJson: '' } }); setNewBuild(''); }} />
        </div>
      </div>
    </section>
  );
}

export default function GuildAdminGuides({ slug, text, commonText, guides, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; guides: Guides; refresh: () => void;
}) {
  const [commit] = useMutation(UpdateGuideMutation);
  const run = useAdminMutation(commit, 'updateSchoolGuide', refresh, commonText.unknownError);
  // Sect choices come from the backend vocabulary (canonical names —
  // the chosen name keys the stored guide).
  const sectData = useLazyLoadQuery(
    GuidesSectOptionsQuery, {}, { fetchPolicy: 'store-or-network' },
  );
  const sectNames: string[] = (((sectData as any)?.dexPage?.sectOptions ?? []) as Array<{ name: string }>).map((o) => o.name);
  const [schoolPick, setSchool] = useState('');
  const school = schoolPick || sectNames[0] || '';
  const [build, setBuild] = useState('');
  const known = new Set(guides.schools.map((g) => g.school));
  return (
    <div>
      <h2 style={adminSectionTitleStyle}>{text.adminGuidesTitle}</h2>
      <p style={{ color: theme.muted, fontSize: 12, marginTop: -6 }}>{text.adminGuidesHint}</p>
      {guides.schools.map((g) => (
        <SchoolBlock key={g.school} slug={slug} text={text} commonText={commonText} guide={g} refresh={refresh} />
      ))}
      <section style={adminSectionStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label={text.adminGuideSchoolLabel}>
            <select style={adminInputStyle} value={school} onChange={(e) => setSchool(e.target.value)}>
              {sectNames.filter((s) => !known.has(s)).concat(sectNames.filter((s) => known.has(s))).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label={text.adminGuideBuildLabel}>
            <input style={adminInputStyle} value={build} onChange={(e) => setBuild(e.target.value)} />
          </Field>
        </div>
        <SaveButton label={text.adminAddLabel} savedLabel={text.adminSavedText}
          onSave={() => { run({ slug, input: { school, build, attr: '', rate: '', bisJson: '', rotationJson: '' } }); setBuild(''); }} />
      </section>
    </div>
  );
}
