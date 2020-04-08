/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var InlineLabel = (function (_React$Component) {
    _inherits(InlineLabel, _React$Component);

    function InlineLabel(props) {
        _classCallCheck(this, InlineLabel);

        _get(Object.getPrototypeOf(InlineLabel.prototype), 'constructor', this).call(this, props);
        this.state = { edit: false, hover: false, label: props.label };
    }

    _createClass(InlineLabel, [{
        key: 'onChange',
        value: function onChange(event, value) {
            this.setState({ label: value });
        }
    }, {
        key: 'onEnter',
        value: function onEnter(event) {
            if (event.key === "Enter") {
                this.setState({ edit: false });
                this.props.onChange(this.state.label);
            }
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            this.setState({ edit: false, hover: false, label: this.props.label });
        }
    }, {
        key: 'open',
        value: function open(event) {
            var _this = this;

            this.setState({
                edit: true,
                elementWidth: Math.max(event.target.offsetWidth, 256)
            }, function () {
                _this.refs.text.select();
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var edit = _state.edit;
            var hover = _state.hover;
            var label = _state.label;

            if (edit) {
                return _react2['default'].createElement(
                    'div',
                    { style: { backgroundColor: '#f4f4f4' } },
                    _react2['default'].createElement(_materialUi.TextField, {
                        fullWidth: this.state.elementWidth,
                        style: { marginTop: -20, width: this.state.elementWidth },
                        value: label,
                        onChange: this.onChange.bind(this),
                        onKeyDown: this.onEnter.bind(this),
                        underlineShow: false,
                        ref: 'text',
                        inputStyle: this.props.inputStyle,
                        onBlur: this.cancel.bind(this)
                    }),
                    ' ',
                    _react2['default'].createElement(
                        'span',
                        { style: { fontStyle: 'italic', opacity: 0.8 } },
                        '(Hit enter to save)'
                    )
                );
            } else {
                var editIcon = undefined;
                if (hover) {
                    editIcon = _react2['default'].createElement('span', { className: 'mdi mdi-pencil', style: { color: '#e0e0e0' }, onMouseOver: function () {
                            _this2.setState({ hover: true });
                        } });
                }
                return _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(
                        'span',
                        {
                            style: { pointer: 'cursor' },
                            title: 'Click to edit',
                            onClick: this.open.bind(this),
                            onMouseOver: function () {
                                _this2.setState({ hover: true });
                            },
                            onMouseOut: function () {
                                _this2.setState({ hover: false });
                            }
                        },
                        label,
                        ' ',
                        editIcon,
                        ' '
                    ),
                    this.props.legend
                );
            }
        }
    }]);

    return InlineLabel;
})(_react2['default'].Component);

exports['default'] = InlineLabel;
module.exports = exports['default'];
