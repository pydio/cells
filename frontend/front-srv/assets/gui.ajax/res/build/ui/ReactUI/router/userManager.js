'use strict';

exports.__esModule = true;

var _reduxOidc = require('redux-oidc');

var userManagerConfig = function userManagerConfig(clientID, url) {
  return {
    client_id: clientID,
    redirect_uri: url + '/login/callback',
    response_type: 'code',
    scope: 'openid email groups profile pydio offline_access',
    authority: url + '/auth/dex',
    loadUserInfo: false
  };
};

var userManager = function userManager(clientID, url) {
  return _reduxOidc.createUserManager(userManagerConfig(clientID, url));
};

exports['default'] = userManager;
module.exports = exports['default'];
