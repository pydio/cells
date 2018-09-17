'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _materialUi = require('material-ui');

var _lodashDebounce = require('lodash.debounce');

var _lodashDebounce2 = _interopRequireDefault(_lodashDebounce);

var _pydioUtilLang = require('pydio/util/lang');

var _pydioUtilLang2 = _interopRequireDefault(_pydioUtilLang);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var AutocompleteTree = (function (_React$Component) {
    _inherits(AutocompleteTree, _React$Component);

    function AutocompleteTree(props) {
        _classCallCheck(this, AutocompleteTree);

        _get(Object.getPrototypeOf(AutocompleteTree.prototype), 'constructor', this).call(this, props);
        this.debounced = (0, _lodashDebounce2['default'])(this.loadValues.bind(this), 300);
        this.state = { searchText: props.value, value: props.value };
    }

    _createClass(AutocompleteTree, [{
        key: 'handleUpdateInput',
        value: function handleUpdateInput(searchText) {
            this.debounced();
            this.setState({ searchText: searchText });
        }
    }, {
        key: 'handleNewRequest',
        value: function handleNewRequest(chosenValue) {
            var key = undefined;
            var nodes = this.state.nodes;

            if (chosenValue.key === undefined) {
                key = chosenValue;
                var ok = false;
                nodes.map(function (node) {
                    if (node.Path === key) {
                        ok = true;
                    }
                });
                if (!ok) {
                    nodes.map(function (node) {
                        if (node.Path.indexOf(key) === 0) {
                            key = node.Path;
                            ok = true;
                        }
                    });
                }
                if (!ok) {
                    return;
                }
            } else {
                key = chosenValue.key;
            }
            this.setState({ value: key });
            this.props.onChange(key);
            this.loadValues(key);
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            this.lastSearch = null;
            var value = "";
            if (this.props.value) {
                value = this.props.value;
            }
            this.loadValues(value);
        }
    }, {
        key: 'loadValues',
        value: function loadValues() {
            var _this = this;

            var value = arguments.length <= 0 || arguments[0] === undefined ? "" : arguments[0];
            var peerAddress = this.props.peerAddress;
            var searchText = this.state.searchText;

            var basePath = value;
            if (!value && searchText) {
                var last = searchText.lastIndexOf('/');
                basePath = searchText.substr(0, last);
            }
            if (this.lastSearch !== null && this.lastSearch === basePath) {
                return;
            }
            this.lastSearch = basePath;
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var listRequest = new _pydioHttpRestApi.RestListPeerFoldersRequest();
            listRequest.PeerAddress = peerAddress;
            listRequest.Path = basePath;
            this.setState({ loading: true });
            api.listPeerFolders(peerAddress, listRequest).then(function (nodesColl) {
                _this.setState({ nodes: nodesColl.Children || [], loading: false });
            })['catch'](function () {
                _this.setState({ loading: false });
            });
        }
    }, {
        key: 'renderNode',
        value: function renderNode(node) {
            var base = _pydioUtilPath2['default'].getBasename(node.Path);
            var dir = _pydioUtilPath2['default'].getDirname(node.Path);
            var label = _react2['default'].createElement(
                'span',
                null,
                node.Path
            );
            var invalid = false;
            if (_pydioUtilLang2['default'].computeStringSlug(base) !== base) {
                label = _react2['default'].createElement(
                    'span',
                    null,
                    _react2['default'].createElement(
                        'span',
                        null,
                        dir
                    ),
                    '/',
                    _react2['default'].createElement(
                        'span',
                        { style: { color: '#c62828' } },
                        base
                    )
                );
            }
            return {
                key: node.Path,
                text: node.Path,
                invalid: invalid,
                value: _react2['default'].createElement(
                    _materialUi.MenuItem,
                    null,
                    _react2['default'].createElement(_materialUi.FontIcon, { className: "mdi mdi-folder", color: '#616161', style: { float: 'left', marginRight: 8 } }),
                    ' ',
                    label
                )
            };
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;
            var fieldLabel = this.props.fieldLabel;

            var dataSource = [];
            if (nodes) {
                nodes.forEach(function (node) {
                    dataSource.push(_this2.renderNode(node));
                });
            }

            var displayText = this.state.value;

            return _react2['default'].createElement(
                'div',
                { style: { position: 'relative', marginTop: -5 } },
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute', right: 0, top: 30, width: 30 } },
                    _react2['default'].createElement(_materialUi.RefreshIndicator, {
                        size: 30,
                        left: 0,
                        top: 0,
                        status: loading ? "loading" : "hide"
                    })
                ),
                _react2['default'].createElement(_materialUi.AutoComplete, {
                    fullWidth: true,
                    searchText: displayText,
                    onUpdateInput: this.handleUpdateInput.bind(this),
                    onNewRequest: this.handleNewRequest.bind(this),
                    dataSource: dataSource,
                    floatingLabelText: fieldLabel,
                    floatingLabelStyle: { whiteSpace: 'nowrap' },
                    floatingLabelFixed: true,
                    filter: function (searchText, key) {
                        return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                    },
                    openOnFocus: true,
                    menuProps: { maxHeight: 200 }
                })
            );
        }
    }]);

    return AutocompleteTree;
})(_react2['default'].Component);

var DataSourceLocalSelector = (function (_React$Component2) {
    _inherits(DataSourceLocalSelector, _React$Component2);

    function DataSourceLocalSelector(props) {
        _classCallCheck(this, DataSourceLocalSelector);

        _get(Object.getPrototypeOf(DataSourceLocalSelector.prototype), 'constructor', this).call(this, props);
        this.state = {
            peerAddresses: [],
            invalid: false,
            m: function m(id) {
                return props.pydio.MessageHash['ajxp_admin.ds.editor.' + id] || id;
            }
        };
    }

    _createClass(DataSourceLocalSelector, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this3 = this;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.listPeersAddresses().then(function (res) {
                _this3.setState({ peerAddresses: res.PeerAddresses });
            });
        }
    }, {
        key: 'baseIsInvalid',
        value: function baseIsInvalid(path) {
            var m = this.state.m;

            var invalid = false;
            var base = _pydioUtilPath2['default'].getBasename(path);
            var segments = _pydioUtilLang2['default'].trim(path, '/').split('/').length;
            if (segments < 2) {
                invalid = m('selector.error.depth');
            } else if (_pydioUtilLang2['default'].computeStringSlug(base) !== base) {
                invalid = m('selector.error.dnsname');
            }
            console.log(invalid);
            return invalid;
        }
    }, {
        key: 'onPathChange',
        value: function onPathChange(newValue) {
            var model = this.props.model;

            var invalid = this.baseIsInvalid(newValue);
            model.invalid = invalid;
            model.StorageConfiguration.folder = newValue;
            this.setState({ invalid: invalid });
        }
    }, {
        key: 'render',
        value: function render() {
            var model = this.props.model;
            var _state2 = this.state;
            var peerAddresses = _state2.peerAddresses;
            var invalid = _state2.invalid;
            var m = _state2.m;

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' } },
                    _react2['default'].createElement(
                        'div',
                        { style: { width: 180, marginRight: 10 } },
                        _react2['default'].createElement(
                            _materialUi.SelectField,
                            {
                                value: model.PeerAddress || '',
                                floatingLabelFixed: true,
                                floatingLabelText: m('selector.peer'),
                                onChange: function (e, i, v) {
                                    model.PeerAddress = v;
                                },
                                fullWidth: true
                            },
                            peerAddresses.map(function (address) {
                                return _react2['default'].createElement(_materialUi.MenuItem, { value: address, primaryText: address });
                            })
                        )
                    ),
                    _react2['default'].createElement(
                        'div',
                        { style: { flex: 1 } },
                        model.PeerAddress && _react2['default'].createElement(AutocompleteTree, {
                            value: model.StorageConfiguration.folder,
                            peerAddress: model.PeerAddress,
                            onChange: this.onPathChange.bind(this),
                            fieldLabel: m('selector.completer')
                        }),
                        !model.PeerAddress && _react2['default'].createElement(_materialUi.TextField, {
                            style: { marginTop: -3 },
                            fullWidth: true,
                            disabled: true,
                            value: model.StorageConfiguration.folder,
                            floatingLabelText: m('selector.folder'),
                            floatingLabelFixed: true,
                            hintText: m('selector.folder.hint')
                        })
                    )
                ),
                invalid && _react2['default'].createElement(
                    'div',
                    { style: { color: '#c62828' } },
                    invalid
                )
            );
        }
    }]);

    return DataSourceLocalSelector;
})(_react2['default'].Component);

exports['default'] = DataSourceLocalSelector;
module.exports = exports['default'];
