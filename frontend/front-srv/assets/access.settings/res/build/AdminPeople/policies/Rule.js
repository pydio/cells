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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _pydioUtilFunc = require('pydio/util/func');

var _pydioUtilFunc2 = _interopRequireDefault(_pydioUtilFunc);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _editorUtilClassLoader = require("../editor/util/ClassLoader");

var Rule = (function (_React$Component) {
    _inherits(Rule, _React$Component);

    function Rule() {
        _classCallCheck(this, Rule);

        _get(Object.getPrototypeOf(Rule.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Rule, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.create) {
                this.openEditor();
            }
        }
    }, {
        key: 'openEditor',
        value: function openEditor() {
            var _this = this;

            var _props = this.props;
            var pydio = _props.pydio;
            var policy = _props.policy;
            var rule = _props.rule;
            var openRightPane = _props.openRightPane;
            var rulesEditorClass = _props.rulesEditorClass;

            if (this.refs.editor && this.refs.editor.isDirty()) {
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            if (!rulesEditorClass) {
                return false;
            }
            (0, _editorUtilClassLoader.loadEditorClass)(rulesEditorClass, null).then(function (component) {
                openRightPane({
                    COMPONENT: component,
                    PROPS: {
                        ref: "editor",
                        policy: policy,
                        rule: rule,
                        pydio: pydio,
                        saveRule: _this.props.onRuleChange,
                        create: _this.props.create,
                        onRequestTabClose: _this.closeEditor.bind(_this)
                    }
                });
            });
            return true;
        }
    }, {
        key: 'closeEditor',
        value: function closeEditor(editor) {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var closeRightPane = _props2.closeRightPane;

            if (editor && editor.isDirty()) {
                if (editor.isCreate()) {
                    this.props.onRemoveRule(this.props.rule, true);
                    closeRightPane();
                    return true;
                }
                if (!window.confirm(pydio.MessageHash["role_editor.19"])) {
                    return false;
                }
            }
            closeRightPane();
            return true;
        }
    }, {
        key: 'removeRule',
        value: function removeRule() {
            var _props3 = this.props;
            var pydio = _props3.pydio;
            var onRemoveRule = _props3.onRemoveRule;
            var rule = _props3.rule;

            pydio.UI.openConfirmDialog({
                message: pydio.MessageHash['ajxp_admin.policies.rule.delete.confirm'],
                destructive: [rule.description],
                validCallback: function validCallback() {
                    onRemoveRule(rule);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props;
            var rule = _props4.rule;
            var readonly = _props4.readonly;
            var isLast = _props4.isLast;

            var iconColor = rule.effect === 'allow' ? '#33691e' : '#d32f2f';
            var buttons = [];
            if (!readonly) {
                buttons = [_react2['default'].createElement('span', { className: 'mdi mdi-pencil', style: { fontSize: 16, color: 'rgba(0,0,0,.33)', cursor: 'pointer', marginLeft: 12 }, onTouchTap: this.openEditor.bind(this) }), _react2['default'].createElement('span', { className: 'mdi mdi-delete', style: { fontSize: 16, color: 'rgba(0,0,0,.33)', cursor: 'pointer', marginLeft: 12 }, onTouchTap: this.removeRule.bind(this) })];
            }
            var label = _react2['default'].createElement(
                'div',
                null,
                rule.description,
                buttons
            );

            return _react2['default'].createElement(
                'div',
                { style: { display: 'flex', padding: '6px 0 5px', borderBottom: isLast ? null : '1px solid white' } },
                _react2['default'].createElement(_materialUi.FontIcon, { className: 'mdi mdi-traffic-light', color: iconColor, style: { fontSize: 16, marginRight: 10 } }),
                _react2['default'].createElement(
                    'div',
                    { style: { flex: 1 } },
                    rule.description,
                    buttons
                )
            );
        }
    }]);

    return Rule;
})(_react2['default'].Component);

exports['default'] = Rule;
module.exports = exports['default'];
