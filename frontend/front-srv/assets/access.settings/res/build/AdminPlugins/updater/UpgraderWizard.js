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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _UpgraderResources = require("./UpgraderResources");

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var SingleJobProgress = _Pydio$requireLib.SingleJobProgress;

var Styles = {
    body: {
        padding: 20,
        color: '#424242',
        fontSize: 13,
        minHeight: 240
    }
};

var UpgraderWizard = (function (_React$Component) {
    _inherits(UpgraderWizard, _React$Component);

    function UpgraderWizard(props) {
        _classCallCheck(this, UpgraderWizard);

        _get(Object.getPrototypeOf(UpgraderWizard.prototype), 'constructor', this).call(this, props);
        this.state = {
            step: 'ad',
            acceptEula: false,
            licenseKey: null,
            versionLoading: false,
            versionAvailable: false,
            versionsNoMatch: [],
            versionError: undefined,
            watchJob: null,
            upgradePerformed: false
        };
    }

    _createClass(UpgraderWizard, [{
        key: 'dismiss',
        value: function dismiss() {
            this.props.onDismiss();
            this.setState({
                step: 'ad',
                acceptEula: false,
                licenseKey: null,
                versionLoading: false,
                versionAvailable: false,
                versionError: undefined,
                watchJob: null,
                upgradePerformed: false
            });
        }
    }, {
        key: 'next',
        value: function next(step) {
            var _this = this;

            this.setState({ step: step });
            if (step === "check") {
                var licenseKey = this.state.licenseKey;

                this.findVersion(licenseKey)['catch'](function (e) {
                    // Revert to previous step.
                    _this.setState({ step: 'license' });
                });
            } else if (step === "perform") {
                var versionAvailable = this.state.versionAvailable;

                this.applyUpgrade(versionAvailable.Version);
            }
        }
    }, {
        key: 'findVersion',
        value: function findVersion(licenseKey) {
            var _this2 = this;

            var currentVersion = this.props.currentVersion;

            var api = new _cellsSdk.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _cellsSdk.UpdateUpdateRequest();
            request.PackageName = "PydioEnterprise";
            request.LicenseInfo = { Key: licenseKey, Save: "true" };
            _pydio2['default'].startLoading();
            this.setState({ versionLoading: true });
            return api.updateRequired(request).then(function (res) {
                _pydio2['default'].endLoading();
                if (res.AvailableBinaries) {
                    (function () {
                        var noMatches = [];
                        res.AvailableBinaries.forEach(function (bin) {
                            if (currentVersion === bin.Version) {
                                _this2.setState({ versionAvailable: bin });
                            } else {
                                noMatches.push(bin);
                            }
                        });
                        _this2.setState({ versionsNoMatch: noMatches });
                    })();
                }
                _this2.setState({ versionLoading: false });
            })['catch'](function (e) {
                _pydio2['default'].endLoading();
                _this2.setState({ versionLoading: false, versionError: e.message });
                throw e;
            });
        }
    }, {
        key: 'applyUpgrade',
        value: function applyUpgrade(version) {
            var _this3 = this;

            var api = new _cellsSdk.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _cellsSdk.UpdateApplyUpdateRequest();
            req.PackageName = "PydioEnterprise";
            req.TargetVersion = version;
            api.applyUpdate(version, req).then(function (res) {
                if (res.Success) {
                    _this3.setState({ watchJob: res.Message });
                } else {
                    pydio.UI.displayMessage('ERROR', res.Message);
                }
            })['catch'](function () {});
        }
    }, {
        key: 'upgradeFinished',
        value: function upgradeFinished() {}
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var step = this.state.step;
            var _props = this.props;
            var open = _props.open;
            var pydio = _props.pydio;
            var muiTheme = _props.muiTheme;

            var cardMessage = function cardMessage(id) {
                return pydio.MessageHash['admin_dashboard.' + id];
            };
            var accent2Color = muiTheme.palette.accent2Color;

            var m = function m(id) {
                return pydio.MessageHash['updater.upgrade.ed.' + id] || id;
            };

            var content = undefined,
                actions = undefined;
            var title = m('title');
            switch (step) {
                case "ad":

                    title = undefined;
                    content = _react2['default'].createElement(
                        _materialUi.Card,
                        { style: { width: '100%' }, zDepth: 0 },
                        _react2['default'].createElement(
                            _materialUi.CardMedia,
                            {
                                overlay: _react2['default'].createElement(_materialUi.CardTitle, { title: cardMessage('ent.title'), subtitle: cardMessage('ent.subtitle') })
                            },
                            _react2['default'].createElement('div', { style: { height: 230, backgroundImage: 'url(plug/access.settings/res/images/dashboard.png)', backgroundSize: 'cover', borderRadius: 0 } })
                        ),
                        _react2['default'].createElement(
                            _materialUi.List,
                            null,
                            _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-certificate' }), primaryText: cardMessage('ent.features'), secondaryText: cardMessage('ent.features.legend') }),
                            _react2['default'].createElement(_materialUi.Divider, null),
                            _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-chart-areaspline' }), primaryText: cardMessage('ent.advanced'), secondaryText: cardMessage('ent.advanced.legend') }),
                            _react2['default'].createElement(_materialUi.Divider, null),
                            _react2['default'].createElement(_materialUi.ListItem, { leftIcon: _react2['default'].createElement(_materialUi.FontIcon, { style: { color: accent2Color }, className: 'mdi mdi-message-alert' }), primaryText: cardMessage('ent.support'), secondaryText: cardMessage('ent.support.legend') })
                        )
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { style: { float: 'left' }, label: cardMessage('ent.btn.more'), onClick: function () {
                            window.open('https://pydio.com/en/features/pydio-cells-overview');
                        } }), _react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            return _this4.dismiss();
                        }, label: m('button.cancel'), primary: false }), _react2['default'].createElement(_materialUi.RaisedButton, { onClick: function () {
                            _this4.next('eula');
                        }, label: m('button.start'), primary: true })];
                    break;

                case "eula":
                    var acceptEula = this.state.acceptEula;

                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        _react2['default'].createElement(
                            'h5',
                            null,
                            '1. ',
                            m('eula.title')
                        ),
                        _react2['default'].createElement(_reactMarkdown2['default'], { source: _UpgraderResources.EnterpriseDistEULA }),
                        _react2['default'].createElement(_materialUi.Checkbox, { label: m('eula.check'), checked: acceptEula, onCheck: function (e, v) {
                                _this4.setState({ acceptEula: v });
                            } })
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            return _this4.dismiss();
                        }, label: m('button.cancel'), primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            _this4.next('license');
                        }, label: m('button.next'), primary: true, disabled: !acceptEula })];
                    break;

                case "license":
                    var _state = this.state,
                        licenseKey = _state.licenseKey,
                        versionError = _state.versionError;

                    var errorText = undefined;
                    if (versionError) {
                        errorText = m('version.error') + ' : ' + versionError;
                    }
                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        _react2['default'].createElement(
                            'h5',
                            null,
                            '2. ',
                            m('key.title')
                        ),
                        _react2['default'].createElement(
                            'div',
                            null,
                            m('key.legend'),
                            ' ',
                            _react2['default'].createElement(
                                'a',
                                { href: "mailto:services@pydio.com" },
                                'services@pydio.com'
                            )
                        ),
                        _react2['default'].createElement(_materialUi.TextField, {
                            value: licenseKey,
                            onChange: function (e, v) {
                                _this4.setState({ licenseKey: v, versionError: undefined });
                            },
                            floatingLabelText: m('key.hint'),
                            floatingLabelFixed: true,
                            multiLine: true,
                            rowsMax: 16,
                            rows: 10,
                            fullWidth: true,
                            errorText: errorText
                        })
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { style: { float: 'left' }, label: cardMessage('ent.btn.contact'), onClick: function () {
                            window.open('https://pydio.com/en/pricing/contact');
                        }, secondary: true }), _react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            return _this4.dismiss();
                        }, label: m('button.cancel'), primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            _this4.next('check');
                        }, label: m('button.next'), primary: true, disabled: !licenseKey })];
                    break;

                case "check":
                    var _state2 = this.state,
                        versionLoading = _state2.versionLoading,
                        versionAvailable = _state2.versionAvailable,
                        versionsNoMatch = _state2.versionsNoMatch;

                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        versionLoading && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. ',
                                m('version.loading')
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { display: 'flex', width: '100%', height: 320, alignItems: 'center', justifyContent: 'center' } },
                                _react2['default'].createElement(_materialUi.CircularProgress, null)
                            )
                        ),
                        versionAvailable && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. ',
                                m('version.available').replace('%s', versionAvailable.Label)
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { backgroundColor: '#ECEFF1', padding: 16, borderRadius: 2, marginBottom: 20 } },
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    m('version.released')
                                ),
                                ': ',
                                new Date(versionAvailable.ReleaseDate * 1000).toISOString(),
                                _react2['default'].createElement('br', null),
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    m('version.arch')
                                ),
                                ': ',
                                versionAvailable.BinaryOS,
                                ' - ',
                                versionAvailable.BinaryArch,
                                _react2['default'].createElement('br', null),
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    m('version.description')
                                ),
                                ': ',
                                versionAvailable.Description,
                                _react2['default'].createElement('br', null)
                            ),
                            _react2['default'].createElement(
                                'p',
                                null,
                                m('version.legend').replace('%s', 'CELLS_CONFIG/services/pydio.grpc.update')
                            )
                        ),
                        !versionAvailable && versionsNoMatch && versionsNoMatch.length > 0 && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. ',
                                m('version.nomatch')
                            ),
                            _react2['default'].createElement(
                                'div',
                                null,
                                m('version.nomatch.legend1'),
                                _react2['default'].createElement('br', null),
                                m('version.nomatch.legend2'),
                                _react2['default'].createElement(
                                    'ul',
                                    null,
                                    versionsNoMatch.map(function (bin) {
                                        return _react2['default'].createElement(
                                            'li',
                                            null,
                                            '> ',
                                            bin.Version
                                        );
                                    })
                                )
                            )
                        ),
                        !versionLoading && !versionAvailable && (!versionsNoMatch || versionsNoMatch.length === 0) && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. ',
                                m('version.nomatch')
                            ),
                            _react2['default'].createElement(
                                'div',
                                null,
                                m('version.nomatch.legend1')
                            )
                        )
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            return _this4.dismiss();
                        }, label: m('button.cancel'), primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            _this4.next('perform');
                        }, label: m('button.install'), primary: true, disabled: !versionAvailable })];
                    break;

                case "perform":
                    var watchJob = this.state.watchJob;

                    if (watchJob) {
                        content = _react2['default'].createElement(
                            'div',
                            { style: Styles.body },
                            _react2['default'].createElement(SingleJobProgress, {
                                jobID: watchJob,
                                progressStyle: { paddingTop: 16 },
                                lineStyle: { userSelect: 'text' },
                                onEnd: function () {
                                    _this4.upgradeFinished();
                                }
                            })
                        );
                    } else {
                        content = _react2['default'].createElement(
                            'div',
                            { style: Styles.body },
                            m('installing')
                        );
                    }

                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onClick: function () {
                            return _this4.dismiss();
                        }, label: m('button.close'), primary: true })];
                    break;

                default:
                    break;
            }

            return _react2['default'].createElement(
                _materialUi.Dialog,
                {
                    title: title,
                    bodyStyle: { padding: 0 },
                    autoScrollBodyContent: true,
                    modal: true,
                    open: open,
                    actions: actions
                },
                content
            );
        }
    }]);

    return UpgraderWizard;
})(_react2['default'].Component);

exports['default'] = UpgraderWizard = (0, _materialUiStyles.muiThemeable)()(UpgraderWizard);
exports['default'] = UpgraderWizard;
module.exports = exports['default'];
