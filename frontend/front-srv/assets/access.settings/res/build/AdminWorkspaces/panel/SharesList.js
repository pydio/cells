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

var _materialUi = require('material-ui');

var _modelWorkspace = require('../model/Workspace');

var _modelWorkspace2 = _interopRequireDefault(_modelWorkspace);

exports['default'] = _react2['default'].createClass({
    displayName: 'SharesList',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        model: _react2['default'].PropTypes.instanceOf(_modelWorkspace2['default']).isRequired
    },

    getInitialState: function getInitialState() {
        return { clearing: false };
    },

    clearBrokenLinks: function clearBrokenLinks() {
        this.setState({ clearing: true });
        PydioApi.getClient().request({
            get_action: "sharelist-load",
            parent_repository_id: this.props.model.wsId,
            user_context: "global",
            clear_broken_links: "true"
        }, (function (t) {
            var count = t.responseJSON["cleared_count"];
            if (count) {
                pydio.displayMessage('SUCCESS', 'Removed ' + count + ' broken links');
                this.refs.list.reload();
            } else {
                pydio.displayMessage('SUCCESS', 'Nothing to do');
            }
            this.setState({ clearing: false });
        }).bind(this));
    },

    render: function render() {

        return _react2['default'].createElement(
            'div',
            { className: 'layout-fill vertical-layout' },
            _react2['default'].createElement(
                'div',
                { style: { position: 'absolute', right: 20, top: 90 } },
                _react2['default'].createElement(_materialUi.RaisedButton, { label: this.state.clearing ? "Processing..." : "Clear broken links", disabled: this.state.clearing, onTouchTap: this.clearBrokenLinks })
            ),
            _react2['default'].createElement(
                'h1',
                { className: 'workspace-general-h1' },
                this.context.getMessage('ws.38')
            ),
            _react2['default'].createElement(
                ReactMUI.Paper,
                { zDepth: 1, className: 'workspace-activity-block layout-fill vertical-layout' },
                _react2['default'].createElement(PydioComponents.NodeListCustomProvider, {
                    ref: 'list',
                    title: this.context.getMessage('ws.25'),
                    nodeProviderProperties: {
                        get_action: "sharelist-load",
                        parent_repository_id: this.props.model.wsId,
                        user_context: "global"
                    },
                    tableKeys: {
                        owner: { label: this.context.getMessage('ws.39'), width: '20%' },
                        share_type_readable: { label: this.context.getMessage('ws.40'), width: '15%' },
                        original_path: { label: this.context.getMessage('ws.41'), width: '80%' }
                    },
                    actionBarGroups: ['share_list_toolbar-selection', 'share_list_toolbar'],
                    groupByFields: ['owner', 'share_type_readable'],
                    defaultGroupBy: 'share_type_readable',
                    elementHeight: PydioComponents.SimpleList.HEIGHT_ONE_LINE
                })
            )
        );
    }
});
module.exports = exports['default'];
