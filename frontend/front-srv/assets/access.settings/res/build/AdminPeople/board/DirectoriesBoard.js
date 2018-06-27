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

'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _editorLdapLdapEditor = require('../editor/ldap/LdapEditor');

var _editorLdapLdapEditor2 = _interopRequireDefault(_editorLdapLdapEditor);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _editorLdapServerConfigModel = require('../editor/ldap/ServerConfigModel');

var _editorLdapServerConfigModel2 = _interopRequireDefault(_editorLdapServerConfigModel);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;

var DirectoriesBoard = _react2['default'].createClass({
    displayName: 'DirectoriesBoard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openEditor: _react2['default'].PropTypes.func.isRequired,
        openRightPane: _react2['default'].PropTypes.func.isRequired,
        closeRightPane: _react2['default'].PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
        return { directories: [] };
    },

    // Load from server
    loadDirectories: function loadDirectories() {
        var _this = this;

        this.setState({ loading: true });
        _editorLdapServerConfigModel2['default'].loadDirectories().then(function (response) {
            if (response.Directories) {
                _this.setState({ directories: response.Directories });
            } else {
                _this.setState({ directories: [] });
            }
            _this.setState({ loading: false });
        })['catch'](function () {
            _this.setState({ loading: false });
        });
    },

    deleteDirectory: function deleteDirectory(row) {
        var _this2 = this;

        if (confirm('Are you sure you want to remove this external directory?')) {
            _editorLdapServerConfigModel2['default'].deleteDirectory(row.ConfigId).then(function (res) {
                _this2.loadDirectories();
            });
        }
    },

    openEditor: function openEditor() {
        var _this3 = this;

        var config = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
        var _props = this.props;
        var pydio = _props.pydio;
        var openRightPane = _props.openRightPane;

        if (this.refs.editor && this.refs.editor.isDirty()) {
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        var editorData = {
            COMPONENT: _editorLdapLdapEditor2['default'],
            PROPS: {
                ref: "editor",
                pydio: pydio,
                config: config,
                reload: function reload() {
                    _this3.loadDirectories();
                },
                onRequestTabClose: this.closeEditor.bind(this)
            }
        };
        openRightPane(editorData);
        return true;
    },

    closeEditor: function closeEditor(editor) {
        var _props2 = this.props;
        var pydio = _props2.pydio;
        var closeRightPane = _props2.closeRightPane;

        if (editor && editor.isDirty()) {
            if (editor.isCreate()) {
                closeRightPane();
                return true;
            }
            if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                return false;
            }
        }
        closeRightPane();
        return true;
    },

    openTableRows: function openTableRows(rows) {
        if (!rows.length) {
            return;
        }
        var row = rows[0];
        this.openEditor(row);
    },

    componentDidMount: function componentDidMount() {
        this.loadDirectories();
    },

    render: function render() {
        var _this4 = this;

        var directories = this.state.directories;

        var columns = [{ name: 'DomainName', label: 'Directory' }, { name: 'Host', label: 'Server Address' }, { name: 'Schedule', label: 'Synchronization' }, { name: 'Actions', label: '', style: { width: 80 }, headerStyle: { width: 80 }, renderCell: function renderCell(row) {
                return _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-delete", tooltip: "Remove", onTouchTap: function () {
                        _this4.deleteDirectory(row);
                    }, onClick: function (e) {
                        e.stopPropagation();
                    } });
            } }];

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.props.currentNode.getLabel(),
                icon: this.props.currentNode.getMetadata().get('icon_class'),
                actions: [_react2['default'].createElement(_materialUi.FlatButton, { primary: true, label: "+ Directory", onTouchTap: function () {
                        _this4.openEditor();
                    } })],
                reloadAction: this.loadDirectories.bind(this),
                loading: this.state.loading
            }),
            _react2['default'].createElement(AdminComponents.SubHeader, { legend: 'Connect Pydio to one or many external user directories (currently only LDAP/ActiveDirectory are supported). Users will be synchronized to the internal Pydio directory.' }),
            _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 1, style: { margin: 16 }, className: "horizontal-layout layout-fill" },
                _react2['default'].createElement(MaterialTable, {
                    data: directories,
                    columns: columns,
                    onSelectRows: this.openTableRows.bind(this),
                    deselectOnClickAway: true,
                    showCheckboxes: false
                })
            )
        );
    }

});

exports['default'] = DirectoriesBoard = (0, _materialUiStyles.muiThemeable)()(DirectoriesBoard);
exports['default'] = DirectoriesBoard;
module.exports = exports['default'];
