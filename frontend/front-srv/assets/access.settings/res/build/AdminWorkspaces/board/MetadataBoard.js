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

var _modelMetadata = require('../model/Metadata');

var _modelMetadata2 = _interopRequireDefault(_modelMetadata);

var _materialUi = require('material-ui');

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _editorMetaNamespace = require('../editor/MetaNamespace');

var _editorMetaNamespace2 = _interopRequireDefault(_editorMetaNamespace);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _require = require('material-ui/styles');

var muiThemeable = _require.muiThemeable;

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var MaterialTable = _Pydio$requireLib.MaterialTable;

var MetadataBoard = (function (_React$Component) {
    _inherits(MetadataBoard, _React$Component);

    function MetadataBoard(props) {
        _classCallCheck(this, MetadataBoard);

        _get(Object.getPrototypeOf(MetadataBoard.prototype), 'constructor', this).call(this, props);
        this.state = {
            loading: false,
            namespaces: [],
            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.metadata.' + id];
            }
        };
    }

    _createClass(MetadataBoard, [{
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.load();
        }
    }, {
        key: 'load',
        value: function load() {
            var _this = this;

            this.setState({ loading: true });
            _modelMetadata2['default'].loadNamespaces().then(function (result) {
                _this.setState({ loading: false, namespaces: result.Namespaces || [] });
            });
        }
    }, {
        key: 'emptyNs',
        value: function emptyNs() {
            var ns = new _pydioHttpRestApi.IdmUserMetaNamespace();
            ns.Policies = [_pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Action: 'READ', Subject: '*', Effect: 'allow' }), _pydioHttpRestApi.ServiceResourcePolicy.constructFromObject({ Action: 'WRITE', Subject: '*', Effect: 'allow' })];
            ns.JsonDefinition = JSON.stringify({ type: 'string' });
            return ns;
        }
    }, {
        key: 'create',
        value: function create() {
            this.setState({
                create: true,
                dialogOpen: true,
                selectedNamespace: this.emptyNs()
            });
        }
    }, {
        key: 'deleteNs',
        value: function deleteNs(row) {
            var _this2 = this;

            var pydio = this.props.pydio;
            var m = this.state.m;

            pydio.UI.openConfirmDialog({
                message: m('delete.confirm'),
                destructive: [row.Namespace],
                validCallback: function validCallback() {
                    _modelMetadata2['default'].deleteNS(row).then(function () {
                        _this2.load();
                    });
                }
            });
        }
    }, {
        key: 'open',
        value: function open(rows) {
            if (rows.length) {
                this.setState({
                    create: false,
                    dialogOpen: true,
                    selectedNamespace: rows[0]
                });
            }
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({ dialogOpen: false, selectedNamespace: null });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var muiTheme = this.props.muiTheme;

            var adminStyle = AdminComponents.AdminStyles(muiTheme.palette);

            var _state = this.state;
            var namespaces = _state.namespaces;
            var loading = _state.loading;
            var dialogOpen = _state.dialogOpen;
            var selectedNamespace = _state.selectedNamespace;
            var create = _state.create;
            var m = _state.m;

            if (!selectedNamespace) {
                selectedNamespace = this.emptyNs();
            }
            namespaces.sort(function (a, b) {
                var a0 = a.Order || 0;
                var b0 = b.Order || 0;
                if (a0 === b0) return 0;
                return a0 > b0 ? 1 : -1;
            });
            var _props = this.props;
            var currentNode = _props.currentNode;
            var pydio = _props.pydio;
            var accessByName = _props.accessByName;

            var columns = [{ name: 'Order', label: m('order'), style: { width: 30 }, headerStyle: { width: 30 }, hideSmall: true, renderCell: function renderCell(row) {
                    return row.Order || '0';
                }, sorter: { type: 'number' } }, { name: 'Namespace', label: m('namespace'), style: { fontSize: 15 }, sorter: { type: 'string' } }, { name: 'Label', label: m('label'), style: { width: '25%' }, headerStyle: { width: '25%' }, sorter: { type: 'string' } }, { name: 'Indexable', label: m('indexable'), style: { width: '10%' }, headerStyle: { width: '10%' }, hideSmall: true, renderCell: function renderCell(row) {
                    return row.Indexable ? 'Yes' : 'No';
                }, sorter: { type: 'number', value: function value(row) {
                        return row.Indexable ? 1 : 0;
                    } } }, { name: 'JsonDefinition', label: m('definition'), hideSmall: true, renderCell: function renderCell(row) {
                    var def = row.JsonDefinition;
                    if (!def) {
                        return '';
                    }
                    var data = JSON.parse(def);
                    return _modelMetadata2['default'].MetaTypes[data.type] || data.type;
                }, sorter: { type: 'string' } }];
            var title = currentNode.getLabel();
            var icon = currentNode.getMetadata().get('icon_class');
            var buttons = [];
            var actions = [];
            if (accessByName('Create')) {
                buttons.push(_react2['default'].createElement(_materialUi.FlatButton, _extends({ primary: true, label: m('namespace.add'), onTouchTap: function () {
                        _this3.create();
                    } }, adminStyle.props.header.flatButton)));
                actions.push({
                    iconClassName: 'mdi mdi-pencil',
                    onTouchTap: function onTouchTap(row) {
                        _this3.open([row]);
                    }
                }, {
                    iconClassName: 'mdi mdi-delete',
                    onTouchTap: function onTouchTap(row) {
                        _this3.deleteNs(row);
                    }
                });
            }

            return _react2['default'].createElement(
                'div',
                { className: 'main-layout-nav-to-stack workspaces-board' },
                _react2['default'].createElement(_editorMetaNamespace2['default'], {
                    pydio: pydio,
                    open: dialogOpen,
                    create: create,
                    namespace: selectedNamespace,
                    onRequestClose: function () {
                        return _this3.close();
                    },
                    reloadList: function () {
                        return _this3.load();
                    },
                    namespaces: namespaces,
                    readonly: !accessByName('Create')
                }),
                _react2['default'].createElement(
                    'div',
                    { className: 'vertical-layout', style: { width: '100%' } },
                    _react2['default'].createElement(AdminComponents.Header, {
                        title: title,
                        icon: icon,
                        actions: buttons,
                        reloadAction: this.load.bind(this),
                        loading: loading
                    }),
                    _react2['default'].createElement(
                        'div',
                        { className: 'layout-fill' },
                        _react2['default'].createElement(AdminComponents.SubHeader, { title: m('namespaces'), legend: m('namespaces.legend') }),
                        _react2['default'].createElement(
                            _materialUi.Paper,
                            adminStyle.body.block.props,
                            _react2['default'].createElement(MaterialTable, {
                                data: namespaces,
                                columns: columns,
                                actions: actions,
                                onSelectRows: this.open.bind(this),
                                deselectOnClickAway: true,
                                showCheckboxes: false,
                                emptyStateString: m('empty'),
                                masterStyles: adminStyle.body.tableMaster
                            })
                        )
                    )
                )
            );
        }
    }]);

    return MetadataBoard;
})(_react2['default'].Component);

exports['default'] = MetadataBoard = muiThemeable()(MetadataBoard);

exports['default'] = MetadataBoard;
module.exports = exports['default'];
