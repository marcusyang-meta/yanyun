// The logged-in user (Discord profile, display only; permission conclusions
// are not made on the frontend — the backend expresses them via response types)
export interface ViewerUser {
  discordId: string;
  name: string;
  avatar?: string | null;
}
