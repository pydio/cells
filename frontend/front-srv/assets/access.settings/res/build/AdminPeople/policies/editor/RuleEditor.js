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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _Label = require('./Label');

var _Label2 = _interopRequireDefault(_Label);

var _Actions = require('./Actions');

var _Actions2 = _interopRequireDefault(_Actions);

var _Effect = require('./Effect');

var _Effect2 = _interopRequireDefault(_Effect);

var _Resources = require('./Resources');

var _Resources2 = _interopRequireDefault(_Resources);

var _Subjects = require('./Subjects');

var _Subjects2 = _interopRequireDefault(_Subjects);

var _Conditions = require('./Conditions');

var _Conditions2 = _interopRequireDefault(_Conditions);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;

var RuleEditor = (function (_React$Component) {
    _inherits(RuleEditor, _React$Component);

    function RuleEditor(props) {
        _classCallCheck(this, RuleEditor);

        _get(Object.getPrototypeOf(RuleEditor.prototype), 'constructor', this).call(this, props);
        this.state = {
            rule: props.rule,
            dirty: this.props.create,
            valid: !this.props.create,
            create: this.props.create
        };
    }

    _createClass(RuleEditor, [{
        key: 'isDirty',
        value: function isDirty() {
            return this.state.dirty;
        }
    }, {
        key: 'isValid',
        value: function isValid() {
            return this.state.valid;
        }
    }, {
        key: 'isCreate',
        value: function isCreate() {
            return this.state.create;
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            this.setState({ rule: newProps.rule });
        }
    }, {
        key: 'onChange',
        value: function onChange(rule) {
            var valid = rule.description && rule.actions.length && rule.resources.length && rule.subjects.length;
            this.setState({ rule: rule, dirty: true, valid: valid });
        }
    }, {
        key: 'revert',
        value: function revert() {
            this.setState({ rule: this.props.rule, dirty: false });
        }
    }, {
        key: 'save',
        value: function save() {
            var rule = this.state.rule;

            this.props.saveRule(rule);
            this.setState({ dirty: false, create: false });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _state = this.state;
            var rule = _state.rule;
            var dirty = _state.dirty;
            var valid = _state.valid;

            var buttonMargin = { marginLeft: 6 };
            var actions = [];
            if (!this.isCreate()) {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, disabled: !dirty, label: "Revert", onTouchTap: this.revert.bind(this) }));
            }
            actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, disabled: !dirty || !valid, label: "Save", onTouchTap: this.save.bind(this) }));
            if (this.isCreate()) {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, label: "Cancel", onTouchTap: function () {
                        return _this.props.onRequestTabClose(_this);
                    } }));
            } else {
                actions.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: buttonMargin, label: "Close", onTouchTap: function () {
                        return _this.props.onRequestTabClose(_this);
                    } }));
            }
            var containerStyle = { margin: 16, fontSize: 16 };

            return _react2['default'].createElement(
                PaperEditorLayout,
                {
                    title: rule.description || 'Please provide a label',
                    titleActionBar: actions,
                    contentFill: false
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_Label2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Effect2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Actions2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Resources2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Subjects2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle })),
                    _react2['default'].createElement(_Conditions2['default'], _extends({}, this.props, { rule: rule, onChange: this.onChange.bind(this), containerStyle: containerStyle }))
                )
            );
        }
    }]);

    return RuleEditor;
})(_react2['default'].Component);

exports['default'] = RuleEditor;
module.exports = exports['default'];
