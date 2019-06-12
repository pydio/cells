import { createUserManager } from 'redux-oidc';

const userManagerConfig = (clientID, url) => ({
  client_id: clientID,
  redirect_uri: url + '/login/callback',
  response_type: 'code',
  scope: 'openid email profile pydio offline_access',
  authority: url + '/auth/dex',
  loadUserInfo: false,
});

const userManager = (clientID, url) => createUserManager(userManagerConfig(clientID, url));

export default userManager