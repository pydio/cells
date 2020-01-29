'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _PagesAcls = require('./PagesAcls');

var _PagesAcls2 = _interopRequireDefault(_PagesAcls);

var _RightsSelector = require('./RightsSelector');

var _RightsSelector2 = _interopRequireDefault(_RightsSelector);

var _RightsSummary = require('./RightsSummary');

var _RightsSummary2 = _interopRequireDefault(_RightsSummary);

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var _WorkspacesAcls = require('./WorkspacesAcls');

var _WorkspacesAcls2 = _interopRequireDefault(_WorkspacesAcls);

var ACL = { PagesAcls: _PagesAcls2['default'], RightsSelector: _RightsSelector2['default'], RightsSummary: _RightsSummary2['default'], WorkspacesAcls: _WorkspacesAcls2['default'], WorkspaceAcl: _WorkspaceAcl2['default'] };

exports['default'] = ACL;
module.exports = exports['default'];
