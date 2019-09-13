'use strict';

exports.__esModule = true;

var _reduxOidc = require('redux-oidc');

var userManagerConfig = {
  client_id: 'cells-front',
  client_secret: 'RVL85CavFPDWkmINqGSwbMTM',
  redirect_uri: 'http://localhost:3000/callback',
  response_type: 'code',
  scope: 'openid email profile pydio offline_access',
  authority: 'http://192.168.1.92:8080/auth/dex',
  loadUserInfo: false
};

var userManager = _reduxOidc.createUserManager(userManagerConfig);

exports['default'] = userManager;
module.exports = exports['default'];
