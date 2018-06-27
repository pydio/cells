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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var PydioComponents = _pydio2['default'].requireLib('components');
var MaterialTable = PydioComponents.MaterialTable;
exports['default'] = _react2['default'].createClass({
    displayName: 'WorkspaceList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
        rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
        openSelection: _react2['default'].PropTypes.func,
        filter: _react2['default'].PropTypes.string
    },

    reload: function reload() {
        this.props.currentNode.reload();
    },

    componentDidMount: function componentDidMount() {
        var _this = this;

        this.props.currentNode.observe('loaded', function () {
            _this.forceUpdate();
        });
        this.reload();
    },

    componentWillUnmount: function componentWillUnmount() {
        var _this2 = this;

        this.props.currentNode.stopObserving('loaded', function () {
            _this2.forceUpdate();
        });
    },

    openTableRows: function openTableRows(rows) {
        if (rows.length) {
            this.props.openSelection(rows[0].node);
        }
    },

    computeTableData: function computeTableData(currentNode) {
        var data = [];
        currentNode.getChildren().forEach(function (child) {
            if (child.getMetadata().get('accessType') !== 'gateway') {
                return;
            }
            var summary = "";
            var paths = JSON.parse(child.getMetadata().get('rootNodes'));
            if (paths) {
                summary = paths.join(", ");
            }
            data.push({
                node: child,
                label: child.getLabel(),
                description: child.getMetadata().get("description"),
                slug: child.getMetadata().get("slug"),
                summary: summary
            });
        });
        data.sort(function (a, b) {
            return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
        });
        return data;
    },

    render: function render() {

        var columns = [{ name: 'label', label: 'Label', style: { width: '20%', fontSize: 15 }, headerStyle: { width: '20%' } }, { name: 'description', label: 'Description', style: { width: '30%' }, headerStyle: { width: '30%' } }, { name: 'summary', label: 'Root Nodes', style: { width: '30%' }, headerStyle: { width: '30%' } }, { name: 'slug', label: 'Slug', style: { width: '20%' }, headerStyle: { width: '20%' } }];

        var data = this.computeTableData(this.props.currentNode);

        return _react2['default'].createElement(MaterialTable, {
            data: data,
            columns: columns,
            onSelectRows: this.openTableRows.bind(this),
            deselectOnClickAway: true,
            showCheckboxes: false
        });
    }

});
module.exports = exports['default'];
