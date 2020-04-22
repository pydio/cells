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

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _materialUi = require('material-ui');

var _editorDataSourceEditor = require('../editor/DataSourceEditor');

var _editorDataSourceEditor2 = _interopRequireDefault(_editorDataSourceEditor);

var _editorVersionPolicyEditor = require('../editor/VersionPolicyEditor');

var _editorVersionPolicyEditor2 = _interopRequireDefault(_editorVersionPolicyEditor);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _modelDataSource = require('../model/DataSource');

var _modelDataSource2 = _interopRequireDefault(_modelDataSource);

var _modelWs = require('../model/Ws');

var _modelWs2 = _interopRequireDefault(_modelWs);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _uuid = require('uuid');

var _editorVersionPolicyPeriods = require('../editor/VersionPolicyPeriods');

var _editorVersionPolicyPeriods2 = _interopRequireDefault(_editorVersionPolicyPeriods);

var _EncryptionKeys = require('./EncryptionKeys');

var _EncryptionKeys2 = _interopRequireDefault(_EncryptionKeys);

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var DataSourcesBoard = (function (_React$Component) {
    _inherits(DataSourcesBoard, _React$Component);

    function DataSourcesBoard(props) {
        _classCallCheck(this, DataSourcesBoard);

        _get(Object.getPrototypeOf(DataSourcesBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            dataSources: [],
            versioningPolicies: [],
            dsLoaded: false,
            versionsLoaded: false,
            showExportKey: false,
            exportedKey: null,
            showImportKey: false,
            importResult: null,
            keyOperationError: null,
            startedServices: [],
            peerAddresses: [],
            m: function m(id) {
                return props.pydio.MessageHash["ajxp_admin.ds." + id] || id;
            }
        };
    }

    _createClass(DataSourcesBoard, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            this.statusPoller = setInterval(function () {
                _modelDataSource2['default'].loadStatuses().then(function (data) {
                    _this.setState({ startedServices: data.Services });
                });
                api.listPeersAddresses().then(function (res) {
                    _this.setState({ peerAddresses: res.PeerAddresses || [] });
                });
            }, 2500);
            this.load();
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            clearInterval(this.statusPoller);
        }
    }, {
        key: 'load',
        value: function load() {
            var _this2 = this;

            var newDsName = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this.setState({
                dsLoaded: false,
                versionsLoaded: false,
                newDsName: newDsName
            });
            _modelDataSource2['default'].loadDatasources().then(function (data) {
                _this2.setState({ dataSources: data.DataSources || [], dsLoaded: true });
            });
            _modelDataSource2['default'].loadVersioningPolicies().then(function (data) {
                _this2.setState({ versioningPolicies: data.Policies || [], versionsLoaded: true });
            });
            _modelDataSource2['default'].loadStatuses().then(function (data) {
                _this2.setState({ startedServices: data.Services });
            });
            if (this.refs && this.refs.encKeys) {
                this.refs.encKeys.load();
            }
        }
    }, {
        key: 'closeEditor',
        value: function closeEditor() {
            this.props.closeRightPane();
        }
    }, {
        key: 'openDataSource',
        value: function openDataSource(dataSources) {
            if (!dataSources.length) {
                return;
            }
            var dataSource = dataSources[0];
            var _props = this.props;
            var openRightPane = _props.openRightPane;
            var accessByName = _props.accessByName;
            var pydio = _props.pydio;
            var storageTypes = _props.storageTypes;

            openRightPane({
                COMPONENT: _editorDataSourceEditor2['default'],
                PROPS: {
                    ref: "editor",
                    pydio: pydio,
                    dataSource: dataSource,
                    storageTypes: storageTypes,
                    readonly: !accessByName('CreateDatasource'),
                    closeEditor: this.closeEditor.bind(this),
                    reloadList: this.load.bind(this)
                }
            });
        }
    }, {
        key: 'computeStatus',
        value: function computeStatus(dataSource) {
            var _this3 = this;

            var asNumber = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

            if (asNumber && dataSource.Disabled) {
                return -1;
            }
            var _state = this.state;
            var startedServices = _state.startedServices;
            var peerAddresses = _state.peerAddresses;
            var m = _state.m;
            var newDsName = _state.newDsName;

            if (!startedServices.length) {
                return m('status.na');
            }
            var index = undefined,
                sync = undefined,
                object = undefined;
            startedServices.map(function (service) {
                if (service.Name === 'pydio.grpc.data.sync.' + dataSource.Name && service.Status === 'STARTED') {
                    sync = true;
                } else if (service.Name === 'pydio.grpc.data.index.' + dataSource.Name && service.Status === 'STARTED') {
                    index = true;
                } else if (service.Name === 'pydio.grpc.data.objects.' + dataSource.ObjectsServiceName && service.Status === 'STARTED') {
                    object = true;
                }
            });
            if (index && sync && object) {
                if (newDsName && dataSource.Name === newDsName) {
                    setTimeout(function () {
                        _this3.setState({ newDsName: null });
                    }, 100);
                }
                if (asNumber) {
                    return 0;
                }
                return _react2['default'].createElement(
                    'span',
                    { style: { color: '#1b5e20' } },
                    _react2['default'].createElement('span', { className: "mdi mdi-check" }),
                    ' ',
                    m('status.ok')
                );
            } else if (newDsName && dataSource.Name === newDsName) {
                if (asNumber) {
                    return 1;
                }
                return _react2['default'].createElement(
                    'span',
                    { style: { color: '#ef6c00' } },
                    _react2['default'].createElement('span', { className: "mdi mdi-timer-sand" }),
                    ' ',
                    m('status.starting')
                );
            } else if (!index && !sync && !object) {
                var koMessage = m('status.ko');
                if (peerAddresses && peerAddresses.indexOf(dataSource.PeerAddress) === -1) {
                    koMessage = m('status.ko-peers').replace('%s', dataSource.PeerAddress);
                }
                if (asNumber) {
                    return 2;
                }
                return _react2['default'].createElement(
                    'span',
                    { style: { color: '#e53935' } },
                    _react2['default'].createElement('span', { className: "mdi mdi-alert" }),
                    ' ',
                    koMessage
                );
            } else {
                var services = [];
                if (!index) {
                    services.push(m('status.index'));
                }
                if (!sync) {
                    services.push(m('status.sync'));
                }
                if (!object) {
                    services.push(m('status.object'));
                }
                if (asNumber) {
                    return 3;
                }
                return _react2['default'].createElement(
                    'span',
                    { style: { color: '#e53935' } },
                    _react2['default'].createElement('span', { className: "mdi mdi-alert" }),
                    ' ',
                    services.join(' - ')
                );
            }
        }
    }, {
        key: 'openVersionPolicy',
        value: function openVersionPolicy() {
            var versionPolicies = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            if (versionPolicies !== undefined && !versionPolicies.length) {
                return;
            }
            var versionPolicy = undefined;
            var create = false;
            if (versionPolicies === undefined) {
                create = true;
                versionPolicy = new _pydioHttpRestApi.TreeVersioningPolicy();
                versionPolicy.Uuid = (0, _uuid.v4)();
                versionPolicy.VersionsDataSourceName = "default";
                versionPolicy.VersionsDataSourceBucket = "versions";
                var period = new _pydioHttpRestApi.TreeVersioningKeepPeriod();
                period.IntervalStart = "0";
                period.MaxNumber = -1;
                versionPolicy.KeepPeriods = [period];
            } else {
                versionPolicy = versionPolicies[0];
            }
            var _props2 = this.props;
            var openRightPane = _props2.openRightPane;
            var pydio = _props2.pydio;
            var versioningReadonly = _props2.versioningReadonly;
            var accessByName = _props2.accessByName;

            openRightPane({
                COMPONENT: _editorVersionPolicyEditor2['default'],
                PROPS: {
                    ref: "editor",
                    versionPolicy: versionPolicy,
                    create: create,
                    pydio: pydio,
                    readonly: versioningReadonly || !accessByName('CreateVersioning'),
                    closeEditor: this.closeEditor.bind(this),
                    reloadList: this.load.bind(this)
                }
            });
        }
    }, {
        key: 'deleteVersionPolicy',
        value: function deleteVersionPolicy(policy) {
            var _this4 = this;

            var pydio = this.props.pydio;

            pydio.UI.openConfirmDialog({
                message: pydio.MessageHash['ajxp_admin.versions.editor.delete.confirm'],
                destructive: [policy.Name],
                validCallback: function validCallback() {
                    _pydioHttpResourcesManager2['default'].loadClass('EnterpriseSDK').then(function (sdk) {
                        var api = new sdk.EnterpriseConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
                        api.deleteVersioningPolicy(policy.Uuid).then(function (r) {
                            _this4.load();
                        });
                    });
                }
            });
        }
    }, {
        key: 'createDataSource',
        value: function createDataSource() {
            var _props3 = this.props;
            var pydio = _props3.pydio;
            var storageTypes = _props3.storageTypes;
            var dataSources = this.state.dataSources;

            this.props.openRightPane({
                COMPONENT: _editorDataSourceEditor2['default'],
                PROPS: {
                    ref: "editor",
                    create: true,
                    existingNames: dataSources.map(function (ds) {
                        return ds.Name;
                    }),
                    pydio: pydio,
                    storageTypes: storageTypes,
                    closeEditor: this.closeEditor.bind(this),
                    reloadList: this.load.bind(this)
                }
            });
        }
    }, {
        key: 'resyncDataSource',
        value: function resyncDataSource(pydio, m, row) {
            pydio.UI.openConfirmDialog({
                message: m('editor.legend.resync'),
                skipNext: 'datasource.resync.confirm',
                validCallback: function validCallback() {
                    var ds = new _modelDataSource2['default'](row);
                    ds.resyncSource();
                }
            });
        }
    }, {
        key: 'deleteDataSource',
        value: function deleteDataSource(pydio, m, row) {
            var _this5 = this;

            pydio.UI.openConfirmDialog({
                message: m('editor.delete.warning'),
                validCallback: function validCallback() {
                    var ds = new _modelDataSource2['default'](row);
                    ds.deleteSource().then(function () {
                        _this5.load();
                    });
                },
                destructive: [row.Name]
            });
        }
    }, {
        key: 'createWorkspaceFromDatasource',
        value: function createWorkspaceFromDatasource(pydio, m, row) {
            var ws = new _modelWs2['default']();
            var model = ws.getModel();
            var dsName = row.Name;
            model.Label = dsName;
            model.Description = "Root of " + dsName;
            model.Slug = dsName;
            model.Attributes['DEFAULT_RIGHTS'] = '';
            var roots = model.RootNodes;
            var fakeRoot = { Uuid: 'DATASOURCE:' + dsName, Path: dsName };
            roots[fakeRoot.Uuid] = fakeRoot;
            pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
                dialogTitle: m('board.wsfromds.title'),
                legendId: m('board.wsfromds.legend').replace('%s', dsName),
                fieldLabelId: m('board.wsfromds.field'),
                defaultValue: m('board.wsfromds.defaultPrefix').replace('%s', dsName),
                submitValue: function submitValue(v) {
                    model.Label = v;
                    ws.save().then(function () {
                        pydio.goTo('/data/workspaces');
                    });
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _state2 = this.state;
            var dataSources = _state2.dataSources;
            var versioningPolicies = _state2.versioningPolicies;
            var m = _state2.m;

            dataSources.sort(_pydioUtilLang2['default'].arraySorter('Name'));
            versioningPolicies.sort(_pydioUtilLang2['default'].arraySorter('Name'));

            var adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
            var body = adminStyles.body;
            var tableMaster = body.tableMaster;

            var blockProps = body.block.props;
            var blockStyle = body.block.container;

            var _props4 = this.props;
            var currentNode = _props4.currentNode;
            var pydio = _props4.pydio;
            var versioningReadonly = _props4.versioningReadonly;
            var accessByName = _props4.accessByName;

            var dsColumns = [{ name: 'Name', label: m('name'), style: { fontSize: 15, width: '20%' }, headerStyle: { width: '20%' }, sorter: { type: 'string', 'default': true } }, { name: 'Status', label: m('status'),
                renderCell: function renderCell(row) {
                    return row.Disabled ? _react2['default'].createElement(
                        'span',
                        { style: { color: '#757575' } },
                        _react2['default'].createElement('span', { className: "mdi mdi-checkbox-blank-circle-outline" }),
                        ' ',
                        m('status.disabled')
                    ) : _this6.computeStatus(row);
                },
                sorter: { type: 'number', value: function value(row) {
                        return _this6.computeStatus(row, true);
                    } }
            }, { name: 'StorageType', label: m('storage'), hideSmall: true, style: { width: '20%' }, headerStyle: { width: '20%' }, renderCell: function renderCell(row) {
                    var s = 'storage.fs';
                    switch (row.StorageType) {
                        case "S3":
                            s = 'storage.s3';
                            break;
                        case "AZURE":
                            s = 'storage.azure';
                            break;
                        case "GCS":
                            s = 'storage.gcs';
                            break;
                        default:
                            break;
                    }
                    return m(s);
                }, sorter: { type: 'string' } }, { name: 'VersioningPolicyName', label: m('versioning'), style: { width: '15%' }, headerStyle: { width: '15%' }, hideSmall: true, renderCell: function renderCell(row) {
                    var pol = versioningPolicies.find(function (obj) {
                        return obj.Uuid === row['VersioningPolicyName'];
                    });
                    if (pol) {
                        return pol.Name;
                    } else {
                        return row['VersioningPolicyName'] || '-';
                    }
                }, sorter: { type: 'string' } }, {
                name: 'EncryptionMode',
                label: m('encryption'),
                hideSmall: true,
                style: { width: '10%', textAlign: 'center' },
                headerStyle: { width: '10%' },
                renderCell: function renderCell(row) {
                    return row['EncryptionMode'] === 'MASTER' ? _react2['default'].createElement('span', { className: "mdi mdi-check" }) : '-';
                },
                sorter: { type: 'number', value: function value(row) {
                        return row['EncryptionMode'] === 'MASTER' ? 1 : 0;
                    } } }];
            var title = currentNode.getLabel();
            var icon = currentNode.getMetadata().get('icon_class');
            var buttons = [];
            if (accessByName('CreateDatasource')) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: pydio.MessageHash['ajxp_admin.ws.4'], onTouchTap: this.createDataSource.bind(this) }, adminStyles.props.header.flatButton)));
            }
            var versioningEditable = !versioningReadonly && accessByName('CreateVersioning');
            if (versioningEditable) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: pydio.MessageHash['ajxp_admin.ws.4b'], onTouchTap: function () {
                        _this6.openVersionPolicy();
                    } }, adminStyles.props.header.flatButton)));
            }
            var policiesColumns = [{ name: 'Name', label: m('versioning.name'), style: { width: 180, fontSize: 15 }, headerStyle: { width: 180 }, sorter: { type: 'string', 'default': true } }, { name: 'Description', label: m('versioning.description'), sorter: { type: 'string' } }, { name: 'KeepPeriods', hideSmall: true, label: m('versioning.periods'), renderCell: function renderCell(row) {
                    return _react2['default'].createElement(_editorVersionPolicyPeriods2['default'], { rendering: 'short', periods: row.KeepPeriods, pydio: pydio });
                } }];

            var dsActions = [];
            if (accessByName('CreateDatasource')) {
                dsActions.push({
                    iconClassName: 'mdi mdi-pencil',
                    tooltip: 'Edit datasource',
                    onTouchTap: function onTouchTap(row) {
                        _this6.openDataSource([row]);
                    }
                });
            }
            dsActions.push({
                iconClassName: 'mdi mdi-sync',
                tooltip: m('editor.legend.resync.button'),
                onTouchTap: function onTouchTap(row) {
                    return _this6.resyncDataSource(pydio, m, row);
                }
            });
            dsActions.push({
                iconClassName: 'mdi mdi-folder-plus',
                tooltip: 'Create workspace here',
                onTouchTap: function onTouchTap(row) {
                    return _this6.createWorkspaceFromDatasource(pydio, m, row);
                }
            });
            if (accessByName('CreateDatasource')) {
                dsActions.push({
                    iconClassName: 'mdi mdi-delete',
                    tooltip: m('editor.legend.delete.button'),
                    onTouchTap: function onTouchTap(row) {
                        return _this6.deleteDataSource(pydio, m, row);
                    }
                });
            }

            var vsActions = [];
            vsActions.push({
                iconClassName: versioningEditable ? 'mdi mdi-pencil' : 'mdi mdi-eye',
                tooltip: versioningEditable ? 'Edit policy' : 'Display policy',
                onTouchTap: function onTouchTap(row) {
                    _this6.openVersionPolicy([row]);
                }
            });
            if (versioningEditable) {
                vsActions.push({
                    iconClassName: 'mdi mdi-delete',
                    tooltip: 'Delete policy',
                    destructive: true,
                    onTouchTap: function onTouchTap(row) {
                        return _this6.deleteVersionPolicy(row);
                    }
                });
            }

            return _react2['default'].createElement(
                'div',
                { className: 'main-layout-nav-to-stack workspaces-board' },
                _react2['default'].createElement(
                    'div',
                    { className: 'vertical-layout', style: { width: '100%' } },
                    _react2['default'].createElement(AdminComponents.Header, {
                        title: title,
                        icon: icon,
                        actions: buttons,
                        reloadAction: this.load.bind(this),
                        loading: !(this.state.dsLoaded && this.state.versionsLoaded)
                    }),
                    _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill' },
                        _react2['default'].createElement(AdminComponents.SubHeader, { title: m('board.ds.title'), legend: m('board.ds.legend') }),
                        _react2['default'].createElement(
                            _materialUi.Paper,
                            _extends({}, blockProps, { style: _extends({}, blockStyle) }),
                            _react2['default'].createElement(MaterialTable, {
                                data: dataSources,
                                columns: dsColumns,
                                actions: dsActions,
                                onSelectRows: this.openDataSource.bind(this),
                                deselectOnClickAway: true,
                                showCheckboxes: false,
                                emptyStateString: "No datasources created yet",
                                masterStyles: tableMaster
                            })
                        ),
                        _react2['default'].createElement(AdminComponents.SubHeader, { title: m('board.versioning.title'), legend: m('board.versioning.legend') }),
                        _react2['default'].createElement(
                            _materialUi.Paper,
                            _extends({}, blockProps, { style: _extends({}, blockStyle) }),
                            _react2['default'].createElement(MaterialTable, {
                                data: versioningPolicies,
                                columns: policiesColumns,
                                actions: vsActions,
                                onSelectRows: this.openVersionPolicy.bind(this),
                                deselectOnClickAway: true,
                                showCheckboxes: false,
                                masterStyles: tableMaster
                            })
                        ),
                        _react2['default'].createElement(AdminComponents.SubHeader, { title: m('board.enc.title'), legend: m('board.enc.legend') }),
                        _react2['default'].createElement(_EncryptionKeys2['default'], { pydio: pydio, ref: "encKeys", accessByName: accessByName, adminStyles: adminStyles })
                    )
                )
            );
        }
    }]);

    return DataSourcesBoard;
})(_react2['default'].Component);

DataSourcesBoard.propTypes = {
    dataModel: _react2['default'].PropTypes.instanceOf(_pydioModelDataModel2['default']).isRequired,
    rootNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
    currentNode: _react2['default'].PropTypes.instanceOf(_pydioModelNode2['default']).isRequired,
    openEditor: _react2['default'].PropTypes.func.isRequired,
    openRightPane: _react2['default'].PropTypes.func.isRequired,
    closeRightPane: _react2['default'].PropTypes.func.isRequired,
    filter: _react2['default'].PropTypes.string,
    versioningReadonly: _react2['default'].PropTypes.bool
};

exports['default'] = DataSourcesBoard = (0, _materialUiStyles.muiThemeable)()(DataSourcesBoard);

exports['default'] = DataSourcesBoard;
module.exports = exports['default'];
