import { createUserManager } from 'redux-oidc';

const userManagerConfig = (clientID, url) => ({
  client_id: clientID,
  redirect_uri: url + '/auth/dex/callback',
  response_type: 'code',
  scope: 'openid email profile pydio offline_access',
  authority: url + '/a/config/discovery',
  loadUserInfo: false,
});

const userManager = (clientID, url) => createUserManager(userManagerConfig(clientID, url));

export default userManager