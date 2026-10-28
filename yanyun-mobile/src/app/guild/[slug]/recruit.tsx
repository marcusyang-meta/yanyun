import { Redirect } from 'expo-router';

// The recruit page was dissolved into the app home (GuildsScreen's
// recruit section carries applications, the newcomer checklist and
// mentor pairings now); legacy deep links land on the home screen —
// same disposition as Web's /:slug/recruit -> / redirect.
export default function GuildRecruitRedirect() {
  return <Redirect href="/" />;
}
