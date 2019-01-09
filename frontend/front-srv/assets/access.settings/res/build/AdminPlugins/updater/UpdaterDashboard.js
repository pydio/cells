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

var _materialUi = require('material-ui');

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _coreServiceExposedConfigs = require('../core/ServiceExposedConfigs');

var _coreServiceExposedConfigs2 = _interopRequireDefault(_coreServiceExposedConfigs);

var _Pydio$requireLib = _pydio2['default'].requireLib('boot');

var moment = _Pydio$requireLib.moment;
var Loader = _Pydio$requireLib.Loader;
var SingleJobProgress = _Pydio$requireLib.SingleJobProgress;

var UpdaterDashboard = _react2['default'].createClass({
    displayName: 'UpdaterDashboard',

    mixins: [AdminComponents.MessagesConsumerMixin],

    getInitialState: function getInitialState() {
        return { check: -1 };
    },

    componentDidMount: function componentDidMount() {
        this.checkForUpgrade();
    },

    checkForUpgrade: function checkForUpgrade() {
        var _this = this;

        var pydio = this.props.pydio;

        this.setState({ loading: true });

        var api = new _pydioHttpRestApi.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
        _pydio2['default'].startLoading();
        api.updateRequired().then(function (res) {
            _pydio2['default'].endLoading();
            var hasBinary = 0;
            if (res.AvailableBinaries) {
                hasBinary = res.AvailableBinaries.length;
                _this.setState({ packages: res.AvailableBinaries });
            } else {
                _this.setState({ no_upgrade: true });
            }
            var node = pydio.getContextNode();
            node.getMetadata().set('flag', hasBinary);
            AdminComponents.MenuItemListener.getInstance().notify("item_changed");
            _this.setState({ loading: false });
        })['catch'](function () {
            _pydio2['default'].endLoading();
            _this.setState({ loading: false });
        });
    },

    upgradeFinished: function upgradeFinished() {
        var pydio = this.props.pydio;

        this.setState({ updateApplied: this.state.selectedPackage.Version });
        var node = pydio.getContextNode();
        node.getMetadata().set('flag', 0);
        AdminComponents.MenuItemListener.getInstance().notify("item_changed");
    },

    performUpgrade: function performUpgrade() {
        var _this2 = this;

        var pydio = this.props.pydio;
        var _state = this.state;
        var check = _state.check;
        var packages = _state.packages;

        if (check < 0 || !packages[check]) {
            alert('Please select at least one package!');
            return;
        }

        if (confirm(this.context.getMessage('15', 'updater'))) {

            var toApply = packages[check];
            var version = toApply.Version;
            var api = new _pydioHttpRestApi.UpdateServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.applyUpdate(version).then(function (res) {
                if (res.Success) {
                    _this2.setState({ watchJob: res.Message });
                } else {
                    pydio.UI.displayMessage('ERROR', res.Message);
                }
            })['finally'](function () {});
        }
    },

    onCheckStateChange: function onCheckStateChange(index, value, pack) {
        if (value) {
            this.setState({ check: index, selectedPackage: pack });
        } else {
            this.setState({ check: -1, selectedPackage: null });
        }
    },

    render: function render() {
        var _this3 = this;

        var list = null;
        var pydio = this.props.pydio;
        var _state2 = this.state;
        var packages = _state2.packages;
        var check = _state2.check;
        var loading = _state2.loading;
        var dirty = _state2.dirty;
        var updateApplied = _state2.updateApplied;
        var selectedPackage = _state2.selectedPackage;
        var watchJob = _state2.watchJob;

        var subHeaderStyle = {
            backgroundColor: '#f5f5f5',
            color: '#9e9e9e',
            fontSize: 12,
            fontWeight: 500,
            borderBottom: '1px solid #e0e0e0',
            height: 48,
            lineHeight: '48px',
            padding: '0 16px'
        };

        var buttons = [];
        if (packages) {
            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, { disabled: check < 0 || updateApplied, secondary: true, label: this.context.getMessage('4', 'updater'), onTouchTap: this.performUpgrade }));
            var items = [];

            var _loop = function (index) {
                var p = packages[index];
                items.push(_react2['default'].createElement(_materialUi.ListItem, {
                    leftCheckbox: _react2['default'].createElement(_materialUi.Checkbox, { key: p, onCheck: function (e, v) {
                            return _this3.onCheckStateChange(index, v, p);
                        }, checked: check >= index, disabled: updateApplied || check > index }),
                    primaryText: p.PackageName + ' ' + p.Version,
                    secondaryText: p.Label + ' - ' + moment(new Date(p.ReleaseDate * 1000)).fromNow()
                }));
                items.push(_react2['default'].createElement(_materialUi.Divider, null));
            };

            for (var index = packages.length - 1; index >= 0; index--) {
                _loop(index);
            }
            items.pop();
            list = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: subHeaderStyle },
                    this.context.getMessage('16', 'updater')
                ),
                _react2['default'].createElement(
                    _materialUi.List,
                    null,
                    items
                )
            );
        } else if (loading) {
            list = _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: subHeaderStyle },
                    this.context.getMessage('16', 'updater')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    this.context.getMessage('17', 'updater')
                )
            );
        } else {
            list = _react2['default'].createElement(
                'div',
                { style: { minHeight: 36 } },
                _react2['default'].createElement(
                    'div',
                    { style: subHeaderStyle },
                    this.context.getMessage('20', 'updater')
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: '16px 16px 32px' } },
                    _react2['default'].createElement(
                        'span',
                        { style: { float: 'right' } },
                        _react2['default'].createElement(_materialUi.RaisedButton, { secondary: true, label: this.context.getMessage('20', 'updater'), onTouchTap: this.checkForUpgrade })
                    ),
                    this.state && this.state.no_upgrade ? this.context.getMessage('18', 'updater') : this.context.getMessage('19', 'updater')
                )
            );
        }

        if (dirty) {
            buttons.push(_react2['default'].createElement(_materialUi.RaisedButton, { style: { marginLeft: 10 }, secondary: true, label: "Save Configs", onTouchTap: function () {
                    _this3.refs.serviceConfigs.save().then(function (res) {
                        _this3.setState({ dirty: false });
                    });
                } }));
        }

        var backend = pydio.Parameters.get("backend");

        return _react2['default'].createElement(
            'div',
            { className: "main-layout-nav-to-stack vertical-layout people-dashboard" },
            _react2['default'].createElement(AdminComponents.Header, {
                title: this.context.getMessage('2', 'updater'),
                icon: 'mdi mdi-update',
                actions: buttons,
                reloadAction: function () {
                    _this3.checkForUpgrade();
                },
                loading: loading
            }),
            _react2['default'].createElement(
                'div',
                { style: { flex: 1, overflow: 'auto' } },
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: 16 }, zDepth: 1 },
                    _react2['default'].createElement(
                        'div',
                        { style: subHeaderStyle },
                        'Current Version'
                    ),
                    _react2['default'].createElement(
                        _materialUi.List,
                        { style: { padding: '0 16px' } },
                        _react2['default'].createElement(_materialUi.ListItem, { primaryText: backend.PackageLabel + ' ' + backend.Version, disabled: true, secondaryTextLines: 2, secondaryText: _react2['default'].createElement(
                                'span',
                                null,
                                "Released : " + backend.BuildStamp,
                                _react2['default'].createElement('br', null),
                                "Revision : " + backend.BuildRevision
                            ) })
                    )
                ),
                watchJob && _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: '0 16px', position: 'relative' }, zDepth: 1 },
                    _react2['default'].createElement(
                        'div',
                        { style: subHeaderStyle },
                        selectedPackage ? selectedPackage.PackageName + ' ' + selectedPackage.Version : ''
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 16 } },
                        _react2['default'].createElement(SingleJobProgress, { jobID: watchJob, progressStyle: { paddingTop: 16 }, onEnd: function () {
                                _this3.upgradeFinished();
                            } })
                    )
                ),
                !watchJob && list && _react2['default'].createElement(
                    _materialUi.Paper,
                    { style: { margin: '0 16px', position: 'relative' }, zDepth: 1 },
                    list
                ),
                !watchJob && _react2['default'].createElement(_coreServiceExposedConfigs2['default'], {
                    className: "row-flex",
                    serviceName: "pydio.grpc.update",
                    ref: "serviceConfigs",
                    onDirtyChange: function (d) {
                        return _this3.setState({ dirty: d });
                    }
                })
            )
        );
    }

});

exports['default'] = UpdaterDashboard;
module.exports = exports['default'];
