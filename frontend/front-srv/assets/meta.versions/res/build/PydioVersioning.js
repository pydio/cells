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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy8ucG5wbS9icm93c2VyLXBhY2tANS4wLjEvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvQ2FsbGJhY2tzLmpzIiwicmVzL2J1aWxkL1B5ZGlvVmVyc2lvbmluZy9IaXN0b3J5QXBpLmpzIiwicmVzL2J1aWxkL1B5ZGlvVmVyc2lvbmluZy9IaXN0b3J5RGlhbG9nLmpzIiwicmVzL2J1aWxkL1B5ZGlvVmVyc2lvbmluZy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnbG9hZEhpc3RvcnlCcm93c2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRIaXN0b3J5QnJvd3NlcigpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdQeWRpb1ZlcnNpb25pbmcnLCAnSGlzdG9yeURpYWxvZycsIHsgbm9kZTogcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFVuaXF1ZU5vZGUoKSB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDYWxsYmFja3M7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDYWxsYmFja3M7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG52YXIgTWV0YU5vZGVQcm92aWRlciA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL21ldGEtbm9kZS1wcm92aWRlcicpO1xudmFyIFB5ZGlvRGF0YU1vZGVsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvZGF0YS1tb2RlbCcpO1xudmFyIE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBIaXN0b3J5QXBpID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIaXN0b3J5QXBpKG5vZGUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEhpc3RvcnlBcGkpO1xuXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEhpc3RvcnlBcGksIFt7XG4gICAgICAgIGtleTogJ2dldERhdGFNb2RlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXREYXRhTW9kZWwoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmVyc2lvbnNEbSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IG5ldyBNZXRhTm9kZVByb3ZpZGVyKHsgdmVyc2lvbnM6ICd0cnVlJywgZmlsZTogdGhpcy5ub2RlLmdldFBhdGgoKSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25zRG0gPSBuZXcgUHlkaW9EYXRhTW9kZWwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtLnNldEFqeHBOb2RlUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNSb290ID0gbmV3IE5vZGUoXCIvXCIsIGZhbHNlLCBcIlZlcnNpb25zXCIsIFwiZm9sZGVyLnBuZ1wiLCBwcm92aWRlcik7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtLnNldFJvb3ROb2RlKHRoaXMudmVyc2lvbnNSb290KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZlcnNpb25zRG07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5WZXJzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5WZXJzaW9uKHZlcnNpb25Ob2RlKSB7XG5cbiAgICAgICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLm9wZW5WZXJzaW9uKHRoaXMubm9kZSwgdmVyc2lvbk5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25JZCcpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmV2ZXJ0VG9WZXJzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydFRvVmVyc2lvbih2ZXJzaW9uTm9kZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgaWYgKCFjb25maXJtKHB5ZGlvLk1lc3NhZ2VIYXNoW1wibWV0YS52ZXJzaW9ucy4xM1wiXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5yZXZlcnRUb1ZlcnNpb24odGhpcy5ub2RlLCB2ZXJzaW9uTm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndmVyc2lvbklkJyksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBIaXN0b3J5QXBpO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSGlzdG9yeUFwaTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcHlkaW8gPSByZXF1aXJlKCdweWRpbycpO1xuXG52YXIgX3B5ZGlvMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3B5ZGlvKTtcblxudmFyIF9yZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBfcmVhY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcmVhY3QpO1xuXG52YXIgX3Byb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcblxudmFyIF9wcm9wVHlwZXMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcHJvcFR5cGVzKTtcblxudmFyIF9jcmVhdGVSZWFjdENsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG5cbnZhciBfY3JlYXRlUmVhY3RDbGFzczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVSZWFjdENsYXNzKTtcblxudmFyIF9IaXN0b3J5QXBpID0gcmVxdWlyZSgnLi9IaXN0b3J5QXBpJyk7XG5cbnZhciBfSGlzdG9yeUFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9IaXN0b3J5QXBpKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9yZWFjdE1hcmtkb3duID0gcmVxdWlyZSgncmVhY3QtbWFya2Rvd24nKTtcblxudmFyIF9yZWFjdE1hcmtkb3duMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0TWFya2Rvd24pO1xuXG52YXIgX21hdGVyaWFsVWkgPSByZXF1aXJlKCdtYXRlcmlhbC11aScpO1xuXG52YXIgTm9kZSA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL25vZGUnKTtcbnZhciBQeWRpb1JlYWN0VWkgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignYm9vdCcpO1xuXG52YXIgX1B5ZGlvJHJlcXVpcmVMaWIgPSBfcHlkaW8yWydkZWZhdWx0J10ucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xuXG52YXIgVXNlckF2YXRhciA9IF9QeWRpbyRyZXF1aXJlTGliLlVzZXJBdmF0YXI7XG52YXIgTm9kZUxpc3RDdXN0b21Qcm92aWRlciA9IF9QeWRpbyRyZXF1aXJlTGliLk5vZGVMaXN0Q3VzdG9tUHJvdmlkZXI7XG52YXIgU2ltcGxlTGlzdCA9IF9QeWRpbyRyZXF1aXJlTGliLlNpbXBsZUxpc3Q7XG5cbnZhciBVc2VyTGlua1dyYXBwZXIgPSBmdW5jdGlvbiBVc2VyTGlua1dyYXBwZXIoX3JlZikge1xuICAgIHZhciBocmVmID0gX3JlZi5ocmVmO1xuICAgIHZhciBjaGlsZHJlbiA9IF9yZWYuY2hpbGRyZW47XG5cbiAgICBpZiAoaHJlZi5zdGFydHNXaXRoKCd1c2VyOi8vJykpIHtcbiAgICAgICAgdmFyIHVzZXJJZCA9IGhyZWYucmVwbGFjZSgndXNlcjovLycsICcnKTtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFVzZXJBdmF0YXIsIHtcbiAgICAgICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICAgICAgZGlzcGxheUF2YXRhcjogZmFsc2UsXG4gICAgICAgICAgICByaWNoT25DbGljazogZmFsc2UsXG4gICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGNvbG9yOiAncmdiKDY2LCAxNDAsIDE3OSknIH0sXG4gICAgICAgICAgICBweWRpbzogX3B5ZGlvMlsnZGVmYXVsdCddLmdldEluc3RhbmNlKClcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgJ3NwYW4nLFxuICAgICAgICBudWxsLFxuICAgICAgICBjaGlsZHJlblxuICAgICk7XG59O1xuXG52YXIgUGFyYWdyYXBoID0gZnVuY3Rpb24gUGFyYWdyYXBoKF9yZWYyKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gX3JlZjIuY2hpbGRyZW47XG4gICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAnc3BhbicsXG4gICAgICAgIG51bGwsXG4gICAgICAgIGNoaWxkcmVuXG4gICAgKTtcbn07XG5cbnZhciBIaXN0b3J5QnJvd3NlciA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgcHJvcFR5cGVzOiB7XG4gICAgICAgIG5vZGU6IF9wcm9wVHlwZXMyWydkZWZhdWx0J10uaW5zdGFuY2VPZihOb2RlKS5pc1JlcXVpcmVkLFxuICAgICAgICBvblJlcXVlc3RDbG9zZTogX3Byb3BUeXBlczJbJ2RlZmF1bHQnXS5mdW5jXG4gICAgfSxcblxuICAgIHByb3BzVG9TdGF0ZTogZnVuY3Rpb24gcHJvcHNUb1N0YXRlKG5vZGUpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5hcGkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuYXBpLnN0b3BPYnNlcnZpbmcoJ3NlbGVjdGlvbl9jaGFuZ2VkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFwaSA9IG5ldyBfSGlzdG9yeUFwaTJbJ2RlZmF1bHQnXShub2RlKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGFwaS5nZXREYXRhTW9kZWwoKS5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWROb2RlOiBudWxsIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWROb2RlOiBhcGkuZ2V0RGF0YU1vZGVsKCkuZ2V0VW5pcXVlTm9kZSgpIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICBhcGkuZ2V0RGF0YU1vZGVsKCkub2JzZXJ2ZSgnc2VsZWN0aW9uX2NoYW5nZWQnLCB0aGlzLl9zZWxlY3Rpb25PYnNlcnZlcik7XG4gICAgICAgIHJldHVybiB7IGFwaTogYXBpIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wc1RvU3RhdGUodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ub2RlICE9PSB0aGlzLnByb3BzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUodGhpcy5wcm9wc1RvU3RhdGUobmV4dFByb3BzLm5vZGUpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBub2RlQ2xpY2tlZDogZnVuY3Rpb24gbm9kZUNsaWNrZWQobm9kZSkge1xuICAgICAgICB0aGlzLnN0YXRlLmFwaS5nZXREYXRhTW9kZWwoKS5zZXRTZWxlY3RlZE5vZGVzKFtub2RlXSk7XG4gICAgfSxcblxuICAgIGFwcGx5QWN0aW9uOiBmdW5jdGlvbiBhcHBseUFjdGlvbihhY3Rpb24pIHtcbiAgICAgICAgdmFyIF9zdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBhcGkgPSBfc3RhdGUuYXBpO1xuICAgICAgICB2YXIgc2VsZWN0ZWROb2RlID0gX3N0YXRlLnNlbGVjdGVkTm9kZTtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnZGwnOlxuICAgICAgICAgICAgICAgIGFwaS5vcGVuVmVyc2lvbihzZWxlY3RlZE5vZGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAncmV2ZXJ0JzpcbiAgICAgICAgICAgICAgICBhcGkucmV2ZXJ0VG9WZXJzaW9uKHNlbGVjdGVkTm9kZSwgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucHJvcHMub25SZXF1ZXN0Q2xvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMub25SZXF1ZXN0Q2xvc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblxuICAgICAgICB2YXIgbWVzcyA9IHdpbmRvdy5weWRpby5NZXNzYWdlSGFzaDtcbiAgICAgICAgdmFyIHRhYmxlS2V5cyA9IHtcbiAgICAgICAgICAgIGluZGV4OiB7IGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjknXSwgc29ydFR5cGU6ICdzdHJpbmcnLCB3aWR0aDogJzEwJScsIHJlbmRlckNlbGw6IGZ1bmN0aW9uIHJlbmRlckNlbGwoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCIjXCIgKyBkYXRhLmdldE1ldGFkYXRhKCkuZ2V0KCd2ZXJzaW9uSWQnKS5zdWJzdHIoMCwgNik7XG4gICAgICAgICAgICAgICAgfSB9LFxuICAgICAgICAgICAgU2l6ZTogeyBsYWJlbDogbWVzc1snMiddLCBzb3J0VHlwZTogJ251bWJlcicsIHdpZHRoOiAnMTAlJywgcmVuZGVyQ2VsbDogZnVuY3Rpb24gcmVuZGVyQ2VsbChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzID0gcGFyc2VJbnQoZGF0YS5nZXRNZXRhZGF0YSgpLmdldCgnYnl0ZXNpemUnKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBfcHlkaW9VdGlsUGF0aDJbJ2RlZmF1bHQnXS5yb3VuZEZpbGVTaXplKHMpO1xuICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIGFqeHBfbW9kaWZ0aW1lOiB7IGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjEwJ10sIHNvcnRUeXBlOiAnc3RyaW5nJywgd2lkdGg6ICcyNSUnIH0sXG4gICAgICAgICAgICB2ZXJzaW9uRGVzY3JpcHRpb246IHsgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuMTEnXSwgc29ydFR5cGU6ICdzdHJpbmcnLCB3aWR0aDogJzU1JScsIHJlbmRlckNlbGw6IGZ1bmN0aW9uIHJlbmRlckNlbGwoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnc3BhbicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRpdGxlOiBtZXNzWydtZXRhLnZlcnNpb25zLjExJ10gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9yZWFjdE1hcmtkb3duMlsnZGVmYXVsdCddLCB7IHNvdXJjZTogZGF0YS5nZXRNZXRhZGF0YSgpLmdldCgndmVyc2lvbkRlc2NyaXB0aW9uJyksIHJlbmRlcmVyczogeyAnbGluayc6IFVzZXJMaW5rV3JhcHBlciwgJ3BhcmFncmFwaCc6IFBhcmFncmFwaCB9IH0pXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGRpc2FibGVkID0gIXRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlO1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyB9IH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICBfbWF0ZXJpYWxVaS5Ub29sYmFyLFxuICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRvb2xiYXJHcm91cCxcbiAgICAgICAgICAgICAgICAgICAgeyBmaXJzdENoaWxkOiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHN0eWxlOiB7IHBhZGRpbmdMZWZ0OiAyMCwgY29sb3I6ICd3aGl0ZScsIGZvbnRTaXplOiAxOCB9IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzWydtZXRhLnZlcnNpb25zLjE2J10ucmVwbGFjZSgnJXMnLCB0aGlzLnByb3BzLm5vZGUuZ2V0TGFiZWwoKSlcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRvb2xiYXJHcm91cCxcbiAgICAgICAgICAgICAgICAgICAgeyBsYXN0Q2hpbGQ6IHRydWUsIHN0eWxlOiB7IHBhZGRpbmdSaWdodDogNyB9IH0sXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWRvd25sb2FkXCIsIHRvb2x0aXBQb3NpdGlvbjogXCJib3R0b20tbGVmdFwiLCBpY29uU3R5bGU6IGRpc2FibGVkID8ge30gOiB7IGNvbG9yOiAnd2hpdGUnIH0sIGRpc2FibGVkOiBkaXNhYmxlZCwgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuMyddLCB0b29sdGlwOiBtZXNzWydtZXRhLnZlcnNpb25zLjQnXSwgb25DbGljazogdGhpcy5hcHBseUFjdGlvbi5iaW5kKHRoaXMsICdkbCcpIH0pLFxuICAgICAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChfbWF0ZXJpYWxVaS5JY29uQnV0dG9uLCB7IGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1iYWNrdXAtcmVzdG9yZVwiLCB0b29sdGlwUG9zaXRpb246IFwiYm90dG9tLWxlZnRcIiwgaWNvblN0eWxlOiBkaXNhYmxlZCA/IHt9IDogeyBjb2xvcjogJ3doaXRlJyB9LCBkaXNhYmxlZDogZGlzYWJsZWQsIGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjcnXSwgdG9vbHRpcDogbWVzc1snbWV0YS52ZXJzaW9ucy44J10sIG9uQ2xpY2s6IHRoaXMuYXBwbHlBY3Rpb24uYmluZCh0aGlzLCAncmV2ZXJ0JykgfSlcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoTm9kZUxpc3RDdXN0b21Qcm92aWRlciwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfSxcbiAgICAgICAgICAgICAgICBwcmVzZXREYXRhTW9kZWw6IHRoaXMuc3RhdGUuYXBpLmdldERhdGFNb2RlbCgpLFxuICAgICAgICAgICAgICAgIGFjdGlvbkJhckdyb3VwczogW10sXG4gICAgICAgICAgICAgICAgZWxlbWVudEhlaWdodDogU2ltcGxlTGlzdC5IRUlHSFRfT05FX0xJTkUsXG4gICAgICAgICAgICAgICAgdGFibGVLZXlzOiB0YWJsZUtleXMsXG4gICAgICAgICAgICAgICAgZW50cnlIYW5kbGVDbGlja3M6IHRoaXMubm9kZUNsaWNrZWQsXG4gICAgICAgICAgICAgICAgZW1wdHlTdGF0ZVByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgIGljb25DbGFzc05hbWU6IFwibWRpIG1kaS1iYWNrdXAtcmVzdG9yZVwiLFxuICAgICAgICAgICAgICAgICAgICBwcmltYXJ5VGV4dElkOiBcIm1ldGEudmVyc2lvbnMuMTRcIixcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IDQwXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZGFyeVRleHRJZDogXCJtZXRhLnZlcnNpb25zLjE1XCJcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuRGl2aWRlciwgbnVsbClcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5pZiAod2luZG93LlJlYWN0RE5EKSB7XG4gICAgdmFyIEZha2VEbmRCYWNrZW5kID0gZnVuY3Rpb24gRmFrZURuZEJhY2tlbmQoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzZXR1cDogZnVuY3Rpb24gc2V0dXAoKSB7fSxcbiAgICAgICAgICAgIHRlYXJkb3duOiBmdW5jdGlvbiB0ZWFyZG93bigpIHt9LFxuICAgICAgICAgICAgY29ubmVjdERyYWdTb3VyY2U6IGZ1bmN0aW9uIGNvbm5lY3REcmFnU291cmNlKCkge30sXG4gICAgICAgICAgICBjb25uZWN0RHJhZ1ByZXZpZXc6IGZ1bmN0aW9uIGNvbm5lY3REcmFnUHJldmlldygpIHt9LFxuICAgICAgICAgICAgY29ubmVjdERyb3BUYXJnZXQ6IGZ1bmN0aW9uIGNvbm5lY3REcm9wVGFyZ2V0KCkge31cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIEhpc3RvcnlCcm93c2VyID0gd2luZG93LlJlYWN0RE5ELkRyYWdEcm9wQ29udGV4dChGYWtlRG5kQmFja2VuZCkoSGlzdG9yeUJyb3dzZXIpO1xufVxuXG52YXIgSGlzdG9yeURpYWxvZyA9ICgwLCBfY3JlYXRlUmVhY3RDbGFzczJbJ2RlZmF1bHQnXSkoe1xuXG4gICAgbWl4aW5zOiBbUHlkaW9SZWFjdFVpLkFjdGlvbkRpYWxvZ01peGluLCBQeWRpb1JlYWN0VWkuU3VibWl0QnV0dG9uUHJvdmlkZXJNaXhpbl0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uIGdldERlZmF1bHRQcm9wcygpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpYWxvZ1RpdGxlOiAnJyxcbiAgICAgICAgICAgIGRpYWxvZ0lzTW9kYWw6IGZhbHNlLFxuICAgICAgICAgICAgZGlhbG9nU2l6ZTogJ2xnJyxcbiAgICAgICAgICAgIGRpYWxvZ1BhZGRpbmc6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcbiAgICBzdWJtaXQ6IGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgdGhpcy5kaXNtaXNzKCk7XG4gICAgfSxcbiAgICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgJ2RpdicsXG4gICAgICAgICAgICB7IHN0eWxlOiB7IHdpZHRoOiAnMTAwJScgfSwgY2xhc3NOYW1lOiAnbGF5b3V0LWZpbGwgdmVydGljYWwtbGF5b3V0JyB9LFxuICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoSGlzdG9yeUJyb3dzZXIsIHsgbm9kZTogdGhpcy5wcm9wcy5ub2RlLCBvblJlcXVlc3RDbG9zZTogdGhpcy5kaXNtaXNzIH0pXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSGlzdG9yeURpYWxvZztcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX0hpc3RvcnlEaWFsb2cgPSByZXF1aXJlKCcuL0hpc3RvcnlEaWFsb2cnKTtcblxudmFyIF9IaXN0b3J5RGlhbG9nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0hpc3RvcnlEaWFsb2cpO1xuXG52YXIgX0NhbGxiYWNrcyA9IHJlcXVpcmUoJy4vQ2FsbGJhY2tzJyk7XG5cbnZhciBfQ2FsbGJhY2tzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0NhbGxiYWNrcyk7XG5cbmV4cG9ydHMuSGlzdG9yeURpYWxvZyA9IF9IaXN0b3J5RGlhbG9nMlsnZGVmYXVsdCddO1xuZXhwb3J0cy5DYWxsYmFja3MgPSBfQ2FsbGJhY2tzMlsnZGVmYXVsdCddO1xuIl19
