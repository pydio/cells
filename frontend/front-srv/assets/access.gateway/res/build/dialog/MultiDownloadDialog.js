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
var React = require('react');

var MultiDownloadDialog = React.createClass({
    displayName: 'MultiDownloadDialog',

    propTypes: {
        actionName: React.PropTypes.string,
        selection: React.PropTypes.instanceOf(PydioDataModel),
        buildChunks: React.PropTypes.bool
    },

    mixins: [PydioReactUI.ActionDialogMixin, PydioReactUI.CancelButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitleId: 88,
            dialogIsModal: true
        };
    },
    getInitialState: function getInitialState() {
        var _this = this;

        if (!this.props.buildChunks) {
            var _ret = (function () {
                var nodes = new Map();
                _this.props.selection.getSelectedNodes().map(function (node) {
                    nodes.set(node.getPath(), node.getLabel());
                });
                return {
                    v: { nodes: nodes }
                };
            })();

            if (typeof _ret === 'object') return _ret.v;
        } else {
            return { uniqueChunkNode: this.props.selection.getUniqueNode() };
        }
    },
    removeNode: function removeNode(nodePath, event) {
        var nodes = this.state.nodes;
        nodes['delete'](nodePath);
        if (!nodes.size) {
            this.dismiss();
        } else {
            this.setState({ nodes: nodes });
        }
    },
    performChunking: function performChunking() {
        PydioApi.getClient().request({
            get_action: this.props.chunkAction,
            chunk_count: this.refs.chunkCount.getValue(),
            file: this.state.uniqueChunkNode.getPath()
        }, (function (transport) {
            this.setState({ chunkData: transport.responseJSON });
        }).bind(this));
    },
    render: function render() {
        var _this2 = this;

        var rows = [];
        var chunkAction = undefined;
        if (!this.props.buildChunks) {
            (function () {
                var baseUrl = _this2.props.pydio.Parameters.get('ajxpServerAccess') + '&get_action=' + _this2.props.actionName + '&file=';
                _this2.state.nodes.forEach((function (nodeLabel, nodePath) {
                    rows.push(React.createElement(
                        'div',
                        null,
                        React.createElement(
                            'a',
                            { key: nodePath, href: baseUrl + nodePath, onClick: this.removeNode.bind(this, nodePath) },
                            nodeLabel
                        )
                    ));
                }).bind(_this2));
            })();
        } else if (!this.state.chunkData) {
            chunkAction = React.createElement(
                'div',
                null,
                React.createElement(MaterialUI.TextField, { type: 'number', min: '2', step: '1', defaultValue: '2', floatingLabelText: 'Chunk Count', ref: 'chunkCount' }),
                React.createElement(MaterialUI.RaisedButton, { label: 'Chunk', onClick: this.performChunking })
            );
        } else {
            var chunkData = this.state.chunkData;
            var baseUrl = this.props.pydio.Parameters.get('ajxpServerAccess') + '&get_action=' + this.props.actionName + '&file_id=' + chunkData.file_id;
            for (var i = 0; i < chunkData.chunk_count; i++) {
                rows.push(React.createElement(
                    'div',
                    null,
                    React.createElement(
                        'a',
                        { href: baseUrl + "&chunk_index=" + i },
                        chunkData.localname + " (part " + (i + 1) + ")"
                    )
                ));
            }
        }
        return React.createElement(
            'div',
            null,
            chunkAction,
            React.createElement(
                'div',
                null,
                rows
            )
        );
    }

});

exports['default'] = MultiDownloadDialog;
module.exports = exports['default'];
