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

var _mainGenericCard = require('../main/GenericCard');

var _compositeCompositeModel = require('../composite/CompositeModel');

var _compositeCompositeModel2 = _interopRequireDefault(_compositeCompositeModel);

var _mainGenericEditor = require('../main/GenericEditor');

var _mainGenericEditor2 = _interopRequireDefault(_mainGenericEditor);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _linksPanel = require('../links/Panel');

var _linksPanel2 = _interopRequireDefault(_linksPanel);

var _linksSecureOptions = require('../links/SecureOptions');

var _linksSecureOptions2 = _interopRequireDefault(_linksSecureOptions);

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _Mailer = require('./Mailer');

var _Mailer2 = _interopRequireDefault(_Mailer);

var _CellsList = require('./CellsList');

var _CellsList2 = _interopRequireDefault(_CellsList);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _linksPublicLinkTemplate = require('../links/PublicLinkTemplate');

var _linksPublicLinkTemplate2 = _interopRequireDefault(_linksPublicLinkTemplate);

var _linksVisibilityPanel = require('../links/VisibilityPanel');

var _linksVisibilityPanel2 = _interopRequireDefault(_linksVisibilityPanel);

var _linksLabelPanel = require('../links/LabelPanel');

var _linksLabelPanel2 = _interopRequireDefault(_linksLabelPanel);

var _materialUi = require('material-ui');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var PaletteModifier = _Pydio$requireLib.PaletteModifier;

var _Pydio$requireLib2 = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib2.Tooltip;

var CompositeCard = (function (_React$Component) {
    _inherits(CompositeCard, _React$Component);

    function CompositeCard(props) {
        _classCallCheck(this, CompositeCard);

        _get(Object.getPrototypeOf(CompositeCard.prototype), 'constructor', this).call(this, props);
        this.state = {
            mode: this.props.mode || 'view',
            model: new _compositeCompositeModel2['default'](this.props.mode === 'edit')
        };
    }

    _createClass(CompositeCard, [{
        key: 'attachClipboard',
        value: function attachClipboard() {
            var pydio = this.props.pydio;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };
            var model = this.state.model;

            this.detachClipboard();
            if (!model.getLinks().length) {
                return;
            }
            var linkModel = model.getLinks()[0];
            if (!linkModel.getLink()) {
                return;
            }
            if (this.refs['copy-button']) {
                this._clip = new _clipboard2['default'](this.refs['copy-button'], {
                    text: (function (trigger) {
                        return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
                    }).bind(this)
                });
                this._clip.on('success', (function () {
                    var _this = this;

                    this.setState({ copyMessage: m('192') }, function () {
                        setTimeout(function () {
                            _this.setState({ copyMessage: null });
                        }, 2500);
                    });
                }).bind(this));
                this._clip.on('error', (function () {
                    var _this2 = this;

                    var copyMessage = undefined;
                    if (global.navigator.platform.indexOf("Mac") === 0) {
                        copyMessage = m(144);
                    } else {
                        copyMessage = m(143);
                    }
                    this.setState({ copyMessage: copyMessage }, function () {
                        setTimeout(function () {
                            _this2.setState({ copyMessage: null });
                        }, 2500);
                    });
                }).bind(this));
            }
        }
    }, {
        key: 'detachClipboard',
        value: function detachClipboard() {
            if (this._clip) {
                this._clip.destroy();
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            var _props = this.props;
            var node = _props.node;
            var mode = _props.mode;

            this.state.model.observe("update", function () {
                _this3.forceUpdate();
            });
            this.state.model.load(node, mode === 'infoPanel');
            this.attachClipboard();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.state.model.stopObserving("update");
            this.detachClipboard();
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.attachClipboard();
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            if (props.node && (props.node !== this.props.node || props.node.getMetadata('pydio_shares') !== this.props.node.getMetadata('pydio_shares'))) {
                this.state.model.load(props.node, props.mode === 'infoPanel');
            }
        }
    }, {
        key: 'usersInvitations',
        value: function usersInvitations(userObjects, cellModel) {
            _mainShareHelper2['default'].sendCellInvitation(this.props.node, cellModel, userObjects);
        }
    }, {
        key: 'linkInvitation',
        value: function linkInvitation(linkModel) {
            try {
                var mailData = _mainShareHelper2['default'].prepareEmail(this.props.node, linkModel);
                this.setState({ mailerData: _extends({}, mailData, { users: [], linkModel: linkModel }) });
            } catch (e) {
                alert(e.message);
            }
        }
    }, {
        key: 'dismissMailer',
        value: function dismissMailer() {
            this.setState({ mailerData: null });
        }
    }, {
        key: 'submit',
        value: function submit() {
            try {
                this.state.model.save();
            } catch (e) {
                this.props.pydio.UI.displayMessage('ERROR', e.message);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _props2 = this.props;
            var node = _props2.node;
            var mode = _props2.mode;
            var pydio = _props2.pydio;
            var editorOneColumn = _props2.editorOneColumn;
            var _state = this.state;
            var model = _state.model;
            var mailerData = _state.mailerData;
            var linkTooltip = _state.linkTooltip;
            var copyMessage = _state.copyMessage;

            var m = function m(id) {
                return pydio.MessageHash['share_center.' + id];
            };

            if (mode === 'edit') {

                var publicLinkModel = undefined;
                if (model.getLinks().length) {
                    publicLinkModel = model.getLinks()[0];
                }
                var header = undefined;
                if (publicLinkModel && publicLinkModel.getLinkUuid() && publicLinkModel.isEditable()) {
                    header = _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_Mailer2['default'], _extends({}, mailerData, { pydio: pydio, onDismiss: this.dismissMailer.bind(this) })),
                        _react2['default'].createElement(_linksLabelPanel2['default'], { pydio: pydio, linkModel: publicLinkModel })
                    );
                } else {
                    header = _react2['default'].createElement(
                        'div',
                        { style: { fontSize: 24, padding: '26px 10px 0 ', lineHeight: '26px' } },
                        _react2['default'].createElement(_Mailer2['default'], _extends({}, mailerData, { pydio: pydio, onDismiss: this.dismissMailer.bind(this) })),
                        m(256).replace('%s', node.getLabel())
                    );
                }
                var tabs = { left: [], right: [], leftStyle: { padding: 0 } };
                tabs.right.push({
                    Label: m(250),
                    Value: "cells",
                    Component: _react2['default'].createElement(_CellsList2['default'], { pydio: pydio, compositeModel: model, usersInvitations: this.usersInvitations.bind(this), style: editorOneColumn ? { padding: 10 } : {} })
                });
                var links = model.getLinks();
                if (publicLinkModel) {
                    tabs.left.push({
                        Label: m(251),
                        Value: 'public-link',
                        Component: _react2['default'].createElement(_linksPanel2['default'], {
                            pydio: pydio,
                            compositeModel: model,
                            linkModel: links[0],
                            showMailer: _mainShareHelper2['default'].mailerSupported(pydio) ? this.linkInvitation.bind(this) : null
                        })
                    });
                    if (publicLinkModel.getLinkUuid()) {

                        var layoutData = _mainShareHelper2['default'].compileLayoutData(pydio, model);
                        var templatePane = undefined;
                        if (layoutData.length > 1) {
                            templatePane = _react2['default'].createElement(_linksPublicLinkTemplate2['default'], {
                                linkModel: publicLinkModel,
                                pydio: pydio,
                                layoutData: layoutData,
                                style: { padding: '10px 16px' },
                                readonly: model.getNode().isLeaf()
                            });
                        }
                        tabs.left.push({
                            Label: m(252),
                            Value: 'link-secure',
                            Component: _react2['default'].createElement(
                                'div',
                                null,
                                _react2['default'].createElement(_linksSecureOptions2['default'], { pydio: pydio, linkModel: links[0] }),
                                templatePane && _react2['default'].createElement(_materialUi.Divider, null),
                                templatePane
                            )
                        });
                        if (links[0].isEditable()) {
                            tabs.left.push({
                                Label: m(253),
                                Value: 'link-visibility',
                                Component: _react2['default'].createElement(_linksVisibilityPanel2['default'], { pydio: pydio, linkModel: links[0] }),
                                AlwaysLast: true
                            });
                        }
                    }
                }

                return _react2['default'].createElement(_mainGenericEditor2['default'], {
                    tabs: tabs,
                    pydio: pydio,
                    header: header,
                    saveEnabled: model.isDirty(),
                    onSaveAction: this.submit.bind(this),
                    onCloseAction: this.props.onDismiss,
                    onRevertAction: function () {
                        model.revertChanges();
                    },
                    editorOneColumn: editorOneColumn,
                    style: { width: '100%', height: null, flex: 1, minHeight: 550, color: 'rgba(0,0,0,.83)', fontSize: 13 }
                });
            } else {
                var _ret = (function () {

                    var lines = [];
                    var cells = [];
                    model.getCells().map(function (cell) {
                        cells.push(cell.getLabel());
                    });
                    if (cells.length) {
                        lines.push(_react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-account-multiple', legend: m(254), data: cells.join(', ') }));
                    }
                    var links = model.getLinks();
                    if (links.length && links[0].getLink()) {
                        var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, links[0].getLink().LinkHash, mode === 'infoPanel');
                        lines.push(_react2['default'].createElement(_mainGenericCard.GenericLine, { iconClassName: 'mdi mdi-link', legend: m(121), style: { overflow: 'visible' }, dataStyle: { overflow: 'visible' }, data: _react2['default'].createElement(
                                'div',
                                {
                                    ref: 'copy-button',
                                    style: { cursor: 'pointer', position: 'relative' },
                                    onMouseOver: function () {
                                        _this4.setState({ linkTooltip: true });
                                    },
                                    onMouseOut: function () {
                                        _this4.setState({ linkTooltip: false });
                                    }
                                },
                                _react2['default'].createElement(Tooltip, {
                                    label: copyMessage ? copyMessage : m(191),
                                    horizontalPosition: "left",
                                    verticalPosition: "top",
                                    show: linkTooltip
                                }),
                                publicLink
                            ) }));
                    }
                    var deleteAction = function deleteAction() {
                        if (confirm(m(255))) {
                            model.stopObserving('update');
                            model.deleteAll().then(function (res) {
                                model.updateUnderlyingNode();
                            });
                        }
                    };
                    return {
                        v: _react2['default'].createElement(
                            _mainGenericCard.GenericCard,
                            {
                                pydio: pydio,
                                title: pydio.MessageHash['share_center.50'],
                                onDismissAction: _this4.props.onDismiss,
                                onDeleteAction: deleteAction,
                                onEditAction: function () {
                                    pydio.Controller.fireAction('share-edit-shared');
                                },
                                headerSmall: mode === 'infoPanel'
                            },
                            lines
                        )
                    };
                })();

                if (typeof _ret === 'object') return _ret.v;
            }
        }
    }]);

    return CompositeCard;
})(_react2['default'].Component);

exports['default'] = CompositeCard = PaletteModifier({ primary1Color: '#009688' })(CompositeCard);
exports['default'] = CompositeCard;
module.exports = exports['default'];
