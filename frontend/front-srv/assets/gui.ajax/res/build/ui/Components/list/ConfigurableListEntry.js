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

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ListEntryNodeListenerMixin = require('./ListEntryNodeListenerMixin');

var _ListEntryNodeListenerMixin2 = _interopRequireDefault(_ListEntryNodeListenerMixin);

var _InlineEditor = require('./InlineEditor');

var _InlineEditor2 = _interopRequireDefault(_InlineEditor);

var _ListEntry = require('./ListEntry');

var _materialUi = require('material-ui');

/**
 * Callback based material list entry with custom icon render, firstLine, secondLine, etc.
 */
exports['default'] = _react2['default'].createClass({
    displayName: 'ConfigurableListEntry',

    mixins: [_ListEntryNodeListenerMixin2['default']],

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(AjxpNode),
        // SEE ALSO ListEntry PROPS
        renderIcon: _react2['default'].PropTypes.func,
        renderFirstLine: _react2['default'].PropTypes.func,
        renderSecondLine: _react2['default'].PropTypes.func,
        renderThirdLine: _react2['default'].PropTypes.func,
        renderActions: _react2['default'].PropTypes.func,
        style: _react2['default'].PropTypes.object
    },

    render: function render() {
        var _this = this;

        var icon = undefined,
            firstLine = undefined,
            secondLine = undefined,
            thirdLine = undefined,
            style = this.props.style || {};
        if (this.props.renderIcon) {
            icon = this.props.renderIcon(this.props.node, this.props);
        } else {
            var node = this.props.node;
            var iconClass = node.getMetadata().get("icon_class") ? node.getMetadata().get("icon_class") : node.isLeaf() ? "icon-file-alt" : "icon-folder-close";
            icon = _react2['default'].createElement(_materialUi.FontIcon, { className: iconClass });
        }

        if (this.props.renderFirstLine) {
            firstLine = this.props.renderFirstLine(this.props.node);
        } else {
            firstLine = this.props.node.getLabel();
        }
        if (this.state && this.state.inlineEdition) {
            firstLine = _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(_InlineEditor2['default'], {
                    node: this.props.node,
                    onClose: function () {
                        _this.setState({ inlineEdition: false });
                    },
                    callback: this.state.inlineEditionCallback
                }),
                firstLine
            );
            style.position = 'relative';
        }
        if (this.props.renderSecondLine) {
            secondLine = this.props.renderSecondLine(this.props.node);
        }
        if (this.props.renderThirdLine) {
            thirdLine = this.props.renderThirdLine(this.props.node);
        }
        var actions = this.props.actions;
        if (this.props.renderActions) {
            actions = this.props.renderActions(this.props.node);
        }

        return _react2['default'].createElement(_ListEntry.DragDropListEntry, _extends({}, this.props, {
            iconCell: icon,
            firstLine: firstLine,
            secondLine: secondLine,
            thirdLine: thirdLine,
            actions: actions,
            style: style
        }));
    }

});
module.exports = exports['default'];
