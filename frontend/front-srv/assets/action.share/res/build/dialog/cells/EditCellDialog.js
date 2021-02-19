'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _SharedUsers = require('./SharedUsers');

var _SharedUsers2 = _interopRequireDefault(_SharedUsers);

var _NodesPicker = require('./NodesPicker');

var _NodesPicker2 = _interopRequireDefault(_NodesPicker);

var _mainGenericEditor = require('../main/GenericEditor');

var _mainGenericEditor2 = _interopRequireDefault(_mainGenericEditor);

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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var React = require('react');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var ResourcePoliciesPanel = _Pydio$requireLib.ResourcePoliciesPanel;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;

/**
 * Dialog for letting users create a workspace
 */

var _default = (function (_React$Component) {
    _inherits(_default, _React$Component);

    function _default() {
        var _this = this;

        _classCallCheck(this, _default);

        _get(Object.getPrototypeOf(_default.prototype), 'constructor', this).apply(this, arguments);

        this.submit = function () {
            var _props = _this.props;
            var model = _props.model;
            var pydio = _props.pydio;

            var dirtyRoots = model.hasDirtyRootNodes();
            model.save().then(function (result) {
                _this.forceUpdate();
                if (dirtyRoots && model.getUuid() === pydio.user.getActiveRepository()) {
                    pydio.goTo('/');
                    pydio.fireContextRefresh();
                }
            })['catch'](function (reason) {
                pydio.UI.displayMessage('ERROR', reason.message);
            });
        };
    }

    _createClass(_default, [{
        key: 'getChildContext',
        value: function getChildContext() {
            var messages = this.props.pydio.MessageHash;
            return {
                messages: messages,
                getMessage: function getMessage(messageId) {
                    var namespace = arguments.length <= 1 || arguments[1] === undefined ? 'share_center' : arguments[1];

                    try {
                        return messages[namespace + (namespace ? "." : "") + messageId] || messageId;
                    } catch (e) {
                        return messageId;
                    }
                },
                isReadonly: function isReadonly() {
                    return false;
                }
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var pydio = _props2.pydio;
            var model = _props2.model;
            var sendInvitations = _props2.sendInvitations;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

            var header = React.createElement(
                'div',
                null,
                React.createElement(ModernTextField, { floatingLabelText: m(267), value: model.getLabel(), onChange: function (e, v) {
                        model.setLabel(v);
                    }, fullWidth: true }),
                React.createElement(ModernTextField, { floatingLabelText: m(268), value: model.getDescription(), onChange: function (e, v) {
                        model.setDescription(v);
                    }, fullWidth: true })
            );
            var tabs = {
                left: [{
                    Label: m(54),
                    Value: 'users',
                    Component: React.createElement(_SharedUsers2['default'], {
                        pydio: pydio,
                        cellAcls: model.getAcls(),
                        excludes: [pydio.user.id],
                        sendInvitations: sendInvitations,
                        onUserObjectAdd: model.addUser.bind(model),
                        onUserObjectRemove: model.removeUser.bind(model),
                        onUserObjectUpdateRight: model.updateUserRight.bind(model)
                    })
                }, {
                    Label: m(253),
                    Value: 'permissions',
                    AlwaysLast: true,
                    Component: React.createElement(ResourcePoliciesPanel, {
                        pydio: pydio,
                        resourceType: 'cell',
                        description: m('cell.visibility.advanced'),
                        resourceId: model.getUuid(),
                        style: { margin: -10 },
                        skipTitle: true,
                        onSavePolicies: function () {},
                        readonly: false,
                        cellAcls: model.getAcls()
                    })
                }],
                right: [{
                    Label: m(249),
                    Value: 'content',
                    Component: React.createElement(_NodesPicker2['default'], { pydio: pydio, model: model, mode: 'edit' })
                }]
            };

            return React.createElement(_mainGenericEditor2['default'], {
                pydio: pydio,
                tabs: tabs,
                header: header,
                editorOneColumn: this.props.editorOneColumn,
                saveEnabled: model.isDirty(),
                onSaveAction: this.submit.bind(this),
                onCloseAction: this.props.onDismiss,
                onRevertAction: function () {
                    model.revertChanges();
                }
            });
        }
    }], [{
        key: 'childContextTypes',
        value: {
            messages: _propTypes2['default'].object,
            getMessage: _propTypes2['default'].func,
            isReadonly: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return _default;
})(React.Component);

exports['default'] = _default;
module.exports = exports['default'];
