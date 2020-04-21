/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modelDataSource = require('../model/DataSource');

var _modelDataSource2 = _interopRequireDefault(_modelDataSource);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _DataSourceLocalSelector = require('./DataSourceLocalSelector');

var _DataSourceLocalSelector2 = _interopRequireDefault(_DataSourceLocalSelector);

var _DsStorageSelector = require('./DsStorageSelector');

var _DsStorageSelector2 = _interopRequireDefault(_DsStorageSelector);

var _DataSourceBucketSelector = require('./DataSourceBucketSelector');

var _DataSourceBucketSelector2 = _interopRequireDefault(_DataSourceBucketSelector);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var PaperEditorLayout = _Pydio$requireLib.PaperEditorLayout;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib2.ModernTextField;
var ModernSelectField = _Pydio$requireLib2.ModernSelectField;
var ModernStyles = _Pydio$requireLib2.ModernStyles;

var DataSourceEditor = (function (_React$Component) {
    _inherits(DataSourceEditor, _React$Component);

    function DataSourceEditor(props) {
        var _this = this;

        _classCallCheck(this, DataSourceEditor);

        _get(Object.getPrototypeOf(DataSourceEditor.prototype), 'constructor', this).call(this, props);
        var observable = new _modelDataSource2['default'](props.dataSource, props.existingNames);
        this.state = {
            dirty: false,
            create: props.create,
            observable: observable,
            model: observable.getModel(),
            loaded: false,
            valid: observable.isValid(),
            encryptionKeys: [],
            versioningPolicies: [],
            s3Custom: observable.getModel().StorageConfiguration.customEndpoint ? 'custom' : 'aws',
            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.ds.editor.' + id] || id;
            }
        };
        _modelDataSource2['default'].loadEncryptionKeys().then(function (res) {
            _this.setState({ encryptionKeys: res.Keys || [] });
        });
        _modelDataSource2['default'].loadVersioningPolicies().then(function (res) {
            _this.setState({ versioningPolicies: res.Policies || [] });
        });
    }

    _createClass(DataSourceEditor, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.dataSource && this.state.model.Name !== newProps.dataSource.Name) {
                if (this.state.dirty) {
                    alert(this.props.pydio.MessageHash['role_editor.19']);
                } else {
                    var observable = new _modelDataSource2['default'](newProps.dataSource);
                    this.setState({
                        observable: observable,
                        model: observable.getModel()
                    });
                }
            }
            if (newProps.create && this.state.create !== newProps.create) {
                this.setState({ create: newProps.create });
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var observable = this.state.observable;

            observable.observe("update", function () {
                _this2.setState({ dirty: true });
                _this2.forceUpdate();
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var observable = this.state.observable;

            observable.stopObserving("update");
        }
    }, {
        key: 'resetForm',
        value: function resetForm() {
            var _this3 = this;

            var observable = this.state.observable;

            var newModel = observable.revert();
            this.setState({
                valid: true,
                dirty: false,
                model: newModel
            }, function () {
                _this3.forceUpdate();
            });
        }
    }, {
        key: 'deleteSource',
        value: function deleteSource() {
            var _this4 = this;

            var _state = this.state;
            var m = _state.m;
            var observable = _state.observable;
            var pydio = this.props.pydio;

            pydio.UI.openConfirmDialog({
                message: m('delete.warning'),
                validCallback: function validCallback() {
                    observable.deleteSource().then(function () {
                        _this4.props.closeEditor();
                        _this4.props.reloadList();
                    });
                },
                destructive: [observable.getModel().Name]
            });
        }
    }, {
        key: 'saveSource',
        value: function saveSource() {
            var _this5 = this;

            var _state2 = this.state;
            var observable = _state2.observable;
            var create = _state2.create;

            this.state.observable.saveSource().then(function () {
                var newDsName = null;
                if (create) {
                    newDsName = observable.getModel().Name;
                }
                _this5.setState({ valid: true, dirty: false, create: false });
                if (create) {
                    _this5.props.closeEditor();
                }
                _this5.props.reloadList(newDsName);
            });
        }
    }, {
        key: 'launchResync',
        value: function launchResync() {
            this.state.observable.resyncSource();
        }
    }, {
        key: 'toggleEncryption',
        value: function toggleEncryption(value) {
            if (value) {
                this.setState({ showDialog: 'enableEncryption', dialogTargetValue: value });
            } else {
                this.setState({ showDialog: 'disableEncryption', dialogTargetValue: value });
            }
        }
    }, {
        key: 'confirmEncryption',
        value: function confirmEncryption(value) {
            var _state3 = this.state;
            var model = _state3.model;
            var encryptionKeys = _state3.encryptionKeys;

            model.EncryptionMode = value ? "MASTER" : "CLEAR";
            if (value && !model.EncryptionKey && encryptionKeys && encryptionKeys.length) {
                model.EncryptionKey = encryptionKeys[0].ID;
            }
            this.setState({ showDialog: false, dialogTargetValue: null });
        }
    }, {
        key: 'toggleS3Custom',
        value: function toggleS3Custom(value) {
            var model = this.state.model;

            if (value === "aws") {
                model.StorageConfiguration.customEndpoint = "";
                model.StorageConfiguration.customRegion = "";
            }
            this.setState({ s3Custom: value });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props = this.props;
            var storageTypes = _props.storageTypes;
            var pydio = _props.pydio;
            var readonly = _props.readonly;
            var _state4 = this.state;
            var model = _state4.model;
            var create = _state4.create;
            var observable = _state4.observable;
            var encryptionKeys = _state4.encryptionKeys;
            var versioningPolicies = _state4.versioningPolicies;
            var showDialog = _state4.showDialog;
            var dialogTargetValue = _state4.dialogTargetValue;
            var s3Custom = _state4.s3Custom;
            var m = _state4.m;

            var titleActionBarButtons = [];
            if (!readonly) {
                if (!create) {
                    titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('plugins.6'), 'mdi mdi-undo', function () {
                        _this6.resetForm();
                    }, !this.state.dirty));
                }
                titleActionBarButtons.push(PaperEditorLayout.actionButton(this.context.getMessage('53', ''), 'mdi mdi-content-save', function () {
                    _this6.saveSource();
                }, !observable.isValid() || !this.state.dirty));
            }

            var leftNav = _react2['default'].createElement(
                'div',
                { style: { padding: '6px 0', color: '#9E9E9E', fontSize: 13 } },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 120, textAlign: 'center' } },
                    _react2['default'].createElement('i', { className: 'mdi mdi-database' })
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { padding: 16 } },
                    this.context.getMessage('ws.75'),
                    ' ',
                    this.context.getMessage('ws.76')
                ),
                create && model.StorageType === 'LOCAL' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 16 } },
                        m('legend.local'),
                        _react2['default'].createElement(
                            'ul',
                            null,
                            _react2['default'].createElement(
                                'li',
                                { style: { listStyle: 'disc', marginLeft: 20 } },
                                m('legend.local.li.1')
                            ),
                            _react2['default'].createElement(
                                'li',
                                { style: { listStyle: 'disc', marginLeft: 20 } },
                                m('legend.local.li.2')
                            ),
                            _react2['default'].createElement(
                                'li',
                                { style: { listStyle: 'disc', marginLeft: 20 } },
                                m('legend.local.li.3')
                            )
                        )
                    )
                ),
                create && model.StorageType === 'S3' && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 16 } },
                        m('legend.s3.1'),
                        _react2['default'].createElement('br', null),
                        m('legend.s3.2')
                    )
                ),
                !create && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 16 } },
                        m('legend.resync'),
                        _react2['default'].createElement(
                            'div',
                            { style: { textAlign: 'center', marginTop: 10 } },
                            _react2['default'].createElement(_materialUi.RaisedButton, { label: m('legend.resync.button'), onClick: this.launchResync.bind(this) })
                        )
                    )
                ),
                !create && !readonly && _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.Divider, null),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: 16 } },
                        m('legend.delete.1'),
                        _react2['default'].createElement('br', null),
                        m('legend.delete.2'),
                        _react2['default'].createElement(
                            'div',
                            { style: { textAlign: 'center', marginTop: 10 } },
                            _react2['default'].createElement(_materialUi.RaisedButton, { secondary: true, label: m('legend.delete.button'), onClick: this.deleteSource.bind(this), style: { marginTop: 16 } })
                        )
                    )
                )
            );

            var title = model.Name ? m('title').replace('%s', model.Name) : m('new');
            var storageConfig = model.StorageConfiguration;
            var adminStyles = AdminComponents.AdminStyles(this.props.muiTheme.palette);
            var styles = {
                title: {
                    fontSize: 20,
                    paddingTop: 20,
                    marginBottom: 10
                },
                legend: {},
                section: _extends({ padding: '0 20px 20px', margin: 10, backgroundColor: 'white' }, adminStyles.body.block.container),
                storageSection: { padding: 20, marginTop: -1 },
                toggleDiv: { height: 50, display: 'flex', alignItems: 'flex-end' }
            };

            var storages = {
                LOCAL: { primaryText: this.context.getMessage('ds.storage.fs', 'ajxp_admin'), image: 'fs.png' },
                S3: { primaryText: this.context.getMessage('ds.storage.s3', 'ajxp_admin'), image: 's3-compat.png' },
                AZURE: { primaryText: this.context.getMessage('ds.storage.azure', 'ajxp_admin'), image: 'azure.png' },
                GCS: { primaryText: this.context.getMessage('ds.storage.gcs', 'ajxp_admin'), image: 'gcs.png' }
            };
            var storageData = {};
            storageTypes.forEach(function (type) {
                storageData[type] = storages[type];
            });
            if (model.StorageType && !storageData[model.StorageType]) {
                storageData[model.StorageType] = storages[model.StorageType];
            }

            var cannotEnableEnc = model.EncryptionMode !== 'MASTER' && (!encryptionKeys || !encryptionKeys.length);

            return _react2['default'].createElement(
                PydioComponents.PaperEditorLayout,
                {
                    title: title,
                    titleActionBar: titleActionBarButtons,
                    closeAction: this.props.closeEditor,
                    leftNav: leftNav,
                    className: 'workspace-editor',
                    contentFill: false
                },
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        open: showDialog,
                        title: m('enc.warning'),
                        onRequestClose: function () {
                            _this6.confirmEncryption(!dialogTargetValue);
                        },
                        actions: [_react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: function () {
                                _this6.confirmEncryption(!dialogTargetValue);
                            } }), _react2['default'].createElement(_materialUi.FlatButton, { label: m('enc.validate'), onTouchTap: function () {
                                _this6.confirmEncryption(dialogTargetValue);
                            } })]
                    },
                    showDialog === 'enableEncryption' && _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'p',
                            null,
                            m('enc.dialog.enable.1')
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            m('enc.dialog.enable.2'),
                            ' ',
                            _react2['default'].createElement(
                                'b',
                                null,
                                m('enc.dialog.enable.2bold')
                            )
                        ),
                        _react2['default'].createElement(
                            'p',
                            null,
                            m('enc.dialog.enable.3')
                        )
                    ),
                    showDialog === 'disableEncryption' && _react2['default'].createElement(
                        'div',
                        null,
                        m('enc.dialog.disable')
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        m('options')
                    ),
                    _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('options.id') + ' *', disabled: !create, value: model.Name, onChange: function (e, v) {
                            model.Name = v;
                        }, errorText: observable.getNameError(m) }),
                    !create && _react2['default'].createElement(
                        'div',
                        { style: styles.toggleDiv },
                        _react2['default'].createElement(_materialUi.Toggle, _extends({ labelPosition: "right", label: m('options.enabled'), toggled: !model.Disabled, onToggle: function (e, v) {
                                model.Disabled = !v;
                            } }, ModernStyles.toggleField))
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: _extends({}, styles.section, { padding: 0 }) },
                    _react2['default'].createElement(_DsStorageSelector2['default'], { disabled: !create, value: model.StorageType, onChange: function (e, i, v) {
                            model.StorageType = v;
                        }, values: storageData }),
                    model.StorageType === 'LOCAL' && _react2['default'].createElement(
                        'div',
                        { style: styles.storageSection },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.legend },
                            m('storage.legend.fs')
                        ),
                        _react2['default'].createElement(_DataSourceLocalSelector2['default'], { model: model, pydio: this.props.pydio }),
                        _react2['default'].createElement(
                            'div',
                            { style: styles.toggleDiv },
                            _react2['default'].createElement(_materialUi.Toggle, _extends({ labelPosition: "right", label: m('storage.fs.macos'), toggled: storageConfig.normalize === "true", onToggle: function (e, v) {
                                    storageConfig.normalize = v ? "true" : "false";
                                } }, ModernStyles.toggleField))
                        )
                    ),
                    model.StorageType === 'S3' && _react2['default'].createElement(
                        'div',
                        { style: styles.storageSection },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.legend },
                            m('storage.legend.s3')
                        ),
                        _react2['default'].createElement(
                            ModernSelectField,
                            { fullWidth: true, value: s3Custom, onChange: function (e, i, v) {
                                    _this6.toggleS3Custom(v);
                                } },
                            _react2['default'].createElement(_materialUi.MenuItem, { value: "aws", primaryText: m('storage.s3.endpoint.amazon') }),
                            _react2['default'].createElement(_materialUi.MenuItem, { value: "custom", primaryText: m('storage.s3.endpoint.custom') })
                        ),
                        s3Custom === 'custom' && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.s3.endpoint') + ' - ' + m('storage.s3.endpoint.hint'), value: model.StorageConfiguration.customEndpoint, onChange: function (e, v) {
                                    model.StorageConfiguration.customEndpoint = v;
                                } }),
                            _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.s3.region'), value: model.StorageConfiguration.customRegion, onChange: function (e, v) {
                                    model.StorageConfiguration.customRegion = v;
                                } })
                        ),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.s3.api') + ' *', value: model.ApiKey, onChange: function (e, v) {
                                model.ApiKey = v;
                            } }),
                        _react2['default'].createElement(
                            'form',
                            { autoComplete: "off" },
                            _react2['default'].createElement('input', { type: 'hidden', value: 'something' }),
                            _react2['default'].createElement(ModernTextField, { autoComplete: "off", fullWidth: true, type: "password", hintText: m('storage.s3.secret') + ' *', value: model.ApiSecret, onChange: function (e, v) {
                                    model.ApiSecret = v;
                                } })
                        ),
                        _react2['default'].createElement(_DataSourceBucketSelector2['default'], { dataSource: model, hintText: m('storage.s3.bucket') }),
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({}, styles.legend, { paddingTop: 40 }) },
                            m('storage.s3.legend.tags')
                        ),
                        _react2['default'].createElement(
                            'div',
                            { style: { display: 'flex' } },
                            _react2['default'].createElement(
                                'div',
                                { style: { flex: 1, marginRight: 5 } },
                                _react2['default'].createElement(ModernTextField, {
                                    fullWidth: true,
                                    disabled: !!model.StorageConfiguration.ObjectsBucket,
                                    hintText: m('storage.s3.bucketsTags'),
                                    value: model.StorageConfiguration.bucketsTags || '',
                                    onChange: function (e, v) {
                                        model.StorageConfiguration.bucketsTags = v;
                                    } })
                            ),
                            _react2['default'].createElement(
                                'div',
                                { style: { flex: 1, marginLeft: 5 } },
                                _react2['default'].createElement(ModernTextField, {
                                    disabled: true,
                                    fullWidth: true,
                                    hintText: m('storage.s3.objectsTags') + ' (not implemented yet)',
                                    value: model.StorageConfiguration.objectsTags || '',
                                    onChange: function (e, v) {
                                        model.StorageConfiguration.objectsTags = v;
                                    } })
                            )
                        )
                    ),
                    model.StorageType === 'AZURE' && _react2['default'].createElement(
                        'div',
                        { style: styles.storageSection },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.legend },
                            m('storage.legend.azure')
                        ),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.azure.bucket') + ' *', value: model.ObjectsBucket, onChange: function (e, v) {
                                model.ObjectsBucket = v;
                            } }),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.azure.api') + ' *', value: model.ApiKey, onChange: function (e, v) {
                                model.ApiKey = v;
                            } }),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.azure.secret') + ' *', value: model.ApiSecret, onChange: function (e, v) {
                                model.ApiSecret = v;
                            } }),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.s3.path'), value: model.ObjectsBaseFolder, onChange: function (e, v) {
                                model.ObjectsBaseFolder = v;
                            } })
                    ),
                    model.StorageType === 'GCS' && _react2['default'].createElement(
                        'div',
                        { style: styles.storageSection },
                        _react2['default'].createElement(
                            'div',
                            { style: styles.legend },
                            m('storage.legend.gcs')
                        ),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.gcs.bucket') + ' *', value: model.ObjectsBucket, onChange: function (e, v) {
                                model.ObjectsBucket = v;
                            } }),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.gcs.credentials') + ' *', value: model.StorageConfiguration.jsonCredentials, onChange: function (e, v) {
                                model.StorageConfiguration.jsonCredentials = v;
                            }, multiLine: true }),
                        _react2['default'].createElement(ModernTextField, { fullWidth: true, hintText: m('storage.s3.path'), value: model.ObjectsBaseFolder, onChange: function (e, v) {
                                model.ObjectsBaseFolder = v;
                            } })
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 0, style: styles.section },
                    _react2['default'].createElement(
                        'div',
                        { style: styles.title },
                        m('datamanagement')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { paddingTop: 20 }) },
                        m('storage.legend.versioning')
                    ),
                    _react2['default'].createElement(
                        ModernSelectField,
                        { fullWidth: true, value: model.VersioningPolicyName, onChange: function (e, i, v) {
                                model.VersioningPolicyName = v;
                            } },
                        _react2['default'].createElement(_materialUi.MenuItem, { value: undefined, primaryText: m('versioning.disabled') }),
                        versioningPolicies.map(function (key) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: key.Uuid, primaryText: key.Name });
                        })
                    ),
                    model.StorageType !== 'LOCAL' && _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({}, styles.legend, { paddingTop: 20 }) },
                            m('storage.legend.readOnly')
                        ),
                        _react2['default'].createElement(_materialUi.Toggle, _extends({
                            label: m('storage.readOnly'),
                            labelPosition: "right",
                            toggled: model.StorageConfiguration.readOnly === 'true',
                            onToggle: function (e, v) {
                                model.StorageConfiguration.readOnly = v ? 'true' : '';
                            }
                        }, ModernStyles.toggleField))
                    ),
                    (!model.StorageConfiguration.readOnly || model.StorageConfiguration.readOnly !== 'true') && _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(
                            'div',
                            { style: _extends({}, styles.legend, { paddingTop: 20 }) },
                            m('storage.legend.checksumMapper')
                        ),
                        _react2['default'].createElement(_materialUi.Toggle, _extends({
                            label: m('storage.nativeEtags'),
                            labelPosition: "right",
                            toggled: model.StorageConfiguration.nativeEtags,
                            onToggle: function (e, v) {
                                model.StorageConfiguration.nativeEtags = v ? 'true' : '';
                            }
                        }, ModernStyles.toggleField)),
                        !model.StorageConfiguration.nativeEtags && _react2['default'].createElement(
                            'div',
                            null,
                            _react2['default'].createElement(_materialUi.Toggle, _extends({
                                label: m('storage.checksumMapper'),
                                labelPosition: "right",
                                toggled: model.StorageConfiguration.checksumMapper === 'dao',
                                onToggle: function (e, v) {
                                    model.StorageConfiguration.checksumMapper = v ? 'dao' : '';
                                }
                            }, ModernStyles.toggleField))
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: _extends({}, styles.legend, { paddingTop: 20 }) },
                        m('storage.legend.encryption')
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: styles.toggleDiv },
                        _react2['default'].createElement(_materialUi.Toggle, _extends({ labelPosition: "right", label: m('enc') + (cannotEnableEnc ? ' (' + pydio.MessageHash['ajxp_admin.ds.encryption.key.emptyState'] + ')' : ''), toggled: model.EncryptionMode === "MASTER", onToggle: function (e, v) {
                                _this6.toggleEncryption(v);
                            },
                            disabled: cannotEnableEnc }, ModernStyles.toggleField))
                    ),
                    model.EncryptionMode === "MASTER" && _react2['default'].createElement(
                        ModernSelectField,
                        { fullWidth: true, hintText: m('enc.key'), value: model.EncryptionKey, onChange: function (e, i, v) {
                                model.EncryptionKey = v;
                            } },
                        encryptionKeys.map(function (key) {
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: key.ID, primaryText: key.Label });
                        })
                    )
                )
            );
        }
    }]);

    return DataSourceEditor;
})(_react2['default'].Component);

DataSourceEditor.contextTypes = {
    messages: _react2['default'].PropTypes.object,
    getMessage: _react2['default'].PropTypes.func
};

exports['default'] = DataSourceEditor = (0, _materialUiStyles.muiThemeable)()(DataSourceEditor);

exports['default'] = DataSourceEditor;
module.exports = exports['default'];
