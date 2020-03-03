/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _builderFormPanel = require('./builder/FormPanel');

var _builderFormPanel2 = _interopRequireDefault(_builderFormPanel);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib("components");

var Stepper = _Pydio$requireLib.Stepper;
var Dialog = Stepper.Dialog;
var PanelBigButtons = Stepper.PanelBigButtons;

var CreateActions = (function (_React$Component) {
    _inherits(CreateActions, _React$Component);

    function CreateActions(props) {
        _classCallCheck(this, CreateActions);

        _get(Object.getPrototypeOf(CreateActions.prototype), 'constructor', this).call(this, props);
        this.state = { filter: '' };
    }

    _createClass(CreateActions, [{
        key: 'dismiss',
        value: function dismiss() {
            this.setState({ actionId: '', random: null });
            var onDismiss = this.props.onDismiss;

            onDismiss();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this = this;

            var _props = this.props;
            var descriptions = _props.descriptions;
            var onSubmit = _props.onSubmit;
            var open = _props.open;
            var _state = this.state;
            var filter = _state.filter;
            var actionId = _state.actionId;
            var random = _state.random;

            var title = undefined,
                content = undefined,
                dialogFilter = undefined,
                dialogProps = {};
            if (actionId) {
                var action = descriptions[actionId];
                var icon = 'mdi mdi-' + action.Icon || 'mdi mdi-chip';
                title = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(_materialUi.FontIcon, { style: { marginRight: 8 }, className: icon, color: action.Tint }),
                    action.Label
                );
                content = _react2['default'].createElement(_builderFormPanel2['default'], {
                    actions: descriptions,
                    action: _pydioHttpRestApi.JobsAction.constructFromObject({ ID: actionId }),
                    onChange: function (newAction) {
                        onSubmit(newAction);_this.setState({ actionId: '' });
                    },
                    create: true,
                    inDialog: true,
                    onDismiss: function () {
                        _this.dismiss();
                    },
                    style: { margin: '10px -10px -10px' },
                    onLoaded: function () {
                        _this.setState({ random: Math.random() });
                    }
                });
                dialogProps = {
                    bodyStyle: {
                        backgroundColor: 'white'
                    },
                    contentStyle: {
                        maxWidth: 600
                    }
                };
            } else {
                (function () {

                    var ss = {};
                    if (descriptions) {
                        Object.keys(descriptions).forEach(function (k) {
                            var action = descriptions[k];
                            if (filter && action.Label.toLowerCase().indexOf(filter.toLowerCase()) === -1 && action.Description.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
                                return;
                            }
                            var sName = action.Category;
                            if (!ss[sName]) {
                                var sp = sName.split(' - ');
                                ss[sName] = { title: sp[sp.length - 1], Actions: [] };
                            }
                            ss[sName].Actions.push({
                                value: k,
                                title: action.Label,
                                icon: action.Icon ? 'mdi mdi-' + action.Icon : 'mdi mdi-chip',
                                tint: action.Tint,
                                description: action.Description
                            });
                        });
                    }
                    var keys = Object.keys(ss);
                    keys.sort();
                    var model = {
                        Sections: keys.map(function (k) {
                            return ss[k];
                        })
                    };

                    title = "Create Action";
                    content = _react2['default'].createElement(PanelBigButtons, {
                        model: model,
                        onPick: function (actionId) {
                            _this.setState({ actionId: actionId, filter: '' });
                        }
                    });
                    dialogFilter = function (v) {
                        _this.setState({ filter: v });
                    };
                })();
            }

            return _react2['default'].createElement(
                Dialog,
                {
                    title: title,
                    open: open,
                    dialogProps: dialogProps,
                    onDismiss: function () {
                        _this.dismiss();
                    },
                    onFilter: dialogFilter,
                    random: random
                },
                content
            );
        }
    }]);

    return CreateActions;
})(_react2['default'].Component);

exports['default'] = CreateActions;
module.exports = exports['default'];
