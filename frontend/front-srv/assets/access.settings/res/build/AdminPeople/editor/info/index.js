'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GroupInfo = require('./GroupInfo');

var _GroupInfo2 = _interopRequireDefault(_GroupInfo);

var _RoleInfo = require('./RoleInfo');

var _RoleInfo2 = _interopRequireDefault(_RoleInfo);

var _UserInfo = require('./UserInfo');

var _UserInfo2 = _interopRequireDefault(_UserInfo);

var Info = { GroupInfo: _GroupInfo2['default'], RoleInfo: _RoleInfo2['default'], UserInfo: _UserInfo2['default'] };

exports['default'] = Info;
module.exports = exports['default'];
