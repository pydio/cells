'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _WorkspaceEntryMaterial = require('./WorkspaceEntryMaterial');

var _WorkspaceEntryMaterial2 = _interopRequireDefault(_WorkspaceEntryMaterial);

/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');
var Repository = require('pydio/model/repository');

var _require = require('material-ui');

var List = _require.List;
var Subheader = _require.Subheader;
var Divider = _require.Divider;

var WorkspacesListMaterial = (function (_React$Component) {
    _inherits(WorkspacesListMaterial, _React$Component);

    function WorkspacesListMaterial() {
        _classCallCheck(this, WorkspacesListMaterial);

        _React$Component.apply(this, arguments);
    }

    WorkspacesListMaterial.prototype.render = function render() {
        var _props = this.props;
        var workspaces = _props.workspaces;
        var showTreeForWorkspace = _props.showTreeForWorkspace;
        var filterByType = _props.filterByType;

        var inboxEntry = undefined,
            entries = [],
            sharedEntries = [],
            remoteShares = [];

        workspaces.forEach((function (object, key) {

            if (Repository.isInternal(object.getId())) return;
            if (object.hasContentFilter()) return;
            if (object.getAccessStatus() === 'declined') return;

            var entry = React.createElement(_WorkspaceEntryMaterial2['default'], _extends({}, this.props, {
                key: key,
                workspace: object,
                showFoldersTree: showTreeForWorkspace && showTreeForWorkspace === key
            }));
            if (object.getAccessType() == "inbox") {
                inboxEntry = entry;
            } else if (object.getOwner()) {
                if (object.getRepositoryType() === 'remote') {
                    remoteShares.push(entry);
                } else {
                    sharedEntries.push(entry);
                }
            } else {
                entries.push(entry);
            }
        }).bind(this));

        var messages = pydio.MessageHash;

        var allEntries = undefined;
        if (sharedEntries.length) {
            sharedEntries.unshift(React.createElement(
                Subheader,
                null,
                messages[626]
            ));
        }
        if (inboxEntry) {
            if (sharedEntries.length) {
                sharedEntries.unshift(React.createElement(Divider, null));
            }
            sharedEntries.unshift(inboxEntry);
            sharedEntries.unshift(React.createElement(
                Subheader,
                null,
                messages[630]
            ));
        }
        if (remoteShares.length) {
            remoteShares.unshift(React.createElement(
                Subheader,
                null,
                messages[627]
            ));
            remoteShares.unshift(React.createElement(Divider, null));
            sharedEntries = sharedEntries.concat(remoteShares);
        }
        if (filterByType === 'entries') {
            entries.unshift(React.createElement(
                Subheader,
                null,
                messages[468]
            ));
        }
        if (filterByType) {
            allEntries = filterByType === 'shared' ? sharedEntries : entries;
        } else {
            allEntries = entries.concat(sharedEntries);
        }

        return React.createElement(
            List,
            { style: this.props.style },
            allEntries
        );
    };

    return WorkspacesListMaterial;
})(React.Component);

WorkspacesListMaterial.propTypes = {
    pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
    workspaces: _propTypes2['default'].instanceOf(Map),
    filterByType: _propTypes2['default'].oneOf(['shared', 'entries', 'create']),

    sectionTitleStyle: _propTypes2['default'].object,
    showTreeForWorkspace: _propTypes2['default'].string,
    onHoverLink: _propTypes2['default'].func,
    onOutLink: _propTypes2['default'].func,
    className: _propTypes2['default'].string,
    style: _propTypes2['default'].object
};

exports['default'] = WorkspacesListMaterial;
module.exports = exports['default'];
