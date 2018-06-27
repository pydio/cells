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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _ShareContextConsumer = require('../ShareContextConsumer');

var _ShareContextConsumer2 = _interopRequireDefault(_ShareContextConsumer);

var _TargetedUsers = require('./TargetedUsers');

var _TargetedUsers2 = _interopRequireDefault(_TargetedUsers);

var _materialUi = require('material-ui');

var _qrcodeReact = require('qrcode.react');

var _qrcodeReact2 = _interopRequireDefault(_qrcodeReact);

var _clipboard = require('clipboard');

var _clipboard2 = _interopRequireDefault(_clipboard);

var _mainActionButton = require('../main/ActionButton');

var _mainActionButton2 = _interopRequireDefault(_mainActionButton);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _materialUiStyles = require('material-ui/styles');

var _mainShareHelper = require('../main/ShareHelper');

var _mainShareHelper2 = _interopRequireDefault(_mainShareHelper);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _LinkModel = require('./LinkModel');

var _LinkModel2 = _interopRequireDefault(_LinkModel);

var _Pydio$requireLib = _pydio2['default'].requireLib("boot");

var Tooltip = _Pydio$requireLib.Tooltip;

var PublicLinkField = _react2['default'].createClass({
    displayName: 'PublicLinkField',

    propTypes: {
        linkModel: _react2['default'].PropTypes.instanceOf(_LinkModel2['default']),
        editAllowed: _react2['default'].PropTypes.bool,
        onChange: _react2['default'].PropTypes.func,
        showMailer: _react2['default'].PropTypes.func
    },
    getInitialState: function getInitialState() {
        return { editLink: false, copyMessage: '', showQRCode: false };
    },
    toggleEditMode: function toggleEditMode() {
        var linkModel = this.props.linkModel;

        if (this.state.editLink && this.state.customLink) {
            linkModel.setCustomLink(this.state.customLink);
            linkModel.save();
        }
        this.setState({ editLink: !this.state.editLink, customLink: undefined });
    },
    changeLink: function changeLink(event) {
        var value = event.target.value;
        value = _pydioUtilLang2['default'].computeStringSlug(value);
        this.setState({ customLink: value });
    },
    clearCopyMessage: function clearCopyMessage() {
        global.setTimeout((function () {
            this.setState({ copyMessage: '' });
        }).bind(this), 5000);
    },

    attachClipboard: function attachClipboard() {
        var _props = this.props;
        var linkModel = _props.linkModel;
        var pydio = _props.pydio;

        this.detachClipboard();
        if (this.refs['copy-button']) {
            this._clip = new _clipboard2['default'](this.refs['copy-button'], {
                text: (function (trigger) {
                    return _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
                }).bind(this)
            });
            this._clip.on('success', (function () {
                this.setState({ copyMessage: this.props.getMessage('192') }, this.clearCopyMessage);
            }).bind(this));
            this._clip.on('error', (function () {
                var copyMessage = undefined;
                if (global.navigator.platform.indexOf("Mac") === 0) {
                    copyMessage = this.props.getMessage('144');
                } else {
                    copyMessage = this.props.getMessage('143');
                }
                this.refs['public-link-field'].focus();
                this.setState({ copyMessage: copyMessage }, this.clearCopyMessage);
            }).bind(this));
        }
    },
    detachClipboard: function detachClipboard() {
        if (this._clip) {
            this._clip.destroy();
        }
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        this.attachClipboard();
    },

    componentDidMount: function componentDidMount() {
        this.attachClipboard();
    },

    componentWillUnmount: function componentWillUnmount() {
        this.detachClipboard();
    },

    openMailer: function openMailer() {
        this.props.showMailer(this.props.linkModel);
    },

    toggleQRCode: function toggleQRCode() {
        this.setState({ showQRCode: !this.state.showQRCode });
    },

    render: function render() {
        var _this = this;

        var _props2 = this.props;
        var linkModel = _props2.linkModel;
        var pydio = _props2.pydio;

        var publicLink = _mainShareHelper2['default'].buildPublicUrl(pydio, linkModel.getLink().LinkHash);
        var editAllowed = this.props.editAllowed && !this.props.isReadonly() && linkModel.isEditable();
        if (this.state.editLink && editAllowed) {
            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', padding: '0 6px', margin: '0 -6px', borderRadius: 2 } },
                    _react2['default'].createElement(
                        'span',
                        { style: { fontSize: 16, color: 'rgba(0,0,0,0.4)', display: 'inline-block', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                        _pydioUtilPath2['default'].getDirname(publicLink) + '/ '
                    ),
                    _react2['default'].createElement(_materialUi.TextField, { style: { flex: 1, marginRight: 10, marginLeft: 10 }, onChange: this.changeLink, value: this.state.customLink !== undefined ? this.state.customLink : linkModel.getLink().LinkHash }),
                    _react2['default'].createElement(_mainActionButton2['default'], { mdiIcon: 'check', callback: this.toggleEditMode })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'center', fontSize: 13, color: 'rgba(0,0,0,0.43)', paddingTop: 16 } },
                    this.props.getMessage('194')
                )
            );
        } else {
            var _state = this.state;
            var copyMessage = _state.copyMessage;
            var linkTooltip = _state.linkTooltip;

            var setHtml = (function () {
                return { __html: this.state.copyMessage };
            }).bind(this);
            var actionLinks = [],
                qrCode = undefined;
            var muiTheme = this.props.muiTheme;

            actionLinks.push(_react2['default'].createElement(
                'div',
                {
                    key: "copy",
                    ref: 'copy-button',
                    style: { position: 'relative', display: 'inline-block', width: 36, height: 36, padding: '8px 10px', margin: '0 6px', cursor: 'pointer', borderRadius: '50%', border: '1px solid ' + muiTheme.palette.primary1Color },
                    onMouseOver: function () {
                        _this.setState({ linkTooltip: true });
                    },
                    onMouseOut: function () {
                        _this.setState({ linkTooltip: false });
                    }
                },
                _react2['default'].createElement(Tooltip, {
                    label: copyMessage ? copyMessage : this.props.getMessage('191'),
                    horizontalPosition: "center",
                    verticalPosition: "bottom",
                    show: linkTooltip
                }),
                _react2['default'].createElement('span', { className: 'copy-link-button mdi mdi-content-copy', style: { color: muiTheme.palette.primary1Color } })
            ));

            if (this.props.showMailer) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'outline', callback: this.openMailer, mdiIcon: 'email-outline', messageId: '45' }));
            }
            if (editAllowed) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'pencil', callback: this.toggleEditMode, mdiIcon: 'pencil', messageId: "193" }));
            }
            if (_mainShareHelper2['default'].qrcodeEnabled()) {
                actionLinks.push(_react2['default'].createElement(_mainActionButton2['default'], { key: 'qrcode', callback: this.toggleQRCode, mdiIcon: 'qrcode', messageId: '94' }));
            }
            if (actionLinks.length) {
                actionLinks = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', margin: '20px 0 10px' } },
                    _react2['default'].createElement('span', { style: { flex: 1 } }),
                    actionLinks,
                    _react2['default'].createElement('span', { style: { flex: 1 } })
                );
            } else {
                actionLinks = null;
            }
            if (this.state.showQRCode) {
                qrCode = _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1, style: { width: 120, paddingTop: 10, overflow: 'hidden', margin: '0 auto', height: 120, textAlign: 'center' } },
                    _react2['default'].createElement(_qrcodeReact2['default'], { size: 100, value: publicLink, level: 'Q' })
                );
            } else {
                qrCode = _react2['default'].createElement(_materialUi.Paper, { zDepth: 0, style: { width: 120, overflow: 'hidden', margin: '0 auto', height: 0, textAlign: 'center' } });
            }
            return _react2['default'].createElement(
                _materialUi.Paper,
                { zDepth: 0, rounded: false, className: 'public-link-container' },
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(_materialUi.TextField, {
                        type: 'text',
                        name: 'Link',
                        ref: 'public-link-field',
                        value: publicLink,
                        onFocus: function (e) {
                            e.target.select();
                        },
                        fullWidth: true,
                        inputStyle: { textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 },
                        underlineStyle: { borderColor: '#f5f5f5', textDecoration: linkModel.isExpired() ? 'line-through' : null },
                        underlineFocusStyle: { bottom: 0 }
                    })
                ),
                false && this.props.linkData.target_users && _react2['default'].createElement(_TargetedUsers2['default'], this.props),
                actionLinks,
                qrCode
            );
        }
    }
});

exports['default'] = PublicLinkField = (0, _materialUiStyles.muiThemeable)()(PublicLinkField);
exports['default'] = PublicLinkField = (0, _ShareContextConsumer2['default'])(PublicLinkField);
exports['default'] = PublicLinkField;
module.exports = exports['default'];
