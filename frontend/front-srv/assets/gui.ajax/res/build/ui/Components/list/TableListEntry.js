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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _ListEntry = require('./ListEntry');

var _InlineEditor = require('./InlineEditor');

var _InlineEditor2 = _interopRequireDefault(_InlineEditor);

var _withNodeListenerEntry = require('./withNodeListenerEntry');

var _withNodeListenerEntry2 = _interopRequireDefault(_withNodeListenerEntry);

/**
 * Specific list entry rendered as a table row. Not a real table, CSS used.
 */

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;

var TableListEntry = (function (_React$Component) {
    _inherits(TableListEntry, _React$Component);

    function TableListEntry() {
        _classCallCheck(this, TableListEntry);

        _React$Component.apply(this, arguments);
    }

    // /*
    //     propTypes:{
    //         node:React.PropTypes.instanceOf(AjxpNode),
    //         tableKeys:React.PropTypes.object.isRequired,
    //         renderActions:React.PropTypes.func
    //         // See also ListEntry nodes
    //     },
    // */

    TableListEntry.prototype.render = function render() {

        var actions = this.props.actions;
        if (this.props.renderActions) {
            actions = this.props.renderActions(this.props.node);
        }

        var cells = [];
        var firstKey = true;
        var meta = this.props.node.getMetadata();
        for (var key in this.props.tableKeys) {
            if (!this.props.tableKeys.hasOwnProperty(key)) {
                continue;
            }

            var data = this.props.tableKeys[key];
            var style = data['width'] ? { width: data['width'] } : null;
            var value = undefined,
                rawValue = undefined;
            if (data.renderCell) {
                data['name'] = key;
                value = data.renderCell(this.props.node, data);
            } else if (key === 'ajxp_modiftime') {
                var mDate = moment(parseFloat(meta.get('ajxp_modiftime')) * 1000);
                var dateString = mDate.calendar();
                if (dateString.indexOf('/') > -1) {
                    dateString = mDate.fromNow();
                }
                value = dateString;
            } else if (key === 'bytesize') {
                value = _pydioUtilPath2['default'].roundFileSize(parseInt(meta.get(key)));
            } else {
                value = meta.get(key);
            }
            rawValue = meta.get(key);
            var inlineEditor = undefined;
            if (this.props.inlineEdition && firstKey) {
                inlineEditor = _react2['default'].createElement(_InlineEditor2['default'], {
                    node: this.props.node,
                    onClose: this.props.inlineEditionDismiss,
                    callback: this.props.inlineEditionCallback
                });
                var _style = this.props.style || {};
                _style.position = 'relative';
                this.props.style = _style;
            }
            cells.push(_react2['default'].createElement(
                'span',
                { key: key, className: 'cell cell-' + key, title: rawValue, style: style, 'data-label': data['label'] },
                inlineEditor,
                value
            ));
            firstKey = false;
        }

        return _react2['default'].createElement(_ListEntry.DragDropListEntry, _extends({}, this.props, {
            iconCell: null,
            firstLine: cells,
            actions: actions
        }));
    };

    return TableListEntry;
})(_react2['default'].Component);

exports['default'] = _withNodeListenerEntry2['default'](TableListEntry);
module.exports = exports['default'];
