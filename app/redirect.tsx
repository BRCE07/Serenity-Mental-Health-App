import { Redirect } from 'expo-router';

// Handles the Strava OAuth return link (lumen://redirect) so the router doesn't show "unmatched route".
export default function OAuthRedirect() {
  return <Redirect href="/" />;
}
