'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _InlineEditor = require('./InlineEditor');

var _InlineEditor2 = _interopRequireDefault(_InlineEditor);

var _ListEntry = require('./ListEntry');

var _materialUi = require('material-ui');

var _withNodeListenerEntry = require('./withNodeListenerEntry');

var _withNodeListenerEntry2 = _interopRequireDefault(_withNodeListenerEntry);

/**
 * Callback based material list entry with custom icon render, firstLine, secondLine, etc.
 */

var ConfigurableListEntry = (function (_React$Component) {
    _inherits(ConfigurableListEntry, _React$Component);

    function ConfigurableListEntry() {
        _classCallCheck(this, ConfigurableListEntry);

        _React$Component.apply(this, arguments);
    }

    ConfigurableListEntry.prototype.render = function render() {
        var _props = this.props;
        var secondLine = _props.secondLine;
        var thirdLine = _props.thirdLine;
        var _props$style = _props.style;
        var style = _props$style === undefined ? {} : _props$style;
        var actions = _props.actions;
        var _props2 = this.props;
        var renderIcon = _props2.renderIcon;
        var node = _props2.node;
        var renderFirstLine = _props2.renderFirstLine;
        var renderSecondLine = _props2.renderSecondLine;
        var renderThirdLine = _props2.renderThirdLine;
        var renderActions = _props2.renderActions;

        var icon = undefined,
            firstLine = undefined;

        if (renderIcon) {
            icon = renderIcon(node, this.props);
        } else {
            var iconClass = node.getMetadata().get("icon_class") ? node.getMetadata().get("icon_class") : node.isLeaf() ? "icon-file-alt" : "icon-folder-close";
            icon = _react2['default'].createElement(_materialUi.FontIcon, { className: iconClass });
        }

        if (renderFirstLine) {
            firstLine = renderFirstLine(this.props.node);
        } else {
            firstLine = node.getLabel();
        }
        if (this.props.inlineEdition) {
            firstLine = _react2['default'].createElement(
                'span',
                null,
                _react2['default'].createElement(_InlineEditor2['default'], {
                    node: this.props.node,
                    onClose: this.props.inlineEditionDismiss,
                    callback: this.props.inlineEditionCallback
                }),
                firstLine
            );
            style.position = 'relative';
        }
        if (renderSecondLine) {
            secondLine = renderSecondLine(node);
        }
        if (renderThirdLine) {
            thirdLine = renderThirdLine(node);
        }
        if (renderActions) {
            actions = renderActions(node);
        }

        return _react2['default'].createElement(_ListEntry.DragDropListEntry, _extends({}, this.props, {
            iconCell: icon,
            firstLine: firstLine,
            secondLine: secondLine,
            thirdLine: thirdLine,
            actions: actions,
            style: style
        }));
    };

    return ConfigurableListEntry;
})(_react2['default'].Component);

ConfigurableListEntry.propTypes = {
    node: _propTypes2['default'].instanceOf(_pydioModelNode2['default']),
    renderIcon: _propTypes2['default'].func,
    renderFirstLine: _propTypes2['default'].func,
    renderSecondLine: _propTypes2['default'].func,
    renderThirdLine: _propTypes2['default'].func,
    renderActions: _propTypes2['default'].func,
    style: _propTypes2['default'].object
};

ConfigurableListEntry = _withNodeListenerEntry2['default'](ConfigurableListEntry);
exports['default'] = ConfigurableListEntry;
module.exports = exports['default'];
