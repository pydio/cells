/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _cellsSdk = require('cells-sdk');

var _WorkspaceAcl = require('./WorkspaceAcl');

var _WorkspaceAcl2 = _interopRequireDefault(_WorkspaceAcl);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var WorkspacesAcls = (function (_React$Component) {
    _inherits(WorkspacesAcls, _React$Component);

    function WorkspacesAcls(props) {
        var _this = this;

        _classCallCheck(this, WorkspacesAcls);

        _get(Object.getPrototypeOf(WorkspacesAcls.prototype), 'constructor', this).call(this, props);
        this.state = { loading: true, workspaces: [] };
        var api = new _cellsSdk.WorkspaceServiceApi(_pydioHttpApi2['default'].getRestClient());
        var request = new _cellsSdk.RestSearchWorkspaceRequest();
        request.Queries = [_cellsSdk.IdmWorkspaceSingleQuery.constructFromObject({
            scope: 'ADMIN'
        })];
        api.searchWorkspaces(request).then(function (collection) {
            var workspaces = collection.Workspaces || [];
            workspaces.sort(_pydioUtilLang2['default'].arraySorter('Label', false, true));
            _this.setState({ workspaces: workspaces, loading: false });
        })['catch'](function (e) {
            _this.setState({ loading: false });
        });
    }

    _createClass(WorkspacesAcls, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var role = _props.role;
            var advancedAcl = _props.advancedAcl;
            var _state = this.state;
            var workspaces = _state.workspaces;
            var loading = _state.loading;

            if (!role) {
                return _react2['default'].createElement('div', null);
            }
            var columns = [{
                name: 'acl',
                label: '',
                style: { paddingLeft: 0, paddingRight: 0 },
                renderCell: function renderCell(ws) {
                    return _react2['default'].createElement(_WorkspaceAcl2['default'], {
                        workspace: ws,
                        role: role,
                        advancedAcl: advancedAcl
                    });
                }
            }];

            return _react2['default'].createElement(
                'div',
                { className: "material-list" },
                _react2['default'].createElement(MaterialTable, {
                    data: workspaces,
                    columns: columns,
                    hideHeaders: true,
                    paginate: [10, 25, 50, 100],
                    defaultPageSize: 25,
                    showCheckboxes: false,
                    emptyStateString: loading ? _pydio2['default'].getInstance().MessageHash['ajxp_admin.loading'] : ''
                })
            );
        }
    }]);

    return WorkspacesAcls;
})(_react2['default'].Component);

exports['default'] = WorkspacesAcls;
module.exports = exports['default'];
