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

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _Field = require('./Field');

var _Field2 = _interopRequireDefault(_Field);

var _Permissions = require('./Permissions');

var _Permissions2 = _interopRequireDefault(_Permissions);

var _TargetedUsers = require('./TargetedUsers');

var _TargetedUsers2 = _interopRequireDefault(_TargetedUsers);

var _materialUi = require('material-ui');

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _compositeCompositeModel = require('../composite/CompositeModel');

var _compositeCompositeModel2 = _interopRequireDefault(_compositeCompositeModel);

/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Pydio$requireLib = _pydio2['default'].requireLib('form');

var ValidPassword = _Pydio$requireLib.ValidPassword;

var PublicLinkPanel = (function (_React$Component) {
    _inherits(PublicLinkPanel, _React$Component);

    function PublicLinkPanel() {
        var _this = this;

        _classCallCheck(this, PublicLinkPanel);

        _get(Object.getPrototypeOf(PublicLinkPanel.prototype), 'constructor', this).apply(this, arguments);

        this.state = { showTemporaryPassword: false, temporaryPassword: null, saving: false };

        this.toggleLink = function () {
            var _props = _this.props;
            var linkModel = _props.linkModel;
            var pydio = _props.pydio;
            var showTemporaryPassword = _this.state.showTemporaryPassword;

            if (showTemporaryPassword) {
                _this.setState({ showTemporaryPassword: false, temporaryPassword: null });
            } else if (!linkModel.getLinkUuid() && _mainShareHelper2['default'].getAuthorizations().password_mandatory) {
                _this.setState({ showTemporaryPassword: true, temporaryPassword: '' });
            } else {
                _this.setState({ saving: true });
                if (linkModel.getLinkUuid()) {
                    _this.props.compositeModel.deleteLink(linkModel)['catch'](function () {
                        _this.setState({ saving: false });
                    }).then(function () {
                        _this.setState({ saving: false });
                    });
                } else {
                    linkModel.save()['catch'](function () {
                        _this.setState({ saving: false });
                    }).then(function () {
                        _this.setState({ saving: false });
                    });
                }
            }
        };

        this.updateTemporaryPassword = function (value, event) {
            if (value === undefined) {
                value = event.currentTarget.getValue();
            }
            _this.setState({ temporaryPassword: value });
        };

        this.enableLinkWithPassword = function () {
            var linkModel = _this.props.linkModel;
            var temporaryPasswordState = _this.state.temporaryPasswordState;

            if (!temporaryPasswordState) {
                _this.props.pydio.UI.displayMessage('ERROR', 'Invalid Password');
                return;
            }
            linkModel.setCreatePassword(_this.state.temporaryPassword);
            try {
                linkModel.save();
            } catch (e) {
                _this.props.pydio.UI.displayMessage('ERROR', e.message);
            }
            _this.setState({ showTemporaryPassword: false, temporaryPassword: null });
        };
    }

    _createClass(PublicLinkPanel, [{
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _props2 = this.props;
            var linkModel = _props2.linkModel;
            var pydio = _props2.pydio;
            var compositeModel = _props2.compositeModel;
            var _state = this.state;
            var showTemporaryPassword = _state.showTemporaryPassword;
            var temporaryPassword = _state.temporaryPassword;
            var saving = _state.saving;

            var authorizations = _mainShareHelper2['default'].getAuthorizations();
            var nodeLeaf = compositeModel.getNode().isLeaf();
            var canEnable = nodeLeaf && authorizations.file_public_link || !nodeLeaf && authorizations.folder_public_link;

            var publicLinkPanes = undefined,
                publicLinkField = undefined;
            if (linkModel.getLinkUuid()) {
                publicLinkField = _react2['default'].createElement(_Field2['default'], {
                    pydio: pydio,
                    linkModel: linkModel,
                    showMailer: this.props.showMailer,
                    editAllowed: authorizations.editable_hash && linkModel.isEditable(),
                    key: 'public-link'
                });
                publicLinkPanes = [_react2['default'].createElement(_materialUi.Divider, null), _react2['default'].createElement(_Permissions2['default'], {
                    compositeModel: compositeModel,
                    linkModel: linkModel,
                    pydio: pydio,
                    key: 'public-perm'
                })];
                if (linkModel.getLink().TargetUsers) {
                    publicLinkPanes.push(_react2['default'].createElement(_materialUi.Divider, null));
                    publicLinkPanes.push(_react2['default'].createElement(_TargetedUsers2['default'], { linkModel: linkModel, pydio: pydio }));
                }
            } else if (showTemporaryPassword) {
                publicLinkField = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(
                        'div',
                        { className: 'section-legend', style: { marginTop: 20 } },
                        this.props.getMessage('215')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { width: '100%' } },
                        _react2['default'].createElement(ValidPassword, {
                            attributes: { label: this.props.getMessage('23') },
                            value: temporaryPassword,
                            onChange: this.updateTemporaryPassword.bind(this),
                            onValidStatusChange: function (s) {
                                return _this2.setState({ temporaryPasswordState: s });
                            }
                        })
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { textAlign: 'center', marginTop: 20 } },
                        _react2['default'].createElement(_materialUi.RaisedButton, { label: this.props.getMessage('92'), secondary: true, onClick: this.enableLinkWithPassword.bind(this), disabled: !this.state.temporaryPasswordState })
                    )
                );
            } else if (!canEnable) {
                publicLinkField = _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                    this.props.getMessage(nodeLeaf ? '225' : '226')
                );
            } else {
                publicLinkField = _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.43)', paddingBottom: 16, paddingTop: 16 } },
                    this.props.getMessage('190')
                );
            }
            return _react2['default'].createElement(
                'div',
                { style: this.props.style },
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '15px 10px 11px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: 15 } },
                    _react2['default'].createElement(_materialUi.Toggle, {
                        disabled: this.props.isReadonly() || saving || !linkModel.isEditable() || !linkModel.getLinkUuid() && !canEnable,
                        onToggle: this.toggleLink,
                        toggled: linkModel.getLinkUuid() || showTemporaryPassword,
                        label: this.props.getMessage('189')
                    })
                ),
                saving && _react2['default'].createElement(
                    'div',
                    { style: { width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    _react2['default'].createElement(_materialUi.CircularProgress, null)
                ),
                !saving && _react2['default'].createElement(
                    'div',
                    { style: { padding: 20 } },
                    publicLinkField
                ),
                !saving && publicLinkPanes
            );
        }
    }], [{
        key: 'propTypes',
        value: {
            linkModel: _propTypes2['default'].instanceOf(_LinkModel2['default']),
            compositeModel: _propTypes2['default'].instanceOf(_compositeCompositeModel2['default']),
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']),
            authorizations: _propTypes2['default'].object,
            showMailer: _propTypes2['default'].func
        },
        enumerable: true
    }]);

    return PublicLinkPanel;
})(_react2['default'].Component);

exports['default'] = PublicLinkPanel = (0, _ShareContextConsumer2['default'])(PublicLinkPanel);
exports['default'] = PublicLinkPanel;
module.exports = exports['default'];
