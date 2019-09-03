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

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUiStyles = require('material-ui/styles');

var _materialUi = require('material-ui');

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _UpgraderResources = require("./UpgraderResources");

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;
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
            versionError: null,
            watchJob: null,
            upgradePerformed: false
        };
        // TODO REMOVE THIS IS FOR DEBUGGING
        this.state = {
            step: 'ad',
            acceptEula: true,
            licenseKey: "A LICENSE KEY HERE",
            versionAvailable: false,
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
                versionError: null,
                watchJob: null,
                upgradePerformed: false
            });
        }
    }, {
        key: 'next',
        value: function next(step) {
            this.setState({ step: step });
            if (step === "check") {
                var licenseKey = this.state.licenseKey;

                this.findVersion(licenseKey);
            } else if (step === "perform") {
                var versionAvailable = this.state.versionAvailable;

                this.applyUpgrade(versionAvailable.Version);
            }
        }
    }, {
        key: 'findVersion',
        value: function findVersion(licenseKey) {
            var _this = this;

            var currentVersion = this.props.currentVersion;

            var api = new _pydioHttpRestApi.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.UpdateUpdateRequest();
            request.PackageName = "PydioEnterprise";
            request.LicenseInfo = { Key: licenseKey, Save: "true" };
            _pydio2['default'].startLoading();
            this.setState({ versionLoading: true });
            api.updateRequired(request).then(function (res) {
                _pydio2['default'].endLoading();
                if (res.AvailableBinaries) {
                    (function () {
                        var noMatches = [];
                        res.AvailableBinaries.forEach(function (bin) {
                            if (currentVersion === bin.Version) {
                                _this.setState({ versionAvailable: bin });
                            } else {
                                noMatches.push(bin);
                            }
                        });
                        _this.setState({ versionsNoMatch: noMatches });
                    })();
                }
                _this.setState({ versionLoading: false });
            })['catch'](function (e) {
                _pydio2['default'].endLoading();
                _this.setState({ versionLoading: false, versionError: e.message });
            });
        }
    }, {
        key: 'applyUpgrade',
        value: function applyUpgrade(version) {
            var _this2 = this;

            var api = new _pydioHttpRestApi.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.UpdateApplyUpdateRequest();
            req.PackageName = "PydioEnterprise";
            req.TargetVersion = version;
            api.applyUpdate(version, req).then(function (res) {
                if (res.Success) {
                    _this2.setState({ watchJob: res.Message });
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
            var _this3 = this;

            var _state = this.state;
            var step = _state.step;
            var upgradePerformed = _state.upgradePerformed;
            var open = this.props.open;

            var cardMessage = function cardMessage(id) {
                return pydio.MessageHash['admin_dashboard.' + id];
            };
            var accent2Color = this.props.muiTheme.palette.accent2Color;

            var content = undefined,
                actions = undefined;
            var title = "Upgrade to Cells Enterprise";
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
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { style: { float: 'left' }, label: cardMessage('ent.btn.more'), onTouchTap: function () {
                            window.open('https://pydio.com/en/features/pydio-cells-overview');
                        } }), _react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            return _this3.dismiss();
                        }, label: "Cancel", primary: false }), _react2['default'].createElement(_materialUi.RaisedButton, { onTouchTap: function () {
                            _this3.next('eula');
                        }, label: "Start", primary: true })];
                    break;

                case "eula":
                    var acceptEula = this.state.acceptEula;

                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        _react2['default'].createElement(
                            'h5',
                            null,
                            '1. Please Accept End-User License Agreement'
                        ),
                        _react2['default'].createElement(_reactMarkdown2['default'], { source: _UpgraderResources.EnterpriseDistEULA }),
                        _react2['default'].createElement(_materialUi.Checkbox, { label: "I thereby accept this EULA", checked: acceptEula, onCheck: function (e, v) {
                                _this3.setState({ acceptEula: v });
                            } })
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            return _this3.dismiss();
                        }, label: "Cancel", primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            _this3.next('license');
                        }, label: "Next", primary: true, disabled: !acceptEula })];
                    break;

                case "license":
                    var licenseKey = this.state.licenseKey;

                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        _react2['default'].createElement(
                            'h5',
                            null,
                            '2. Enter a valid license key (provided by a Pydio sales representative).'
                        ),
                        _react2['default'].createElement(
                            'div',
                            null,
                            'If you do not own one, you can receive a trial key by contacting sales using the button below or directly via ',
                            _react2['default'].createElement(
                                'a',
                                { href: "mailto:services@pydio.com" },
                                'services@pydio.com'
                            )
                        ),
                        _react2['default'].createElement(_materialUi.TextField, {
                            value: licenseKey,
                            onChange: function (e, v) {
                                _this3.setState({ licenseKey: v });
                            },
                            floatingLabelText: "Paste key here...",
                            floatingLabelFixed: true,
                            multiLine: true,
                            rowsMax: 16,
                            rows: 10,
                            fullWidth: true
                        })
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { style: { float: 'left' }, label: cardMessage('ent.btn.contact'), onTouchTap: function () {
                            window.open('https://pydio.com/en/pricing/contact');
                        }, secondary: true }), _react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            return _this3.dismiss();
                        }, label: "Cancel", primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            _this3.next('check');
                        }, label: "Next", primary: true, disabled: !licenseKey })];
                    break;

                case "check":
                    var _state2 = this.state,
                        versionLoading = _state2.versionLoading,
                        versionAvailable = _state2.versionAvailable,
                        versionsNoMatch = _state2.versionsNoMatch,
                        versionError = _state2.versionError;

                    content = _react2['default'].createElement(
                        'div',
                        { style: Styles.body },
                        versionLoading && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. Looking for the closest Cells Enterprise version'
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { display: 'flex', width: '100%', height: 320, alignItems: 'center', justifyContent: 'center' } },
                                _react2['default'].createElement(_materialUi.CircularProgress, null)
                            )
                        ),
                        versionError && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. Cannot load available versions for Cells Enterprise!'
                            ),
                            _react2['default'].createElement(
                                'div',
                                null,
                                'Error was: ',
                                versionError
                            )
                        ),
                        versionAvailable && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. Ready to install ',
                                versionAvailable.Label,
                                '!'
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { backgroundColor: '#ECEFF1', padding: 16, borderRadius: 2, marginBottom: 20 } },
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    'Released'
                                ),
                                ': ',
                                new Date(versionAvailable.ReleaseDate * 1000).toISOString(),
                                _react2['default'].createElement('br', null),
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    'Architecture'
                                ),
                                ': ',
                                versionAvailable.BinaryOS,
                                ' - ',
                                versionAvailable.BinaryArch,
                                _react2['default'].createElement('br', null),
                                _react2['default'].createElement(
                                    'u',
                                    null,
                                    'Description'
                                ),
                                ': ',
                                versionAvailable.Description,
                                _react2['default'].createElement('br', null)
                            ),
                            _react2['default'].createElement(
                                'p',
                                null,
                                'Hitting Next will now download this new version and replace your current Cells binary. A backup of the original executable will be made inside your cells config folder (under CELLS_CONFIG/services/pydio.grpc.update), if you need to recover it.'
                            )
                        ),
                        !versionAvailable && versionsNoMatch && versionsNoMatch.length > 0 && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(
                                'h5',
                                null,
                                '3. Could not find a similar version for Cells Enterprise!'
                            ),
                            _react2['default'].createElement(
                                'div',
                                null,
                                'To avoid mixing upgrade and updates, we recommend upgrading Cells Home to Enterprise on the same version.',
                                _react2['default'].createElement('br', null),
                                'Please first update your current version to one of the following, then retry upgrading to Cells Enterprise.',
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
                        )
                    );
                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            return _this3.dismiss();
                        }, label: "Cancel", primary: false }), _react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            _this3.next('perform');
                        }, label: "Next", primary: true, disabled: !versionAvailable })];
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
                                    _this3.upgradeFinished();
                                }
                            })
                        );
                    } else {
                        content = _react2['default'].createElement(
                            'div',
                            { style: Styles.body },
                            'Launching upgrade please wait...'
                        );
                    }

                    actions = [_react2['default'].createElement(_materialUi.FlatButton, { onTouchTap: function () {
                            return _this3.dismiss();
                        }, label: "Close", primary: true })];
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
