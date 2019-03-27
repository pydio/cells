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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pydio = require("pydio");

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var PydioContextConsumer = _Pydio$requireLib.PydioContextConsumer;

var _require = require('material-ui');

var Paper = _require.Paper;
var TextField = _require.TextField;
var FlatButton = _require.FlatButton;

var InlineEditor = _react2['default'].createClass({
    displayName: 'InlineEditor',

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']),
        callback: _react2['default'].PropTypes.func,
        onClose: _react2['default'].PropTypes.func,
        detached: _react2['default'].PropTypes.bool
    },

    submit: function submit() {
        var value = undefined;
        if (this.state && this.state.value) {
            value = this.state.value;
        }
        var messages = _pydio2['default'].getMessages();
        if (!value || value === this.props.node.getLabel()) {
            this.setState({
                errorString: messages['rename.newvalue.error.similar']
            });
        } else if (value && value.indexOf('/') > -1) {
            this.setState({
                errorString: messages['filename.forbidden.slash']
            });
        } else {
            this.props.callback(value);
            this.props.onClose();
        }
    },

    componentDidMount: function componentDidMount() {
        _pydioUtilDom2['default'].selectBaseFileName(this.refs.text.input);
        this.refs.text.focus();
    },

    catchClicks: function catchClicks(e) {
        e.stopPropagation();
    },

    onKeyDown: function onKeyDown(e) {
        e.stopPropagation();
        if (e.key === 'Enter') {
            this.submit();
        } else {
            this.setState({ errorString: '' });
        }
    },

    render: function render() {
        var _this = this;

        var messages = _pydio2['default'].getMessages();
        return _react2['default'].createElement(
            Paper,
            { className: "inline-editor" + (this.props.detached ? " detached" : ""), style: { padding: 8 }, zDepth: 2 },
            _react2['default'].createElement(TextField, {
                ref: 'text',
                defaultValue: this.props.node.getLabel(),
                onChange: function (e, value) {
                    _this.setState({ value: value });
                },
                onClick: this['catch'], onDoubleClick: this.catchClicks,
                tabIndex: '0', onKeyDown: this.onKeyDown,
                errorText: this.state ? this.state.errorString : null
            }),
            _react2['default'].createElement(
                'div',
                { style: { textAlign: 'right', paddingTop: 8 } },
                _react2['default'].createElement(FlatButton, { label: messages['54'], onClick: this.props.onClose }),
                _react2['default'].createElement(FlatButton, { label: messages['48'], onClick: this.submit })
            )
        );
    }

});

exports['default'] = InlineEditor = PydioContextConsumer(InlineEditor);

exports['default'] = InlineEditor;
module.exports = exports['default'];
