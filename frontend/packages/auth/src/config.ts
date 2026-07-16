export type OidcAppConfig = {
  authority: string;
  clientId: string;
  redirectUri: string;
  silentRedirectUri: string;
  postLogoutRedirectUri: string;
  scope?: string;
};

export function createUserManagerSettings(config: OidcAppConfig) {
  return {
    authority: config.authority,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    silent_redirect_uri: config.silentRedirectUri,
    post_logout_redirect_uri: config.postLogoutRedirectUri,
    response_type: "code",
    scope: config.scope ?? "openid profile email offline_access",
    automaticSilentRenew: true,
    monitorSession: true,
  };
}
