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

var _pydioUtilXml = require('pydio/util/xml');

var _pydioUtilXml2 = _interopRequireDefault(_pydioUtilXml);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUi = require('material-ui');

var _Loader = require('./Loader');

var _Loader2 = _interopRequireDefault(_Loader);

var _PluginEditor = require('./PluginEditor');

var _PluginEditor2 = _interopRequireDefault(_PluginEditor);

var _Pydio$requireLib = Pydio.requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var PluginsList = React.createClass({
    displayName: 'PluginsList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return {};
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        _Loader2['default'].getInstance(this.props.pydio).loadPlugins().then(function (res) {
            _this.setState({ xmlPlugins: res });
        });
    },

    togglePluginEnable: function togglePluginEnable(node, toggled) {
        var _this2 = this;

        _Loader2['default'].getInstance(this.props.pydio).toggleEnabled(node, toggled, function () {
            _this2.reload();
        });
    },

    openTableRows: function openTableRows(rows) {
        if (rows && rows.length && this.props.openRightPane) {
            this.props.openRightPane({
                COMPONENT: _PluginEditor2['default'],
                PROPS: {
                    pluginId: rows[0].id,
                    docAsAdditionalPane: true,
                    className: "vertical edit-plugin-inpane",
                    closeEditor: this.props.closeRightPane,
                    accessByName: this.props.accessByName
                },
                CHILDREN: null
            });
        }
    },

    reload: function reload() {
        var _this3 = this;

        _Loader2['default'].getInstance(this.props.pydio).loadPlugins(true).then(function (res) {
            _this3.setState({ xmlPlugins: res });
        });
    },

    computeTableData: function computeTableData() {
        var rows = [];
        var xmlPlugins = this.state.xmlPlugins;

        if (!xmlPlugins) {
            return rows;
        }

        var _props = this.props;
        var filterType = _props.filterType;
        var filterString = _props.filterString;

        return _pydioUtilXml2['default'].XPathSelectNodes(xmlPlugins, "/plugins/*").filter(function (xmlNode) {
            return !filterType || xmlNode.getAttribute("id").indexOf(filterType) === 0;
        }).filter(function (xmlNode) {
            return !filterString || xmlNode.getAttribute("id").toLowerCase().indexOf(filterString.toLowerCase()) !== -1 || xmlNode.getAttribute("label").toLowerCase().indexOf(filterString.toLowerCase()) !== -1 || xmlNode.getAttribute("description").toLowerCase().indexOf(filterString.toLowerCase()) !== -1;
        }).map(function (xmlNode) {
            return {
                id: xmlNode.getAttribute("id"),
                label: xmlNode.getAttribute("label"),
                description: xmlNode.getAttribute("description"),
                xmlNode: xmlNode
            };
        }).sort(_pydioUtilLang2['default'].arraySorter('id'));
    },

    render: function render() {
        var _this4 = this;

        var _props2 = this.props;
        var displaySmall = _props2.displaySmall;
        var pydio = _props2.pydio;
        var accessByName = _props2.accessByName;

        var m = function m(id) {
            return pydio.MessageHash['ajxp_admin.plugins.list.' + id] || id;
        };
        var columns = undefined;
        var renderEnabled = function renderEnabled(row) {
            return React.createElement(_materialUi.Toggle, {
                toggled: row.xmlNode.getAttribute("enabled") !== "false",
                onToggle: function (e, v) {
                    return _this4.togglePluginEnable(row.xmlNode, v);
                },
                onClick: function (e) {
                    return e.stopPropagation();
                },
                disabled: row.xmlNode.getAttribute("enabled") === "always" || !accessByName('Create')
            });
        };
        var renderEditButton = function renderEditButton(row) {
            if (_pydioUtilXml2['default'].XPathSelectNodes(row.xmlNode, "server_settings/global_param").length) {
                return React.createElement(_materialUi.IconButton, {
                    iconStyle: { color: 'rgba(0,0,0,0.33)', fontSize: 21 },
                    iconClassName: 'mdi mdi-pencil',
                    tooltip: m('action.edit'),
                    onTouchTap: function () {
                        return _this4.openTableRows([row]);
                    }
                });
            } else {
                return React.createElement('span', null);
            }
        };

        if (displaySmall) {
            columns = [{ name: 'enabled', label: m('column.enabled'), style: { width: 80 }, headerStyle: { width: 80 }, renderCell: renderEnabled }, { name: 'label', label: m('column.label'), style: { fontSize: 15 } }, { name: 'action', label: '', style: { width: 80, textOverflow: 'inherit' }, headerStyle: { width: 80 }, renderCell: renderEditButton }];
        } else {
            columns = [{ name: 'enabled', label: m('column.enabled'), style: { width: 80 }, headerStyle: { width: 80 }, renderCell: renderEnabled }, { name: 'label', label: m('column.label'), style: { width: '20%', fontSize: 15 }, headerStyle: { width: '20%' } }, { name: 'id', label: m('column.id'), style: { width: '15%' }, headerStyle: { width: '15%' }, hideSmall: true }, { name: 'description', label: m('column.description'), hideSmall: true }, { name: 'action', label: '', style: { width: 80, textOverflow: 'inherit' }, headerStyle: { width: 80 }, renderCell: renderEditButton }];
        }

        var data = this.computeTableData();

        return React.createElement(MaterialTable, {
            data: data,
            columns: columns,
            deselectOnClickAway: true,
            showCheckboxes: false
        });
    }

});

exports['default'] = PluginsList;
module.exports = exports['default'];
