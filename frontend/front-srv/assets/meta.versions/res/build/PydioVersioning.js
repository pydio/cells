(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.PydioVersioning = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Callbacks = (function () {
    function Callbacks() {
        _classCallCheck(this, Callbacks);
    }

    _createClass(Callbacks, null, [{
        key: 'loadHistoryBrowser',
        value: function loadHistoryBrowser() {
            pydio.UI.openComponentInModal('PydioVersioning', 'HistoryDialog', { node: pydio.getContextHolder().getUniqueNode() });
        }
    }]);

    return Callbacks;
})();

exports['default'] = Callbacks;
module.exports = exports['default'];

},{}],2:[function(require,module,exports){
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var PydioApi = require('pydio/http/api');
var MetaNodeProvider = require('pydio/model/meta-node-provider');
var PydioDataModel = require('pydio/model/data-model');
var Node = require('pydio/model/node');

var HistoryApi = (function () {
    function HistoryApi(node) {
        _classCallCheck(this, HistoryApi);

        this.node = node;
    }

    _createClass(HistoryApi, [{
        key: 'getDataModel',
        value: function getDataModel() {
            if (!this.versionsDm) {
                var provider = new MetaNodeProvider({ versions: 'true', file: this.node.getPath() });
                this.versionsDm = new PydioDataModel(true);
                this.versionsDm.setAjxpNodeProvider(provider);
                this.versionsRoot = new Node("/", false, "Versions", "folder.png", provider);
                this.versionsDm.setRootNode(this.versionsRoot);
            }
            return this.versionsDm;
        }
    }, {
        key: 'openVersion',
        value: function openVersion(versionNode) {

            PydioApi.getClient().openVersion(this.node, versionNode.getMetadata().get('versionId'));
        }
    }, {
        key: 'revertToVersion',
        value: function revertToVersion(versionNode) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            if (!confirm(pydio.MessageHash["meta.versions.13"])) {
                return;
            }
            PydioApi.getClient().revertToVersion(this.node, versionNode.getMetadata().get('versionId'), callback);
        }
    }]);

    return HistoryApi;
})();

exports['default'] = HistoryApi;
module.exports = exports['default'];

},{"pydio/http/api":"pydio/http/api","pydio/model/data-model":"pydio/model/data-model","pydio/model/meta-node-provider":"pydio/model/meta-node-provider","pydio/model/node":"pydio/model/node"}],3:[function(require,module,exports){
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

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _HistoryApi = require('./HistoryApi');

var _HistoryApi2 = _interopRequireDefault(_HistoryApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

var _materialUi = require('material-ui');

var Node = require('pydio/model/node');
var PydioReactUi = _pydio2['default'].requireLib('boot');

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var UserAvatar = _Pydio$requireLib.UserAvatar;
var NodeListCustomProvider = _Pydio$requireLib.NodeListCustomProvider;
var SimpleList = _Pydio$requireLib.SimpleList;

var UserLinkWrapper = function UserLinkWrapper(_ref) {
    var href = _ref.href;
    var children = _ref.children;

    if (href.startsWith('user://')) {
        var userId = href.replace('user://', '');
        return _react2['default'].createElement(UserAvatar, {
            userId: userId,
            displayAvatar: false,
            richOnClick: false,
            style: { cursor: 'pointer', display: 'inline-block', color: 'rgb(66, 140, 179)' },
            pydio: _pydio2['default'].getInstance()
        });
    }
    return _react2['default'].createElement(
        'span',
        null,
        children
    );
};

var Paragraph = function Paragraph(_ref2) {
    var children = _ref2.children;
    return _react2['default'].createElement(
        'span',
        null,
        children
    );
};

var HistoryBrowser = (0, _createReactClass2['default'])({

    propTypes: {
        node: _propTypes2['default'].instanceOf(Node).isRequired,
        onRequestClose: _propTypes2['default'].func
    },

    propsToState: function propsToState(node) {
        if (this.state && this.state.api) {
            this.state.api.stopObserving('selection_changed');
        }
        var api = new _HistoryApi2['default'](node);
        this._selectionObserver = (function () {
            if (api.getDataModel().isEmpty()) {
                this.setState({ selectedNode: null });
            } else {
                this.setState({ selectedNode: api.getDataModel().getUniqueNode() });
            }
        }).bind(this);
        api.getDataModel().observe('selection_changed', this._selectionObserver);
        return { api: api };
    },

    getInitialState: function getInitialState() {
        return this.propsToState(this.props.node);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        if (nextProps.node !== this.props.node) {
            this.setState(this.propsToState(nextProps.node));
        }
    },

    nodeClicked: function nodeClicked(node) {
        this.state.api.getDataModel().setSelectedNodes([node]);
    },

    applyAction: function applyAction(action) {
        var _state = this.state;
        var api = _state.api;
        var selectedNode = _state.selectedNode;

        switch (action) {
            case 'dl':
                api.openVersion(selectedNode);
                break;
            case 'revert':
                api.revertToVersion(selectedNode, (function () {
                    if (this.props.onRequestClose) {
                        this.props.onRequestClose();
                    }
                }).bind(this));
                break;
            default:
                break;
        }
    },

    render: function render() {

        var mess = window.pydio.MessageHash;
        var tableKeys = {
            index: { label: mess['meta.versions.9'], sortType: 'string', width: '10%', renderCell: function renderCell(data) {
                    return "#" + data.getMetadata().get('versionId').substr(0, 6);
                } },
            Size: { label: mess['2'], sortType: 'number', width: '10%', renderCell: function renderCell(data) {
                    var s = parseInt(data.getMetadata().get('bytesize'));
                    return _pydioUtilPath2['default'].roundFileSize(s);
                } },
            ajxp_modiftime: { label: mess['meta.versions.10'], sortType: 'string', width: '25%' },
            versionDescription: { label: mess['meta.versions.11'], sortType: 'string', width: '55%', renderCell: function renderCell(data) {
                    return _react2['default'].createElement(
                        'span',
                        { title: mess['meta.versions.11'] },
                        _react2['default'].createElement(_reactMarkdown2['default'], { source: data.getMetadata().get('versionDescription'), renderers: { 'link': UserLinkWrapper, 'paragraph': Paragraph } })
                    );
                } }
        };

        var disabled = !this.state.selectedNode;
        return _react2['default'].createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column' } },
            _react2['default'].createElement(
                _materialUi.Toolbar,
                null,
                _react2['default'].createElement(
                    _materialUi.ToolbarGroup,
                    { firstChild: true },
                    _react2['default'].createElement(
                        'div',
                        { style: { paddingLeft: 20, color: 'white', fontSize: 18 } },
                        mess['meta.versions.16'].replace('%s', this.props.node.getLabel())
                    )
                ),
                _react2['default'].createElement(
                    _materialUi.ToolbarGroup,
                    { lastChild: true, style: { paddingRight: 7 } },
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-download", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.3'], tooltip: mess['meta.versions.4'], onClick: this.applyAction.bind(this, 'dl') }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-backup-restore", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.7'], tooltip: mess['meta.versions.8'], onClick: this.applyAction.bind(this, 'revert') })
                )
            ),
            _react2['default'].createElement(NodeListCustomProvider, {
                style: { flex: 1 },
                presetDataModel: this.state.api.getDataModel(),
                actionBarGroups: [],
                elementHeight: SimpleList.HEIGHT_ONE_LINE,
                tableKeys: tableKeys,
                entryHandleClicks: this.nodeClicked,
                emptyStateProps: {
                    iconClassName: "mdi mdi-backup-restore",
                    primaryTextId: "meta.versions.14",
                    style: {
                        backgroundColor: 'transparent',
                        padding: 40
                    },
                    secondaryTextId: "meta.versions.15"
                }

            }),
            _react2['default'].createElement(_materialUi.Divider, null)
        );
    }

});

if (window.ReactDND) {
    var FakeDndBackend = function FakeDndBackend() {
        return {
            setup: function setup() {},
            teardown: function teardown() {},
            connectDragSource: function connectDragSource() {},
            connectDragPreview: function connectDragPreview() {},
            connectDropTarget: function connectDropTarget() {}
        };
    };
    HistoryBrowser = window.ReactDND.DragDropContext(FakeDndBackend)(HistoryBrowser);
}

var HistoryDialog = (0, _createReactClass2['default'])({

    mixins: [PydioReactUi.ActionDialogMixin, PydioReactUi.SubmitButtonProviderMixin],

    getDefaultProps: function getDefaultProps() {
        return {
            dialogTitle: '',
            dialogIsModal: false,
            dialogSize: 'lg',
            dialogPadding: false
        };
    },
    submit: function submit() {
        this.dismiss();
    },
    render: function render() {
        return _react2['default'].createElement(
            'div',
            { style: { width: '100%' }, className: 'layout-fill vertical-layout' },
            _react2['default'].createElement(HistoryBrowser, { node: this.props.node, onRequestClose: this.dismiss })
        );
    }

});

exports['default'] = HistoryDialog;
module.exports = exports['default'];

},{"./HistoryApi":2,"create-react-class":"create-react-class","material-ui":"material-ui","prop-types":"prop-types","pydio":"pydio","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react","react-markdown":"react-markdown"}],4:[function(require,module,exports){
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

var _HistoryDialog = require('./HistoryDialog');

var _HistoryDialog2 = _interopRequireDefault(_HistoryDialog);

var _Callbacks = require('./Callbacks');

var _Callbacks2 = _interopRequireDefault(_Callbacks);

exports.HistoryDialog = _HistoryDialog2['default'];
exports.Callbacks = _Callbacks2['default'];

},{"./Callbacks":1,"./HistoryDialog":3}]},{},[4])(4)
});

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9ncnVudC1icm93c2VyaWZ5QDQuMC4xL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9WZXJzaW9uaW5nL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeUFwaS5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeURpYWxvZy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2xvYWRIaXN0b3J5QnJvd3NlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkSGlzdG9yeUJyb3dzZXIoKSB7XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnUHlkaW9WZXJzaW9uaW5nJywgJ0hpc3RvcnlEaWFsb2cnLCB7IG5vZGU6IHB5ZGlvLmdldENvbnRleHRIb2xkZXIoKS5nZXRVbmlxdWVOb2RlKCkgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2FsbGJhY2tzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgUHlkaW9BcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xudmFyIE1ldGFOb2RlUHJvdmlkZXIgPSByZXF1aXJlKCdweWRpby9tb2RlbC9tZXRhLW5vZGUtcHJvdmlkZXInKTtcbnZhciBQeWRpb0RhdGFNb2RlbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2RhdGEtbW9kZWwnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbm9kZScpO1xuXG52YXIgSGlzdG9yeUFwaSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSGlzdG9yeUFwaShub2RlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBIaXN0b3J5QXBpKTtcblxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhIaXN0b3J5QXBpLCBbe1xuICAgICAgICBrZXk6ICdnZXREYXRhTW9kZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RGF0YU1vZGVsKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZlcnNpb25zRG0pIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgTWV0YU5vZGVQcm92aWRlcih7IHZlcnNpb25zOiAndHJ1ZScsIGZpbGU6IHRoaXMubm9kZS5nZXRQYXRoKCkgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtID0gbmV3IFB5ZGlvRGF0YU1vZGVsKHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNEbS5zZXRBanhwTm9kZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25zUm9vdCA9IG5ldyBOb2RlKFwiL1wiLCBmYWxzZSwgXCJWZXJzaW9uc1wiLCBcImZvbGRlci5wbmdcIiwgcHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNEbS5zZXRSb290Tm9kZSh0aGlzLnZlcnNpb25zUm9vdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJzaW9uc0RtO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuVmVyc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuVmVyc2lvbih2ZXJzaW9uTm9kZSkge1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5vcGVuVmVyc2lvbih0aGlzLm5vZGUsIHZlcnNpb25Ob2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd2ZXJzaW9uSWQnKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JldmVydFRvVmVyc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlcnRUb1ZlcnNpb24odmVyc2lvbk5vZGUpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIGlmICghY29uZmlybShweWRpby5NZXNzYWdlSGFzaFtcIm1ldGEudmVyc2lvbnMuMTNcIl0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmV2ZXJ0VG9WZXJzaW9uKHRoaXMubm9kZSwgdmVyc2lvbk5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25JZCcpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSGlzdG9yeUFwaTtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEhpc3RvcnlBcGk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9wcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG5cbnZhciBfcHJvcFR5cGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3Byb3BUeXBlcyk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xuXG52YXIgX2NyZWF0ZVJlYWN0Q2xhc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlUmVhY3RDbGFzcyk7XG5cbnZhciBfSGlzdG9yeUFwaSA9IHJlcXVpcmUoJy4vSGlzdG9yeUFwaScpO1xuXG52YXIgX0hpc3RvcnlBcGkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfSGlzdG9yeUFwaSk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aCA9IHJlcXVpcmUoJ3B5ZGlvL3V0aWwvcGF0aCcpO1xuXG52YXIgX3B5ZGlvVXRpbFBhdGgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHlkaW9VdGlsUGF0aCk7XG5cbnZhciBfcmVhY3RNYXJrZG93biA9IHJlcXVpcmUoJ3JlYWN0LW1hcmtkb3duJyk7XG5cbnZhciBfcmVhY3RNYXJrZG93bjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9yZWFjdE1hcmtkb3duKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG52YXIgUHlkaW9SZWFjdFVpID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2Jvb3QnKTtcblxudmFyIF9QeWRpbyRyZXF1aXJlTGliID0gX3B5ZGlvMlsnZGVmYXVsdCddLnJlcXVpcmVMaWIoJ2NvbXBvbmVudHMnKTtcblxudmFyIFVzZXJBdmF0YXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5Vc2VyQXZhdGFyO1xudmFyIE5vZGVMaXN0Q3VzdG9tUHJvdmlkZXIgPSBfUHlkaW8kcmVxdWlyZUxpYi5Ob2RlTGlzdEN1c3RvbVByb3ZpZGVyO1xudmFyIFNpbXBsZUxpc3QgPSBfUHlkaW8kcmVxdWlyZUxpYi5TaW1wbGVMaXN0O1xuXG52YXIgVXNlckxpbmtXcmFwcGVyID0gZnVuY3Rpb24gVXNlckxpbmtXcmFwcGVyKF9yZWYpIHtcbiAgICB2YXIgaHJlZiA9IF9yZWYuaHJlZjtcbiAgICB2YXIgY2hpbGRyZW4gPSBfcmVmLmNoaWxkcmVuO1xuXG4gICAgaWYgKGhyZWYuc3RhcnRzV2l0aCgndXNlcjovLycpKSB7XG4gICAgICAgIHZhciB1c2VySWQgPSBocmVmLnJlcGxhY2UoJ3VzZXI6Ly8nLCAnJyk7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChVc2VyQXZhdGFyLCB7XG4gICAgICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgICAgIGRpc3BsYXlBdmF0YXI6IGZhbHNlLFxuICAgICAgICAgICAgcmljaE9uQ2xpY2s6IGZhbHNlLFxuICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBjb2xvcjogJ3JnYig2NiwgMTQwLCAxNzkpJyB9LFxuICAgICAgICAgICAgcHlkaW86IF9weWRpbzJbJ2RlZmF1bHQnXS5nZXRJbnN0YW5jZSgpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICdzcGFuJyxcbiAgICAgICAgbnVsbCxcbiAgICAgICAgY2hpbGRyZW5cbiAgICApO1xufTtcblxudmFyIFBhcmFncmFwaCA9IGZ1bmN0aW9uIFBhcmFncmFwaChfcmVmMikge1xuICAgIHZhciBjaGlsZHJlbiA9IF9yZWYyLmNoaWxkcmVuO1xuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3NwYW4nLFxuICAgICAgICBudWxsLFxuICAgICAgICBjaGlsZHJlblxuICAgICk7XG59O1xuXG52YXIgSGlzdG9yeUJyb3dzZXIgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcblxuICAgIHByb3BUeXBlczoge1xuICAgICAgICBub2RlOiBfcHJvcFR5cGVzMlsnZGVmYXVsdCddLmluc3RhbmNlT2YoTm9kZSkuaXNSZXF1aXJlZCxcbiAgICAgICAgb25SZXF1ZXN0Q2xvc2U6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uZnVuY1xuICAgIH0sXG5cbiAgICBwcm9wc1RvU3RhdGU6IGZ1bmN0aW9uIHByb3BzVG9TdGF0ZShub2RlKSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYmIHRoaXMuc3RhdGUuYXBpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlLmFwaS5zdG9wT2JzZXJ2aW5nKCdzZWxlY3Rpb25fY2hhbmdlZCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcGkgPSBuZXcgX0hpc3RvcnlBcGkyWydkZWZhdWx0J10obm9kZSk7XG4gICAgICAgIHRoaXMuX3NlbGVjdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhcGkuZ2V0RGF0YU1vZGVsKCkuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkTm9kZTogbnVsbCB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkTm9kZTogYXBpLmdldERhdGFNb2RlbCgpLmdldFVuaXF1ZU5vZGUoKSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgYXBpLmdldERhdGFNb2RlbCgpLm9ic2VydmUoJ3NlbGVjdGlvbl9jaGFuZ2VkJywgdGhpcy5fc2VsZWN0aW9uT2JzZXJ2ZXIpO1xuICAgICAgICByZXR1cm4geyBhcGk6IGFwaSB9O1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvcHNUb1N0YXRlKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMubm9kZSAhPT0gdGhpcy5wcm9wcy5ub2RlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMucHJvcHNUb1N0YXRlKG5leHRQcm9wcy5ub2RlKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbm9kZUNsaWNrZWQ6IGZ1bmN0aW9uIG5vZGVDbGlja2VkKG5vZGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcGkuZ2V0RGF0YU1vZGVsKCkuc2V0U2VsZWN0ZWROb2Rlcyhbbm9kZV0pO1xuICAgIH0sXG5cbiAgICBhcHBseUFjdGlvbjogZnVuY3Rpb24gYXBwbHlBY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgYXBpID0gX3N0YXRlLmFwaTtcbiAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IF9zdGF0ZS5zZWxlY3RlZE5vZGU7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2RsJzpcbiAgICAgICAgICAgICAgICBhcGkub3BlblZlcnNpb24oc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JldmVydCc6XG4gICAgICAgICAgICAgICAgYXBpLnJldmVydFRvVmVyc2lvbihzZWxlY3RlZE5vZGUsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIG1lc3MgPSB3aW5kb3cucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciB0YWJsZUtleXMgPSB7XG4gICAgICAgICAgICBpbmRleDogeyBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy45J10sIHNvcnRUeXBlOiAnc3RyaW5nJywgd2lkdGg6ICcxMCUnLCByZW5kZXJDZWxsOiBmdW5jdGlvbiByZW5kZXJDZWxsKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiI1wiICsgZGF0YS5nZXRNZXRhZGF0YSgpLmdldCgndmVyc2lvbklkJykuc3Vic3RyKDAsIDYpO1xuICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIFNpemU6IHsgbGFiZWw6IG1lc3NbJzInXSwgc29ydFR5cGU6ICdudW1iZXInLCB3aWR0aDogJzEwJScsIHJlbmRlckNlbGw6IGZ1bmN0aW9uIHJlbmRlckNlbGwoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHBhcnNlSW50KGRhdGEuZ2V0TWV0YWRhdGEoKS5nZXQoJ2J5dGVzaXplJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10ucm91bmRGaWxlU2l6ZShzKTtcbiAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICBhanhwX21vZGlmdGltZTogeyBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy4xMCddLCBzb3J0VHlwZTogJ3N0cmluZycsIHdpZHRoOiAnMjUlJyB9LFxuICAgICAgICAgICAgdmVyc2lvbkRlc2NyaXB0aW9uOiB7IGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjExJ10sIHNvcnRUeXBlOiAnc3RyaW5nJywgd2lkdGg6ICc1NSUnLCByZW5kZXJDZWxsOiBmdW5jdGlvbiByZW5kZXJDZWxsKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NwYW4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyB0aXRsZTogbWVzc1snbWV0YS52ZXJzaW9ucy4xMSddIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfcmVhY3RNYXJrZG93bjJbJ2RlZmF1bHQnXSwgeyBzb3VyY2U6IGRhdGEuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25EZXNjcmlwdGlvbicpLCByZW5kZXJlcnM6IHsgJ2xpbmsnOiBVc2VyTGlua1dyYXBwZXIsICdwYXJhZ3JhcGgnOiBQYXJhZ3JhcGggfSB9KVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0gfVxuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBkaXNhYmxlZCA9ICF0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicgfSB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVG9vbGJhcixcbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Ub29sYmFyR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHsgZmlyc3RDaGlsZDogdHJ1ZSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgICAgICAgICAgICAgeyBzdHlsZTogeyBwYWRkaW5nTGVmdDogMjAsIGNvbG9yOiAnd2hpdGUnLCBmb250U2l6ZTogMTggfSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc1snbWV0YS52ZXJzaW9ucy4xNiddLnJlcGxhY2UoJyVzJywgdGhpcy5wcm9wcy5ub2RlLmdldExhYmVsKCkpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Ub29sYmFyR3JvdXAsXG4gICAgICAgICAgICAgICAgICAgIHsgbGFzdENoaWxkOiB0cnVlLCBzdHlsZTogeyBwYWRkaW5nUmlnaHQ6IDcgfSB9LFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1kb3dubG9hZFwiLCB0b29sdGlwUG9zaXRpb246IFwiYm90dG9tLWxlZnRcIiwgaWNvblN0eWxlOiBkaXNhYmxlZCA/IHt9IDogeyBjb2xvcjogJ3doaXRlJyB9LCBkaXNhYmxlZDogZGlzYWJsZWQsIGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjMnXSwgdG9vbHRpcDogbWVzc1snbWV0YS52ZXJzaW9ucy40J10sIG9uQ2xpY2s6IHRoaXMuYXBwbHlBY3Rpb24uYmluZCh0aGlzLCAnZGwnKSB9KSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktYmFja3VwLXJlc3RvcmVcIiwgdG9vbHRpcFBvc2l0aW9uOiBcImJvdHRvbS1sZWZ0XCIsIGljb25TdHlsZTogZGlzYWJsZWQgPyB7fSA6IHsgY29sb3I6ICd3aGl0ZScgfSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy43J10sIHRvb2x0aXA6IG1lc3NbJ21ldGEudmVyc2lvbnMuOCddLCBvbkNsaWNrOiB0aGlzLmFwcGx5QWN0aW9uLmJpbmQodGhpcywgJ3JldmVydCcpIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KE5vZGVMaXN0Q3VzdG9tUHJvdmlkZXIsIHtcbiAgICAgICAgICAgICAgICBzdHlsZTogeyBmbGV4OiAxIH0sXG4gICAgICAgICAgICAgICAgcHJlc2V0RGF0YU1vZGVsOiB0aGlzLnN0YXRlLmFwaS5nZXREYXRhTW9kZWwoKSxcbiAgICAgICAgICAgICAgICBhY3Rpb25CYXJHcm91cHM6IFtdLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRIZWlnaHQ6IFNpbXBsZUxpc3QuSEVJR0hUX09ORV9MSU5FLFxuICAgICAgICAgICAgICAgIHRhYmxlS2V5czogdGFibGVLZXlzLFxuICAgICAgICAgICAgICAgIGVudHJ5SGFuZGxlQ2xpY2tzOiB0aGlzLm5vZGVDbGlja2VkLFxuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVQcm9wczoge1xuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktYmFja3VwLXJlc3RvcmVcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHRJZDogXCJtZXRhLnZlcnNpb25zLjE0XCIsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA0MFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlUZXh0SWQ6IFwibWV0YS52ZXJzaW9ucy4xNVwiXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuaWYgKHdpbmRvdy5SZWFjdERORCkge1xuICAgIHZhciBGYWtlRG5kQmFja2VuZCA9IGZ1bmN0aW9uIEZha2VEbmRCYWNrZW5kKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2V0dXA6IGZ1bmN0aW9uIHNldHVwKCkge30sXG4gICAgICAgICAgICB0ZWFyZG93bjogZnVuY3Rpb24gdGVhcmRvd24oKSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3REcmFnU291cmNlOiBmdW5jdGlvbiBjb25uZWN0RHJhZ1NvdXJjZSgpIHt9LFxuICAgICAgICAgICAgY29ubmVjdERyYWdQcmV2aWV3OiBmdW5jdGlvbiBjb25uZWN0RHJhZ1ByZXZpZXcoKSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3REcm9wVGFyZ2V0OiBmdW5jdGlvbiBjb25uZWN0RHJvcFRhcmdldCgpIHt9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBIaXN0b3J5QnJvd3NlciA9IHdpbmRvdy5SZWFjdERORC5EcmFnRHJvcENvbnRleHQoRmFrZURuZEJhY2tlbmQpKEhpc3RvcnlCcm93c2VyKTtcbn1cblxudmFyIEhpc3RvcnlEaWFsb2cgPSAoMCwgX2NyZWF0ZVJlYWN0Q2xhc3MyWydkZWZhdWx0J10pKHtcblxuICAgIG1peGluczogW1B5ZGlvUmVhY3RVaS5BY3Rpb25EaWFsb2dNaXhpbiwgUHlkaW9SZWFjdFVpLlN1Ym1pdEJ1dHRvblByb3ZpZGVyTWl4aW5dLFxuXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiBnZXREZWZhdWx0UHJvcHMoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWFsb2dUaXRsZTogJycsXG4gICAgICAgICAgICBkaWFsb2dJc01vZGFsOiBmYWxzZSxcbiAgICAgICAgICAgIGRpYWxvZ1NpemU6ICdsZycsXG4gICAgICAgICAgICBkaWFsb2dQYWRkaW5nOiBmYWxzZVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgc3VibWl0OiBmdW5jdGlvbiBzdWJtaXQoKSB7XG4gICAgICAgIHRoaXMuZGlzbWlzcygpO1xuICAgIH0sXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyB3aWR0aDogJzEwMCUnIH0sIGNsYXNzTmFtZTogJ2xheW91dC1maWxsIHZlcnRpY2FsLWxheW91dCcgfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KEhpc3RvcnlCcm93c2VyLCB7IG5vZGU6IHRoaXMucHJvcHMubm9kZSwgb25SZXF1ZXN0Q2xvc2U6IHRoaXMuZGlzbWlzcyB9KVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEhpc3RvcnlEaWFsb2c7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxudmFyIF9IaXN0b3J5RGlhbG9nID0gcmVxdWlyZSgnLi9IaXN0b3J5RGlhbG9nJyk7XG5cbnZhciBfSGlzdG9yeURpYWxvZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9IaXN0b3J5RGlhbG9nKTtcblxudmFyIF9DYWxsYmFja3MgPSByZXF1aXJlKCcuL0NhbGxiYWNrcycpO1xuXG52YXIgX0NhbGxiYWNrczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9DYWxsYmFja3MpO1xuXG5leHBvcnRzLkhpc3RvcnlEaWFsb2cgPSBfSGlzdG9yeURpYWxvZzJbJ2RlZmF1bHQnXTtcbmV4cG9ydHMuQ2FsbGJhY2tzID0gX0NhbGxiYWNrczJbJ2RlZmF1bHQnXTtcbiJdfQ==
