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

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

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

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var ModernTextField = _Pydio$requireLib.ModernTextField;
var ModernSelectField = _Pydio$requireLib.ModernSelectField;
var ModernStyles = _Pydio$requireLib.ModernStyles;

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

            var exist = false;
            if (chosenValue.key === undefined) {
                key = '/' + _pydioUtilLang2['default'].trim(chosenValue, '/');
                var ok = false;
                nodes.map(function (node) {
                    //const test = node.Path + '/';
                    if (node.Path === key || node.Path.indexOf(key + '/') === 0) {
                        ok = true;
                    }
                });
                if (ok) {
                    exist = true;
                }
            } else {
                key = chosenValue.key;
                exist = true;
            }
            this.setState({ value: key, exist: exist });
            this.props.onChange(key, exist);
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
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(newProps) {
            if (newProps.value && newProps.value !== this.state.value) {
                this.setState({ value: newProps.value, exist: true });
            }
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
                return Promise.resolve();
            }
            this.lastSearch = basePath;
            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var listRequest = new _pydioHttpRestApi.RestListPeerFoldersRequest();
            listRequest.PeerAddress = peerAddress === 'ANY' ? '' : peerAddress;
            listRequest.Path = basePath;
            this.setState({ loading: true });
            return api.listPeerFolders(peerAddress, listRequest).then(function (nodesColl) {
                var children = nodesColl.Children || [];
                children = children.map(function (c) {
                    if (c.Path[0] !== '/') {
                        c.Path = '/' + c.Path;
                    }
                    return c;
                });
                _this.setState({ nodes: children, loading: false });
            })['catch'](function () {
                _this.setState({ loading: false });
            });
        }
    }, {
        key: 'createFolder',
        value: function createFolder(newName) {
            var _this2 = this;

            var _props = this.props;
            var peerAddress = _props.peerAddress;
            var pydio = _props.pydio;
            var value = this.state.value;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            var createRequest = new _pydioHttpRestApi.RestCreatePeerFolderRequest();
            createRequest.PeerAddress = peerAddress === 'ANY' ? '' : peerAddress;
            createRequest.Path = value + '/' + newName;
            api.createPeerFolder(peerAddress, createRequest).then(function (result) {
                _this2.lastSearch = null; // Force reload
                _this2.loadValues(value).then(function () {
                    // Select path after reload
                    _this2.handleNewRequest(createRequest.Path);
                });
            })['catch'](function (e) {
                pydio.UI.displayMessage('ERROR', e.message);
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
            } else if (node.MetaStore && node.MetaStore['symlink']) {
                // Symbolic link
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
                        { style: { color: '#1976d2' } },
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
        key: 'showCreateDialog',
        value: function showCreateDialog() {
            var _this3 = this;

            var pydio = this.props.pydio;
            var value = this.state.value;

            var m = function m(id) {
                return pydio.MessageHash['ajxp_admin.ds.editor.selector.' + id] || id;
            };
            pydio.UI.openComponentInModal('PydioReactUI', 'PromptDialog', {
                dialogTitle: m('mkdir'),
                legendId: m('mkdir.legend').replace('%s', value),
                fieldLabelId: m('mkdir.field'),
                submitValue: function submitValue(v) {
                    if (!v) {
                        return;
                    }
                    _this3.createFolder(v);
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            var _state = this.state;
            var nodes = _state.nodes;
            var loading = _state.loading;
            var exist = _state.exist;
            var value = _state.value;
            var searchText = _state.searchText;
            var _props2 = this.props;
            var fieldLabel = _props2.fieldLabel;
            var pydio = _props2.pydio;

            var dataSource = [];
            if (nodes) {
                nodes.forEach(function (node) {
                    dataSource.push(_this4.renderNode(node));
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
                value && exist && !loading && (!searchText || searchText === value) && _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute', right: 0 } },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        iconClassName: "mdi mdi-folder-plus",
                        iconStyle: { color: '#9e9e9e' },
                        onTouchTap: function () {
                            return _this4.showCreateDialog();
                        },
                        tooltip: pydio.MessageHash['ajxp_admin.ds.editor.selector.mkdir']
                    })
                ),
                _react2['default'].createElement(_materialUi.AutoComplete, _extends({
                    fullWidth: true,
                    searchText: displayText,
                    onUpdateInput: this.handleUpdateInput.bind(this),
                    onNewRequest: this.handleNewRequest.bind(this),
                    dataSource: dataSource,
                    hintText: fieldLabel,
                    filter: function (searchText, key) {
                        return key.toLowerCase().indexOf(searchText.toLowerCase()) === 0;
                    },
                    openOnFocus: true,
                    menuProps: { maxHeight: 200 }
                }, ModernStyles.textField))
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
        key: 'compareAddresses',
        value: function compareAddresses(a1, a2) {
            var p1 = a1.split("|");
            var p2 = a2.split("|");
            return p2.filter(function (p) {
                return p1.indexOf(p) > -1;
            }).length || p1.filter(function (p) {
                return p2.indexOf(p) > -1;
            }).length;
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this5 = this;

            var model = this.props.model;

            var api = new _pydioHttpRestApi.ConfigServiceApi(_pydioHttpApi2['default'].getRestClient());
            api.listPeersAddresses().then(function (res) {
                var aa = res.PeerAddresses || [];
                if (aa === 1 && !model.PeerAddress) {
                    model.PeerAddress = aa[0];
                }
                _this5.setState({ peerAddresses: aa });
                if (model.PeerAddress && aa.indexOf(model.PeerAddress) === -1) {
                    var rep = aa.filter(function (a) {
                        return _this5.compareAddresses(a, model.PeerAddress);
                    });
                    if (rep.length) {
                        // If model address is contained in one of the res, replace it
                        model.PeerAddress = rep[0];
                    } else {
                        // Otherwise show it as invalid
                        _this5.setState({ invalidAddress: model.PeerAddress });
                    }
                }
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
            return invalid;
        }
    }, {
        key: 'onPathChange',
        value: function onPathChange(newValue, exists) {
            var model = this.props.model;

            var invalid = this.baseIsInvalid(newValue);
            model.invalid = invalid;
            model.StorageConfiguration.folder = newValue;
            if (!exists) {
                model.StorageConfiguration.create = 'true';
            } else if (model.StorageConfiguration['create'] !== undefined) {
                delete model.StorageConfiguration['create'];
            }
            this.setState({ invalid: invalid });
        }
    }, {
        key: 'onPeerChange',
        value: function onPeerChange(newValue) {
            var model = this.props.model;
            var invalidAddress = this.state.invalidAddress;

            if (newValue === invalidAddress) {
                return;
            }
            model.PeerAddress = newValue;
            if (invalidAddress) {
                // Now remove from choices
                this.setState({ invalidAddress: null });
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this6 = this;

            var _props3 = this.props;
            var model = _props3.model;
            var pydio = _props3.pydio;
            var _state2 = this.state;
            var peerAddresses = _state2.peerAddresses;
            var invalidAddress = _state2.invalidAddress;
            var invalid = _state2.invalid;
            var m = _state2.m;

            var pAds = peerAddresses || [];
            pAds = ["ANY"].concat(_toConsumableArray(pAds));
            if (invalidAddress) {
                pAds = [invalidAddress].concat(_toConsumableArray(pAds));
            }

            return _react2['default'].createElement(
                'div',
                null,
                _react2['default'].createElement(
                    'div',
                    { style: { paddingBottom: 8 } },
                    _react2['default'].createElement(
                        ModernSelectField,
                        {
                            value: model.PeerAddress || '',
                            hintText: m('selector.peer') + ' *',
                            onChange: function (e, i, v) {
                                return _this6.onPeerChange(v);
                            },
                            fullWidth: true
                        },
                        pAds.map(function (address) {
                            var label = 'Any peer (unique node or distributed FS)';
                            if (address !== 'ANY') {
                                label = "Peer : " + address.replace('|', ' | ') + (address === invalidAddress ? " (invalid)" : "");
                            }
                            return _react2['default'].createElement(_materialUi.MenuItem, { value: address, primaryText: label });
                        })
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    null,
                    model.PeerAddress && _react2['default'].createElement(AutocompleteTree, {
                        pydio: pydio,
                        value: model.StorageConfiguration.folder,
                        peerAddress: model.PeerAddress,
                        onChange: this.onPathChange.bind(this),
                        fieldLabel: m('selector.completer') + (model.StorageConfiguration.create ? ' (' + m('selector.completer.create') + ')' : '') + ' *',
                        hintText: m('selector.completer.hint')
                    }),
                    !model.PeerAddress && _react2['default'].createElement(ModernTextField, {
                        style: { marginTop: -3 },
                        fullWidth: true,
                        disabled: true,
                        value: model.StorageConfiguration.folder,
                        floatingLabelText: m('selector.folder') + ' *',
                        hintText: m('selector.folder.hint')
                    })
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
