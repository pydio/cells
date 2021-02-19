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

var HistoryBrowser = _react2['default'].createClass({
    displayName: 'HistoryBrowser',

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(Node).isRequired,
        onRequestClose: _react2['default'].PropTypes.func
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

var HistoryDialog = _react2['default'].createClass({
    displayName: 'HistoryDialog',

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

},{"./HistoryApi":2,"material-ui":"material-ui","pydio":"pydio","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react","react-markdown":"react-markdown"}],4:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9WZXJzaW9uaW5nL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeUFwaS5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeURpYWxvZy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgQ2FsbGJhY2tzID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBDYWxsYmFja3MoKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDYWxsYmFja3MpO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhDYWxsYmFja3MsIG51bGwsIFt7XG4gICAgICAgIGtleTogJ2xvYWRIaXN0b3J5QnJvd3NlcicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBsb2FkSGlzdG9yeUJyb3dzZXIoKSB7XG4gICAgICAgICAgICBweWRpby5VSS5vcGVuQ29tcG9uZW50SW5Nb2RhbCgnUHlkaW9WZXJzaW9uaW5nJywgJ0hpc3RvcnlEaWFsb2cnLCB7IG5vZGU6IHB5ZGlvLmdldENvbnRleHRIb2xkZXIoKS5nZXRVbmlxdWVOb2RlKCkgfSk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gQ2FsbGJhY2tzO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2FsbGJhY2tzO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG52YXIgUHlkaW9BcGkgPSByZXF1aXJlKCdweWRpby9odHRwL2FwaScpO1xudmFyIE1ldGFOb2RlUHJvdmlkZXIgPSByZXF1aXJlKCdweWRpby9tb2RlbC9tZXRhLW5vZGUtcHJvdmlkZXInKTtcbnZhciBQeWRpb0RhdGFNb2RlbCA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL2RhdGEtbW9kZWwnKTtcbnZhciBOb2RlID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvbm9kZScpO1xuXG52YXIgSGlzdG9yeUFwaSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSGlzdG9yeUFwaShub2RlKSB7XG4gICAgICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBIaXN0b3J5QXBpKTtcblxuICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgIH1cblxuICAgIF9jcmVhdGVDbGFzcyhIaXN0b3J5QXBpLCBbe1xuICAgICAgICBrZXk6ICdnZXREYXRhTW9kZWwnLFxuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RGF0YU1vZGVsKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZlcnNpb25zRG0pIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvdmlkZXIgPSBuZXcgTWV0YU5vZGVQcm92aWRlcih7IHZlcnNpb25zOiAndHJ1ZScsIGZpbGU6IHRoaXMubm9kZS5nZXRQYXRoKCkgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtID0gbmV3IFB5ZGlvRGF0YU1vZGVsKHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNEbS5zZXRBanhwTm9kZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25zUm9vdCA9IG5ldyBOb2RlKFwiL1wiLCBmYWxzZSwgXCJWZXJzaW9uc1wiLCBcImZvbGRlci5wbmdcIiwgcHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNEbS5zZXRSb290Tm9kZSh0aGlzLnZlcnNpb25zUm9vdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52ZXJzaW9uc0RtO1xuICAgICAgICB9XG4gICAgfSwge1xuICAgICAgICBrZXk6ICdvcGVuVmVyc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuVmVyc2lvbih2ZXJzaW9uTm9kZSkge1xuXG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5vcGVuVmVyc2lvbih0aGlzLm5vZGUsIHZlcnNpb25Ob2RlLmdldE1ldGFkYXRhKCkuZ2V0KCd2ZXJzaW9uSWQnKSk7XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ3JldmVydFRvVmVyc2lvbicsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiByZXZlcnRUb1ZlcnNpb24odmVyc2lvbk5vZGUpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IG51bGwgOiBhcmd1bWVudHNbMV07XG5cbiAgICAgICAgICAgIGlmICghY29uZmlybShweWRpby5NZXNzYWdlSGFzaFtcIm1ldGEudmVyc2lvbnMuMTNcIl0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgUHlkaW9BcGkuZ2V0Q2xpZW50KCkucmV2ZXJ0VG9WZXJzaW9uKHRoaXMubm9kZSwgdmVyc2lvbk5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25JZCcpLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9XSk7XG5cbiAgICByZXR1cm4gSGlzdG9yeUFwaTtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEhpc3RvcnlBcGk7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX3B5ZGlvID0gcmVxdWlyZSgncHlkaW8nKTtcblxudmFyIF9weWRpbzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpbyk7XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9IaXN0b3J5QXBpID0gcmVxdWlyZSgnLi9IaXN0b3J5QXBpJyk7XG5cbnZhciBfSGlzdG9yeUFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9IaXN0b3J5QXBpKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9yZWFjdE1hcmtkb3duID0gcmVxdWlyZSgncmVhY3QtbWFya2Rvd24nKTtcblxudmFyIF9yZWFjdE1hcmtkb3duMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0TWFya2Rvd24pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTm9kZSA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL25vZGUnKTtcbnZhciBQeWRpb1JlYWN0VWkgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgVXNlckF2YXRhciA9IF9QeWRpbyRyZXF1aXJlTGliLlVzZXJBdmF0YXI7XG52YXIgTm9kZUxpc3RDdXN0b21Qcm92aWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLk5vZGVMaXN0Q3VzdG9tUHJvdmlkZXI7XG52YXIgU2ltcGxlTGlzdCA9IF9QeWRpbyRyZXF1aXJlTGliLlNpbXBsZUxpc3Q7XG5cbnZhciBVc2VyTGlua1dyYXBwZXIgPSBmdW5jdGlvbiBVc2VyTGlua1dyYXBwZXIoX3JlZikge1xuICAgIHZhciBocmVmID0gX3JlZi5ocmVmO1xuICAgIHZhciBjaGlsZHJlbiA9IF9yZWYuY2hpbGRyZW47XG5cbiAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCd1c2VyOi8vJykpIHtcbiAgICAgICAgdmFyIHVzZXJJZCA9IGhyZWYucmVwbGFjZSgndXNlcjovLycsICcnKTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJBdmF0YXIsIHtcbiAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgZGlzcGxheUF2YXRhcjogZmFsc2UsXG4gICAgICAgICAgICByaWNoT25DbGljazogZmFsc2UsXG4gICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGNvbG9yOiAncmdiKDY2LCAxNDAsIDE3OSknIH0sXG4gICAgICAgICAgICBweWRpbzogX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKClcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3NwYW4nLFxuICAgICAgICBudWxsLFxuICAgICAgICBjaGlsZHJlblxuICAgICk7XG59O1xuXG52YXIgUGFyYWdyYXBoID0gZnVuY3Rpb24gUGFyYWdyYXBoKF9yZWYyKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gX3JlZjIuY2hpbGRyZW47XG4gICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3BhbicsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGNoaWxkcmVuXG4gICAgKTtcbn07XG5cbnZhciBIaXN0b3J5QnJvd3NlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdIaXN0b3J5QnJvd3NlcicsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKE5vZGUpLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uUmVxdWVzdENsb3NlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgcHJvcHNUb1N0YXRlOiBmdW5jdGlvbiBwcm9wc1RvU3RhdGUobm9kZSkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSAmJiB0aGlzLnN0YXRlLmFwaSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5hcGkuc3RvcE9ic2VydmluZygnc2VsZWN0aW9uX2NoYW5nZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXBpID0gbmV3IF9IaXN0b3J5QXBpMlsnZGVmYXVsdCddKG5vZGUpO1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoYXBpLmdldERhdGFNb2RlbCgpLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IG51bGwgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IGFwaS5nZXREYXRhTW9kZWwoKS5nZXRVbmlxdWVOb2RlKCkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIGFwaS5nZXREYXRhTW9kZWwoKS5vYnNlcnZlKCdzZWxlY3Rpb25fY2hhbmdlZCcsIHRoaXMuX3NlbGVjdGlvbk9ic2VydmVyKTtcbiAgICAgICAgcmV0dXJuIHsgYXBpOiBhcGkgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzVG9TdGF0ZSh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh0aGlzLnByb3BzVG9TdGF0ZShuZXh0UHJvcHMubm9kZSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG5vZGVDbGlja2VkOiBmdW5jdGlvbiBub2RlQ2xpY2tlZChub2RlKSB7XG4gICAgICAgIHRoaXMuc3RhdGUuYXBpLmdldERhdGFNb2RlbCgpLnNldFNlbGVjdGVkTm9kZXMoW25vZGVdKTtcbiAgICB9LFxuXG4gICAgYXBwbHlBY3Rpb246IGZ1bmN0aW9uIGFwcGx5QWN0aW9uKGFjdGlvbikge1xuICAgICAgICB2YXIgX3N0YXRlID0gdGhpcy5zdGF0ZTtcbiAgICAgICAgdmFyIGFwaSA9IF9zdGF0ZS5hcGk7XG4gICAgICAgIHZhciBzZWxlY3RlZE5vZGUgPSBfc3RhdGUuc2VsZWN0ZWROb2RlO1xuXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICAgICAgICBjYXNlICdkbCc6XG4gICAgICAgICAgICAgICAgYXBpLm9wZW5WZXJzaW9uKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdyZXZlcnQnOlxuICAgICAgICAgICAgICAgIGFwaS5yZXZlcnRUb1ZlcnNpb24oc2VsZWN0ZWROb2RlLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5wcm9wcy5vblJlcXVlc3RDbG9zZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wcm9wcy5vblJlcXVlc3RDbG9zZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXG4gICAgICAgIHZhciBtZXNzID0gd2luZG93LnB5ZGlvLk1lc3NhZ2VIYXNoO1xuICAgICAgICB2YXIgdGFibGVLZXlzID0ge1xuICAgICAgICAgICAgaW5kZXg6IHsgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuOSddLCBzb3J0VHlwZTogJ3N0cmluZycsIHdpZHRoOiAnMTAlJywgcmVuZGVyQ2VsbDogZnVuY3Rpb24gcmVuZGVyQ2VsbChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiNcIiArIGRhdGEuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25JZCcpLnN1YnN0cigwLCA2KTtcbiAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICBTaXplOiB7IGxhYmVsOiBtZXNzWycyJ10sIHNvcnRUeXBlOiAnbnVtYmVyJywgd2lkdGg6ICcxMCUnLCByZW5kZXJDZWxsOiBmdW5jdGlvbiByZW5kZXJDZWxsKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHMgPSBwYXJzZUludChkYXRhLmdldE1ldGFkYXRhKCkuZ2V0KCdieXRlc2l6ZScpKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9weWRpb1V0aWxQYXRoMlsnZGVmYXVsdCddLnJvdW5kRmlsZVNpemUocyk7XG4gICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgYWp4cF9tb2RpZnRpbWU6IHsgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuMTAnXSwgc29ydFR5cGU6ICdzdHJpbmcnLCB3aWR0aDogJzI1JScgfSxcbiAgICAgICAgICAgIHZlcnNpb25EZXNjcmlwdGlvbjogeyBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy4xMSddLCBzb3J0VHlwZTogJ3N0cmluZycsIHdpZHRoOiAnNTUlJywgcmVuZGVyQ2VsbDogZnVuY3Rpb24gcmVuZGVyQ2VsbChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgICdzcGFuJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgdGl0bGU6IG1lc3NbJ21ldGEudmVyc2lvbnMuMTEnXSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX3JlYWN0TWFya2Rvd24yWydkZWZhdWx0J10sIHsgc291cmNlOiBkYXRhLmdldE1ldGFkYXRhKCkuZ2V0KCd2ZXJzaW9uRGVzY3JpcHRpb24nKSwgcmVuZGVyZXJzOiB7ICdsaW5rJzogVXNlckxpbmtXcmFwcGVyLCAncGFyYWdyYXBoJzogUGFyYWdyYXBoIH0gfSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZGlzYWJsZWQgPSAhdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRvb2xiYXIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVG9vbGJhckdyb3VwLFxuICAgICAgICAgICAgICAgICAgICB7IGZpcnN0Q2hpbGQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDIwLCBjb2xvcjogJ3doaXRlJywgZm9udFNpemU6IDE4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudmVyc2lvbnMuMTYnXS5yZXBsYWNlKCclcycsIHRoaXMucHJvcHMubm9kZS5nZXRMYWJlbCgpKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVG9vbGJhckdyb3VwLFxuICAgICAgICAgICAgICAgICAgICB7IGxhc3RDaGlsZDogdHJ1ZSwgc3R5bGU6IHsgcGFkZGluZ1JpZ2h0OiA3IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktZG93bmxvYWRcIiwgdG9vbHRpcFBvc2l0aW9uOiBcImJvdHRvbS1sZWZ0XCIsIGljb25TdHlsZTogZGlzYWJsZWQgPyB7fSA6IHsgY29sb3I6ICd3aGl0ZScgfSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy4zJ10sIHRvb2x0aXA6IG1lc3NbJ21ldGEudmVyc2lvbnMuNCddLCBvbkNsaWNrOiB0aGlzLmFwcGx5QWN0aW9uLmJpbmQodGhpcywgJ2RsJykgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWJhY2t1cC1yZXN0b3JlXCIsIHRvb2x0aXBQb3NpdGlvbjogXCJib3R0b20tbGVmdFwiLCBpY29uU3R5bGU6IGRpc2FibGVkID8ge30gOiB7IGNvbG9yOiAnd2hpdGUnIH0sIGRpc2FibGVkOiBkaXNhYmxlZCwgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuNyddLCB0b29sdGlwOiBtZXNzWydtZXRhLnZlcnNpb25zLjgnXSwgb25DbGljazogdGhpcy5hcHBseUFjdGlvbi5iaW5kKHRoaXMsICdyZXZlcnQnKSB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChOb2RlTGlzdEN1c3RvbVByb3ZpZGVyLCB7XG4gICAgICAgICAgICAgICAgc3R5bGU6IHsgZmxleDogMSB9LFxuICAgICAgICAgICAgICAgIHByZXNldERhdGFNb2RlbDogdGhpcy5zdGF0ZS5hcGkuZ2V0RGF0YU1vZGVsKCksXG4gICAgICAgICAgICAgICAgYWN0aW9uQmFyR3JvdXBzOiBbXSxcbiAgICAgICAgICAgICAgICBlbGVtZW50SGVpZ2h0OiBTaW1wbGVMaXN0LkhFSUdIVF9PTkVfTElORSxcbiAgICAgICAgICAgICAgICB0YWJsZUtleXM6IHRhYmxlS2V5cyxcbiAgICAgICAgICAgICAgICBlbnRyeUhhbmRsZUNsaWNrczogdGhpcy5ub2RlQ2xpY2tlZCxcbiAgICAgICAgICAgICAgICBlbXB0eVN0YXRlUHJvcHM6IHtcbiAgICAgICAgICAgICAgICAgICAgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWJhY2t1cC1yZXN0b3JlXCIsXG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlUZXh0SWQ6IFwibWV0YS52ZXJzaW9ucy4xNFwiLFxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogNDBcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGV4dElkOiBcIm1ldGEudmVyc2lvbnMuMTVcIlxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5EaXZpZGVyLCBudWxsKVxuICAgICAgICApO1xuICAgIH1cblxufSk7XG5cbmlmICh3aW5kb3cuUmVhY3RETkQpIHtcbiAgICB2YXIgRmFrZURuZEJhY2tlbmQgPSBmdW5jdGlvbiBGYWtlRG5kQmFja2VuZCgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHNldHVwOiBmdW5jdGlvbiBzZXR1cCgpIHt9LFxuICAgICAgICAgICAgdGVhcmRvd246IGZ1bmN0aW9uIHRlYXJkb3duKCkge30sXG4gICAgICAgICAgICBjb25uZWN0RHJhZ1NvdXJjZTogZnVuY3Rpb24gY29ubmVjdERyYWdTb3VyY2UoKSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3REcmFnUHJldmlldzogZnVuY3Rpb24gY29ubmVjdERyYWdQcmV2aWV3KCkge30sXG4gICAgICAgICAgICBjb25uZWN0RHJvcFRhcmdldDogZnVuY3Rpb24gY29ubmVjdERyb3BUYXJnZXQoKSB7fVxuICAgICAgICB9O1xuICAgIH07XG4gICAgSGlzdG9yeUJyb3dzZXIgPSB3aW5kb3cuUmVhY3RETkQuRHJhZ0Ryb3BDb250ZXh0KEZha2VEbmRCYWNrZW5kKShIaXN0b3J5QnJvd3Nlcik7XG59XG5cbnZhciBIaXN0b3J5RGlhbG9nID0gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUNsYXNzKHtcbiAgICBkaXNwbGF5TmFtZTogJ0hpc3RvcnlEaWFsb2cnLFxuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVpLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VWkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScgfSwgY2xhc3NOYW1lOiAnbGF5b3V0LWZpbGwgdmVydGljYWwtbGF5b3V0JyB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoSGlzdG9yeUJyb3dzZXIsIHsgbm9kZTogdGhpcy5wcm9wcy5ub2RlLCBvblJlcXVlc3RDbG9zZTogdGhpcy5kaXNtaXNzIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSGlzdG9yeURpYWxvZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0hpc3RvcnlEaWFsb2cgPSByZXF1aXJlKCcuL0hpc3RvcnlEaWFsb2cnKTtcblxudmFyIF9IaXN0b3J5RGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0hpc3RvcnlEaWFsb2cpO1xuXG52YXIgX0NhbGxiYWNrcyA9IHJlcXVpcmUoJy4vQ2FsbGJhY2tzJyk7XG5cbnZhciBfQ2FsbGJhY2tzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NhbGxiYWNrcyk7XG5cbmV4cG9ydHMuSGlzdG9yeURpYWxvZyA9IF9IaXN0b3J5RGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBfQ2FsbGJhY2tzMlsnZGVmYXVsdCddO1xuIl19
