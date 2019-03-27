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

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var EncryptionKeys = (function (_React$Component) {
    _inherits(EncryptionKeys, _React$Component);

    function EncryptionKeys(props) {
        _classCallCheck(this, EncryptionKeys);

        _get(Object.getPrototypeOf(EncryptionKeys.prototype), 'constructor', this).call(this, props);
        this.state = {
            keys: [],
            showDialog: false,

            showExportKey: null,
            exportedKey: null,

            showCreateKey: null,
            showImportKey: null,

            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.ds.encryption.' + id] || id;
            }
        };
    }

    _createClass(EncryptionKeys, [{
        key: 'load',
        value: function load() {
            var _this = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.listEncryptionKeys(new _pydioHttpRestApi.EncryptionAdminListKeysRequest()).then(function (result) {
                _this.setState({ keys: result.Keys || [] });
            });
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.load();
        }
    }, {
        key: 'exportKey',
        value: function exportKey() {
            var _this2 = this;

            var pydio = this.props.pydio;
            var m = this.state.m;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _pydioHttpRestApi.EncryptionAdminExportKeyRequest();
            request.KeyID = this.state.showExportKey;
            request.StrPassword = this.refs['key-password-field'].getValue();
            var confirm = this.refs['key-password-confirm'].getValue();
            if (confirm !== request.StrPassword) {
                pydio.UI.displayMessage('ERROR', 'Warning, passwords differ!');
                return;
            }
            api.exportEncryptionKey(request).then(function (response) {
                _this2.setState({ exportedKey: response.Key, showExportKey: null }, function () {
                    _this2.timeout = setTimeout(function () {
                        _this2.setState({ exportedKey: '', showDialog: false });
                    }, 10000);
                });
                _this2.setState({ showExportKey: null });
            })['catch'](function (reason) {
                pydio.UI.displayMessage('ERROR', m('key.export.fail') + " : " + reason.message);
                _this2.setState({ showExportKey: null });
            });
        }
    }, {
        key: 'createKey',
        value: function createKey() {
            var _this3 = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var req = new _pydioHttpRestApi.EncryptionAdminCreateKeyRequest();
            req.KeyID = this.refs['createKeyId'].getValue();
            req.Label = this.refs['createKeyLabel'].getValue();
            api.createEncryptionKey(req).then(function (result) {
                _this3.load();
                _this3.setState({ showDialog: false });
            })['catch'](function () {
                _this3.setState({ showDialog: false });
            });
        }
    }, {
        key: 'deleteKey',
        value: function deleteKey(keyId) {
            var _this4 = this;

            var m = this.state.m;

            if (confirm(m('key.delete.warning'))) {
                var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
                var req = new _pydioHttpRestApi.EncryptionAdminDeleteKeyRequest();
                req.KeyID = keyId;
                api.deleteEncryptionKey(req).then(function (result) {
                    _this4.load();
                });
            }
        }
    }, {
        key: 'importKey',
        value: function importKey() {
            var _this5 = this;

            var pydio = this.props.pydio;
            var m = this.state.m;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());

            var importKey = this.state.showImportKey;
            var importExisting = true;
            if (!importKey.ID) {
                importKey = new _pydioHttpRestApi.EncryptionKey();
                importKey.ID = this.refs['key-import-id'].getValue();
                importKey.Label = this.refs['key-import-label'].getValue();
                importExisting = false;
            }
            importKey.Content = this.refs['key-imported-field'].getValue();

            var request = new _pydioHttpRestApi.EncryptionAdminImportKeyRequest();
            request.StrPassword = this.refs['key-password-field'].getValue();
            request.Key = importKey;
            request.Override = importExisting;
            api.importEncryptionKey(request).then(function (response) {
                if (response.Success) {
                    pydio.UI.displayMessage('SUCCESS', m('key.import.success'));
                } else {
                    pydio.UI.displayMessage('ERROR', m('key.import.fail'));
                }
                _this5.load();
                _this5.setState({ showImportKey: false, showDialog: false });
            })['catch'](function () {
                _this5.setState({ showImportKey: false, showDialog: false });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _state = this.state;
            var keys = _state.keys;
            var showDialog = _state.showDialog;
            var showImportKey = _state.showImportKey;
            var showExportKey = _state.showExportKey;
            var exportedKey = _state.exportedKey;
            var showCreateKey = _state.showCreateKey;
            var m = _state.m;
            var pydio = this.props.pydio;

            var columns = [{ name: 'Label', label: m('key.label'), style: { width: '30%', fontSize: 15 }, headerStyle: { width: '30%' } }, { name: 'ID', label: m('key.id'), hideSmall: true }, { name: 'Owner', label: m('key.owner'), hideSmall: true }, { name: 'CreationDate', label: m('key.created'), hideSmall: true, renderCell: function renderCell(row) {
                    return new Date(row.CreationDate * 1000).toUTCString();
                } }, { name: 'Actions', label: '', style: { width: 170, textAlign: 'right', overflow: 'visible' }, headerStyle: { width: 170 }, renderCell: function renderCell(row) {
                    return _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_materialUi.IconButton, { tooltip: m('key.import'), tooltipPosition: "right", iconStyle: { color: '#9e9e9e' }, iconClassName: "mdi mdi-import", onTouchTap: function () {
                                _this6.setState({ showDialog: true, showImportKey: row });
                            }, onClick: function (e) {
                                return e.stopPropagation();
                            } }),
                        _react2['default'].createElement(_materialUi.IconButton, { tooltip: m('key.export'), tooltipPosition: "right", iconStyle: { color: '#9e9e9e' }, iconClassName: "mdi mdi-export", onTouchTap: function () {
                                _this6.setState({ showDialog: true, showExportKey: row.ID });
                            }, onClick: function (e) {
                                return e.stopPropagation();
                            } }),
                        _react2['default'].createElement(_materialUi.IconButton, { tooltip: m('key.delete'), tooltipPosition: "right", iconStyle: { color: '#9e9e9e' }, iconClassName: "mdi mdi-delete", onTouchTap: function () {
                                _this6.deleteKey(row.ID);
                            }, onClick: function (e) {
                                return e.stopPropagation();
                            } })
                    );
                } }];

            var dialogContent = undefined,
                dialogTitle = undefined,
                dialogActions = [];
            if (showExportKey || exportedKey) {
                dialogTitle = m('key.export');
                if (exportedKey) {
                    dialogContent = _react2['default'].createElement(_materialUi.TextField, {
                        value: exportedKey.Content,
                        fullWidth: true,
                        floatingLabelText: m('key.export.result.copy'),
                        multiLine: true,
                        ref: 'key-imported-field'
                    });
                    dialogActions = [_react2['default'].createElement(_materialUi.FlatButton, { label: "Close", onTouchTap: function () {
                            clearTimeout(_this6.timeout);
                            _this6.setState({ showExportKey: null, exportedKey: '', showDialog: false });
                        } })];
                } else {
                    dialogContent = _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.export.password'), ref: 'key-password-field', type: "password", fullWidth: true }),
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.export.confirm'), ref: 'key-password-confirm', type: "password", fullWidth: true })
                    );
                    dialogActions = [_react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: function () {
                            _this6.setState({ showExportKey: null, showDialog: false });
                        } }), _react2['default'].createElement(_materialUi.FlatButton, { label: m('key.export'), primary: true, onTouchTap: function () {
                            _this6.exportKey();
                        } })];
                }
            } else if (showImportKey) {
                dialogTitle = m('key.import');
                dialogContent = _react2['default'].createElement(
                    'div',
                    null,
                    !showImportKey.ID && _react2['default'].createElement(
                        'div',
                        null,
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.import.id'), ref: 'key-import-id', fullWidth: true }),
                        _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.import.label'), ref: 'key-import-label', fullWidth: true })
                    ),
                    _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.import.password'), ref: 'key-password-field', type: "password", fullWidth: true }),
                    _react2['default'].createElement(_materialUi.TextField, { fullWidth: true, floatingLabelText: m('key.import.content'), multiLine: true, ref: 'key-imported-field' })
                );
                dialogActions = [_react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: function () {
                        _this6.setState({ showImportKey: null, showDialog: false });
                    } }), _react2['default'].createElement(_materialUi.FlatButton, { label: m('key.import'), primary: true, onTouchTap: function () {
                        _this6.importKey();
                    } })];
            } else if (showCreateKey) {
                dialogTitle = "Create a Key";
                dialogContent = _react2['default'].createElement(
                    'div',
                    null,
                    _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.import.id'), ref: 'createKeyId', fullWidth: true }),
                    _react2['default'].createElement(_materialUi.TextField, { floatingLabelText: m('key.import.label'), ref: 'createKeyLabel', fullWidth: true })
                );
                dialogActions = [_react2['default'].createElement(_materialUi.FlatButton, { label: pydio.MessageHash['54'], onTouchTap: function () {
                        _this6.setState({ showCreateKey: null, showDialog: false });
                    } }), _react2['default'].createElement(_materialUi.FlatButton, { label: m('key.create'), primary: true, onTouchTap: function () {
                        _this6.createKey();
                    } })];
            }

            return _react2['default'].createElement(
                'div',
                { zDepth: 0, style: { margin: 16 } },
                _react2['default'].createElement(
                    _materialUi.Dialog,
                    {
                        title: dialogTitle,
                        open: showDialog,
                        onRequestClose: function () {
                            _this6.setState({ showDialog: false, showExportKey: null, showImportKey: null, showCreateKey: false });
                        },
                        modal: true,
                        actions: dialogActions,
                        contentStyle: { maxWidth: 340 }
                    },
                    dialogContent
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { textAlign: 'right', paddingBottom: 16 } },
                    _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: m('key.import'), onTouchTap: function () {
                            _this6.setState({ showImportKey: {}, showDialog: true });
                        }, style: { marginLeft: 16 } }),
                    _react2['default'].createElement(_materialUi.RaisedButton, { primary: true, label: m('key.create'), onTouchTap: function () {
                            _this6.setState({ showCreateKey: true, showDialog: true });
                        }, style: { marginLeft: 16 } })
                ),
                _react2['default'].createElement(
                    _materialUi.Paper,
                    { zDepth: 1 },
                    _react2['default'].createElement(MaterialTable, {
                        data: keys,
                        columns: columns,
                        onSelectRows: function () {},
                        showCheckboxes: false,
                        emptyStateString: m('key.emptyState')
                    })
                )
            );
        }
    }]);

    return EncryptionKeys;
})(_react2['default'].Component);

exports['default'] = EncryptionKeys;
module.exports = exports['default'];
