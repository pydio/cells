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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _HistoryApi = require('./HistoryApi');

var _HistoryApi2 = _interopRequireDefault(_HistoryApi);

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _materialUi = require('material-ui');

var PydioComponents = require('pydio').requireLib('components');
var Node = require('pydio/model/node');
var PydioReactUi = require('pydio').requireLib('boot');

var HistoryBrowser = _react2['default'].createClass({
    displayName: 'HistoryBrowser',

    propTypes: {
        node: _react2['default'].PropTypes.instanceOf(Node).isRequired,
        onRequestClose: _react2['default'].PropTypes.func
    },

    propsToState: function propsToState(node) {
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
            if (this._selectionObserver) {
                this.state.api.getDataModel().stopObserving('selection_changed', this._selectionObserver);
            }
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
        var index = 0;
        var tableKeys = {
            index: { label: mess['meta.versions.9'], sortType: 'string', width: '5%', renderCell: function renderCell(data) {
                    index++;
                    return index + "";
                } },
            Size: { label: mess['2'], sortType: 'number', width: '20%', renderCell: function renderCell(data) {
                    var s = parseInt(data.getMetadata().get('bytesize'));
                    return _pydioUtilPath2['default'].roundFileSize(s);
                } },
            ajxp_modiftime: { label: mess['meta.versions.10'], sortType: 'string', width: '25%' },
            versionDescription: { label: mess['meta.versions.11'], sortType: 'string', width: '50%' }
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
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-download", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.3'], tooltip: mess['meta.versions.4'], onTouchTap: this.applyAction.bind(this, 'dl') }),
                    _react2['default'].createElement(_materialUi.IconButton, { iconClassName: "mdi mdi-backup-restore", tooltipPosition: "bottom-left", iconStyle: disabled ? {} : { color: 'white' }, disabled: disabled, label: mess['meta.versions.7'], tooltip: mess['meta.versions.8'], onTouchTap: this.applyAction.bind(this, 'revert') })
                )
            ),
            _react2['default'].createElement(PydioComponents.NodeListCustomProvider, {
                style: { flex: 1 },
                presetDataModel: this.state.api.getDataModel(),
                actionBarGroups: [],
                elementHeight: PydioComponents.SimpleList.HEIGHT_ONE_LINE,
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

},{"./HistoryApi":2,"material-ui":"material-ui","pydio":"pydio","pydio/model/node":"pydio/model/node","pydio/util/path":"pydio/util/path","react":"react"}],4:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZXMvYnVpbGQvUHlkaW9WZXJzaW9uaW5nL0NhbGxiYWNrcy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeUFwaS5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvSGlzdG9yeURpYWxvZy5qcyIsInJlcy9idWlsZC9QeWRpb1ZlcnNpb25pbmcvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBDYWxsYmFja3MgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIENhbGxiYWNrcygpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIENhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKENhbGxiYWNrcywgbnVsbCwgW3tcbiAgICAgICAga2V5OiAnbG9hZEhpc3RvcnlCcm93c2VyJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIGxvYWRIaXN0b3J5QnJvd3NlcigpIHtcbiAgICAgICAgICAgIHB5ZGlvLlVJLm9wZW5Db21wb25lbnRJbk1vZGFsKCdQeWRpb1ZlcnNpb25pbmcnLCAnSGlzdG9yeURpYWxvZycsIHsgbm9kZTogcHlkaW8uZ2V0Q29udGV4dEhvbGRlcigpLmdldFVuaXF1ZU5vZGUoKSB9KTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBDYWxsYmFja3M7XG59KSgpO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBDYWxsYmFja3M7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTtcbiIsIi8qXG4gKiBDb3B5cmlnaHQgMjAwNy0yMDE3IENoYXJsZXMgZHUgSmV1IC0gQWJzdHJpdW0gU0FTIDx0ZWFtIChhdCkgcHlkLmlvPlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgUHlkaW8uXG4gKlxuICogUHlkaW8gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBQeWRpbyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBQeWRpby4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqXG4gKiBUaGUgbGF0ZXN0IGNvZGUgY2FuIGJlIGZvdW5kIGF0IDxodHRwczovL3B5ZGlvLmNvbT4uXG4gKi9cbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICAgIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBQeWRpb0FwaSA9IHJlcXVpcmUoJ3B5ZGlvL2h0dHAvYXBpJyk7XG52YXIgTWV0YU5vZGVQcm92aWRlciA9IHJlcXVpcmUoJ3B5ZGlvL21vZGVsL21ldGEtbm9kZS1wcm92aWRlcicpO1xudmFyIFB5ZGlvRGF0YU1vZGVsID0gcmVxdWlyZSgncHlkaW8vbW9kZWwvZGF0YS1tb2RlbCcpO1xudmFyIE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG5cbnZhciBIaXN0b3J5QXBpID0gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIaXN0b3J5QXBpKG5vZGUpIHtcbiAgICAgICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEhpc3RvcnlBcGkpO1xuXG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgfVxuXG4gICAgX2NyZWF0ZUNsYXNzKEhpc3RvcnlBcGksIFt7XG4gICAgICAgIGtleTogJ2dldERhdGFNb2RlbCcsXG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiBnZXREYXRhTW9kZWwoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMudmVyc2lvbnNEbSkge1xuICAgICAgICAgICAgICAgIHZhciBwcm92aWRlciA9IG5ldyBNZXRhTm9kZVByb3ZpZGVyKHsgdmVyc2lvbnM6ICd0cnVlJywgZmlsZTogdGhpcy5ub2RlLmdldFBhdGgoKSB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb25zRG0gPSBuZXcgUHlkaW9EYXRhTW9kZWwodHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtLnNldEFqeHBOb2RlUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMudmVyc2lvbnNSb290ID0gbmV3IE5vZGUoXCIvXCIsIGZhbHNlLCBcIlZlcnNpb25zXCIsIFwiZm9sZGVyLnBuZ1wiLCBwcm92aWRlcik7XG4gICAgICAgICAgICAgICAgdGhpcy52ZXJzaW9uc0RtLnNldFJvb3ROb2RlKHRoaXMudmVyc2lvbnNSb290KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZlcnNpb25zRG07XG4gICAgICAgIH1cbiAgICB9LCB7XG4gICAgICAgIGtleTogJ29wZW5WZXJzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIG9wZW5WZXJzaW9uKHZlcnNpb25Ob2RlKSB7XG5cbiAgICAgICAgICAgIFB5ZGlvQXBpLmdldENsaWVudCgpLm9wZW5WZXJzaW9uKHRoaXMubm9kZSwgdmVyc2lvbk5vZGUuZ2V0TWV0YWRhdGEoKS5nZXQoJ3ZlcnNpb25JZCcpKTtcbiAgICAgICAgfVxuICAgIH0sIHtcbiAgICAgICAga2V5OiAncmV2ZXJ0VG9WZXJzaW9uJyxcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJldmVydFRvVmVyc2lvbih2ZXJzaW9uTm9kZSkge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgICAgICAgaWYgKCFjb25maXJtKHB5ZGlvLk1lc3NhZ2VIYXNoW1wibWV0YS52ZXJzaW9ucy4xM1wiXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBQeWRpb0FwaS5nZXRDbGllbnQoKS5yZXZlcnRUb1ZlcnNpb24odGhpcy5ub2RlLCB2ZXJzaW9uTm9kZS5nZXRNZXRhZGF0YSgpLmdldCgndmVyc2lvbklkJyksIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuICAgIH1dKTtcblxuICAgIHJldHVybiBIaXN0b3J5QXBpO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSGlzdG9yeUFwaTtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddO1xuIiwiLypcbiAqIENvcHlyaWdodCAyMDA3LTIwMTcgQ2hhcmxlcyBkdSBKZXUgLSBBYnN0cml1bSBTQVMgPHRlYW0gKGF0KSBweWQuaW8+XG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBQeWRpby5cbiAqXG4gKiBQeWRpbyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBBZmZlcm8gR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFB5ZGlvIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIFB5ZGlvLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICpcbiAqIFRoZSBsYXRlc3QgY29kZSBjYW4gYmUgZm91bmQgYXQgPGh0dHBzOi8vcHlkaW8uY29tPi5cbiAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gICAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfcmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgX3JlYWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3JlYWN0KTtcblxudmFyIF9IaXN0b3J5QXBpID0gcmVxdWlyZSgnLi9IaXN0b3J5QXBpJyk7XG5cbnZhciBfSGlzdG9yeUFwaTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9IaXN0b3J5QXBpKTtcblxudmFyIF9weWRpb1V0aWxQYXRoID0gcmVxdWlyZSgncHlkaW8vdXRpbC9wYXRoJyk7XG5cbnZhciBfcHlkaW9VdGlsUGF0aDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9weWRpb1V0aWxQYXRoKTtcblxudmFyIF9tYXRlcmlhbFVpID0gcmVxdWlyZSgnbWF0ZXJpYWwtdWknKTtcblxudmFyIFB5ZGlvQ29tcG9uZW50cyA9IHJlcXVpcmUoJ3B5ZGlvJykucmVxdWlyZUxpYignY29tcG9uZW50cycpO1xudmFyIE5vZGUgPSByZXF1aXJlKCdweWRpby9tb2RlbC9ub2RlJyk7XG52YXIgUHlkaW9SZWFjdFVpID0gcmVxdWlyZSgncHlkaW8nKS5yZXF1aXJlTGliKCdib290Jyk7XG5cbnZhciBIaXN0b3J5QnJvd3NlciA9IF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVDbGFzcyh7XG4gICAgZGlzcGxheU5hbWU6ICdIaXN0b3J5QnJvd3NlcicsXG5cbiAgICBwcm9wVHlwZXM6IHtcbiAgICAgICAgbm9kZTogX3JlYWN0MlsnZGVmYXVsdCddLlByb3BUeXBlcy5pbnN0YW5jZU9mKE5vZGUpLmlzUmVxdWlyZWQsXG4gICAgICAgIG9uUmVxdWVzdENsb3NlOiBfcmVhY3QyWydkZWZhdWx0J10uUHJvcFR5cGVzLmZ1bmNcbiAgICB9LFxuXG4gICAgcHJvcHNUb1N0YXRlOiBmdW5jdGlvbiBwcm9wc1RvU3RhdGUobm9kZSkge1xuICAgICAgICB2YXIgYXBpID0gbmV3IF9IaXN0b3J5QXBpMlsnZGVmYXVsdCddKG5vZGUpO1xuICAgICAgICB0aGlzLl9zZWxlY3Rpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoYXBpLmdldERhdGFNb2RlbCgpLmlzRW1wdHkoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IG51bGwgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGU6IGFwaS5nZXREYXRhTW9kZWwoKS5nZXRVbmlxdWVOb2RlKCkgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgIGFwaS5nZXREYXRhTW9kZWwoKS5vYnNlcnZlKCdzZWxlY3Rpb25fY2hhbmdlZCcsIHRoaXMuX3NlbGVjdGlvbk9ic2VydmVyKTtcbiAgICAgICAgcmV0dXJuIHsgYXBpOiBhcGkgfTtcbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzVG9TdGF0ZSh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLm5vZGUgIT09IHRoaXMucHJvcHMubm9kZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3NlbGVjdGlvbk9ic2VydmVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5hcGkuZ2V0RGF0YU1vZGVsKCkuc3RvcE9ic2VydmluZygnc2VsZWN0aW9uX2NoYW5nZWQnLCB0aGlzLl9zZWxlY3Rpb25PYnNlcnZlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHRoaXMucHJvcHNUb1N0YXRlKG5leHRQcm9wcy5ub2RlKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgbm9kZUNsaWNrZWQ6IGZ1bmN0aW9uIG5vZGVDbGlja2VkKG5vZGUpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5hcGkuZ2V0RGF0YU1vZGVsKCkuc2V0U2VsZWN0ZWROb2Rlcyhbbm9kZV0pO1xuICAgIH0sXG5cbiAgICBhcHBseUFjdGlvbjogZnVuY3Rpb24gYXBwbHlBY3Rpb24oYWN0aW9uKSB7XG4gICAgICAgIHZhciBfc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgYXBpID0gX3N0YXRlLmFwaTtcbiAgICAgICAgdmFyIHNlbGVjdGVkTm9kZSA9IF9zdGF0ZS5zZWxlY3RlZE5vZGU7XG5cbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgICAgICAgIGNhc2UgJ2RsJzpcbiAgICAgICAgICAgICAgICBhcGkub3BlblZlcnNpb24oc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3JldmVydCc6XG4gICAgICAgICAgICAgICAgYXBpLnJldmVydFRvVmVyc2lvbihzZWxlY3RlZE5vZGUsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLm9uUmVxdWVzdENsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cbiAgICAgICAgdmFyIG1lc3MgPSB3aW5kb3cucHlkaW8uTWVzc2FnZUhhc2g7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciB0YWJsZUtleXMgPSB7XG4gICAgICAgICAgICBpbmRleDogeyBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy45J10sIHNvcnRUeXBlOiAnc3RyaW5nJywgd2lkdGg6ICc1JScsIHJlbmRlckNlbGw6IGZ1bmN0aW9uIHJlbmRlckNlbGwoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggKyBcIlwiO1xuICAgICAgICAgICAgICAgIH0gfSxcbiAgICAgICAgICAgIFNpemU6IHsgbGFiZWw6IG1lc3NbJzInXSwgc29ydFR5cGU6ICdudW1iZXInLCB3aWR0aDogJzIwJScsIHJlbmRlckNlbGw6IGZ1bmN0aW9uIHJlbmRlckNlbGwoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcyA9IHBhcnNlSW50KGRhdGEuZ2V0TWV0YWRhdGEoKS5nZXQoJ2J5dGVzaXplJykpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3B5ZGlvVXRpbFBhdGgyWydkZWZhdWx0J10ucm91bmRGaWxlU2l6ZShzKTtcbiAgICAgICAgICAgICAgICB9IH0sXG4gICAgICAgICAgICBhanhwX21vZGlmdGltZTogeyBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy4xMCddLCBzb3J0VHlwZTogJ3N0cmluZycsIHdpZHRoOiAnMjUlJyB9LFxuICAgICAgICAgICAgdmVyc2lvbkRlc2NyaXB0aW9uOiB7IGxhYmVsOiBtZXNzWydtZXRhLnZlcnNpb25zLjExJ10sIHNvcnRUeXBlOiAnc3RyaW5nJywgd2lkdGg6ICc1MCUnIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgZGlzYWJsZWQgPSAhdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHJldHVybiBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICdkaXYnLFxuICAgICAgICAgICAgeyBzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nIH0gfSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KFxuICAgICAgICAgICAgICAgIF9tYXRlcmlhbFVpLlRvb2xiYXIsXG4gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVG9vbGJhckdyb3VwLFxuICAgICAgICAgICAgICAgICAgICB7IGZpcnN0Q2hpbGQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHsgc3R5bGU6IHsgcGFkZGluZ0xlZnQ6IDIwLCBjb2xvcjogJ3doaXRlJywgZm9udFNpemU6IDE4IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NbJ21ldGEudmVyc2lvbnMuMTYnXS5yZXBsYWNlKCclcycsIHRoaXMucHJvcHMubm9kZS5nZXRMYWJlbCgpKVxuICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChcbiAgICAgICAgICAgICAgICAgICAgX21hdGVyaWFsVWkuVG9vbGJhckdyb3VwLFxuICAgICAgICAgICAgICAgICAgICB7IGxhc3RDaGlsZDogdHJ1ZSwgc3R5bGU6IHsgcGFkZGluZ1JpZ2h0OiA3IH0gfSxcbiAgICAgICAgICAgICAgICAgICAgX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoX21hdGVyaWFsVWkuSWNvbkJ1dHRvbiwgeyBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktZG93bmxvYWRcIiwgdG9vbHRpcFBvc2l0aW9uOiBcImJvdHRvbS1sZWZ0XCIsIGljb25TdHlsZTogZGlzYWJsZWQgPyB7fSA6IHsgY29sb3I6ICd3aGl0ZScgfSwgZGlzYWJsZWQ6IGRpc2FibGVkLCBsYWJlbDogbWVzc1snbWV0YS52ZXJzaW9ucy4zJ10sIHRvb2x0aXA6IG1lc3NbJ21ldGEudmVyc2lvbnMuNCddLCBvblRvdWNoVGFwOiB0aGlzLmFwcGx5QWN0aW9uLmJpbmQodGhpcywgJ2RsJykgfSksXG4gICAgICAgICAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkljb25CdXR0b24sIHsgaWNvbkNsYXNzTmFtZTogXCJtZGkgbWRpLWJhY2t1cC1yZXN0b3JlXCIsIHRvb2x0aXBQb3NpdGlvbjogXCJib3R0b20tbGVmdFwiLCBpY29uU3R5bGU6IGRpc2FibGVkID8ge30gOiB7IGNvbG9yOiAnd2hpdGUnIH0sIGRpc2FibGVkOiBkaXNhYmxlZCwgbGFiZWw6IG1lc3NbJ21ldGEudmVyc2lvbnMuNyddLCB0b29sdGlwOiBtZXNzWydtZXRhLnZlcnNpb25zLjgnXSwgb25Ub3VjaFRhcDogdGhpcy5hcHBseUFjdGlvbi5iaW5kKHRoaXMsICdyZXZlcnQnKSB9KVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICksXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChQeWRpb0NvbXBvbmVudHMuTm9kZUxpc3RDdXN0b21Qcm92aWRlciwge1xuICAgICAgICAgICAgICAgIHN0eWxlOiB7IGZsZXg6IDEgfSxcbiAgICAgICAgICAgICAgICBwcmVzZXREYXRhTW9kZWw6IHRoaXMuc3RhdGUuYXBpLmdldERhdGFNb2RlbCgpLFxuICAgICAgICAgICAgICAgIGFjdGlvbkJhckdyb3VwczogW10sXG4gICAgICAgICAgICAgICAgZWxlbWVudEhlaWdodDogUHlkaW9Db21wb25lbnRzLlNpbXBsZUxpc3QuSEVJR0hUX09ORV9MSU5FLFxuICAgICAgICAgICAgICAgIHRhYmxlS2V5czogdGFibGVLZXlzLFxuICAgICAgICAgICAgICAgIGVudHJ5SGFuZGxlQ2xpY2tzOiB0aGlzLm5vZGVDbGlja2VkLFxuICAgICAgICAgICAgICAgIGVtcHR5U3RhdGVQcm9wczoge1xuICAgICAgICAgICAgICAgICAgICBpY29uQ2xhc3NOYW1lOiBcIm1kaSBtZGktYmFja3VwLXJlc3RvcmVcIixcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeVRleHRJZDogXCJtZXRhLnZlcnNpb25zLjE0XCIsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiA0MFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBzZWNvbmRhcnlUZXh0SWQ6IFwibWV0YS52ZXJzaW9ucy4xNVwiXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIF9yZWFjdDJbJ2RlZmF1bHQnXS5jcmVhdGVFbGVtZW50KF9tYXRlcmlhbFVpLkRpdmlkZXIsIG51bGwpXG4gICAgICAgICk7XG4gICAgfVxuXG59KTtcblxuaWYgKHdpbmRvdy5SZWFjdERORCkge1xuICAgIHZhciBGYWtlRG5kQmFja2VuZCA9IGZ1bmN0aW9uIEZha2VEbmRCYWNrZW5kKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2V0dXA6IGZ1bmN0aW9uIHNldHVwKCkge30sXG4gICAgICAgICAgICB0ZWFyZG93bjogZnVuY3Rpb24gdGVhcmRvd24oKSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3REcmFnU291cmNlOiBmdW5jdGlvbiBjb25uZWN0RHJhZ1NvdXJjZSgpIHt9LFxuICAgICAgICAgICAgY29ubmVjdERyYWdQcmV2aWV3OiBmdW5jdGlvbiBjb25uZWN0RHJhZ1ByZXZpZXcoKSB7fSxcbiAgICAgICAgICAgIGNvbm5lY3REcm9wVGFyZ2V0OiBmdW5jdGlvbiBjb25uZWN0RHJvcFRhcmdldCgpIHt9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBIaXN0b3J5QnJvd3NlciA9IHdpbmRvdy5SZWFjdERORC5EcmFnRHJvcENvbnRleHQoRmFrZURuZEJhY2tlbmQpKEhpc3RvcnlCcm93c2VyKTtcbn1cblxudmFyIEhpc3RvcnlEaWFsb2cgPSBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlQ2xhc3Moe1xuICAgIGRpc3BsYXlOYW1lOiAnSGlzdG9yeURpYWxvZycsXG5cbiAgICBtaXhpbnM6IFtQeWRpb1JlYWN0VWkuQWN0aW9uRGlhbG9nTWl4aW4sIFB5ZGlvUmVhY3RVaS5TdWJtaXRCdXR0b25Qcm92aWRlck1peGluXSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gZ2V0RGVmYXVsdFByb3BzKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlhbG9nVGl0bGU6ICcnLFxuICAgICAgICAgICAgZGlhbG9nSXNNb2RhbDogZmFsc2UsXG4gICAgICAgICAgICBkaWFsb2dTaXplOiAnbGcnLFxuICAgICAgICAgICAgZGlhbG9nUGFkZGluZzogZmFsc2VcbiAgICAgICAgfTtcbiAgICB9LFxuICAgIHN1Ym1pdDogZnVuY3Rpb24gc3VibWl0KCkge1xuICAgICAgICB0aGlzLmRpc21pc3MoKTtcbiAgICB9LFxuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gX3JlYWN0MlsnZGVmYXVsdCddLmNyZWF0ZUVsZW1lbnQoXG4gICAgICAgICAgICAnZGl2JyxcbiAgICAgICAgICAgIHsgc3R5bGU6IHsgd2lkdGg6ICcxMDAlJyB9LCBjbGFzc05hbWU6ICdsYXlvdXQtZmlsbCB2ZXJ0aWNhbC1sYXlvdXQnIH0sXG4gICAgICAgICAgICBfcmVhY3QyWydkZWZhdWx0J10uY3JlYXRlRWxlbWVudChIaXN0b3J5QnJvd3NlciwgeyBub2RlOiB0aGlzLnByb3BzLm5vZGUsIG9uUmVxdWVzdENsb3NlOiB0aGlzLmRpc21pc3MgfSlcbiAgICAgICAgKTtcbiAgICB9XG5cbn0pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBIaXN0b3J5RGlhbG9nO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDctMjAxNyBDaGFybGVzIGR1IEpldSAtIEFic3RyaXVtIFNBUyA8dGVhbSAoYXQpIHB5ZC5pbz5cbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIFB5ZGlvLlxuICpcbiAqIFB5ZGlvIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEFmZmVybyBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogUHlkaW8gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgQWZmZXJvIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggUHlkaW8uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKlxuICogVGhlIGxhdGVzdCBjb2RlIGNhbiBiZSBmb3VuZCBhdCA8aHR0cHM6Ly9weWRpby5jb20+LlxuICovXG4ndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfSGlzdG9yeURpYWxvZyA9IHJlcXVpcmUoJy4vSGlzdG9yeURpYWxvZycpO1xuXG52YXIgX0hpc3RvcnlEaWFsb2cyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfSGlzdG9yeURpYWxvZyk7XG5cbnZhciBfQ2FsbGJhY2tzID0gcmVxdWlyZSgnLi9DYWxsYmFja3MnKTtcblxudmFyIF9DYWxsYmFja3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfQ2FsbGJhY2tzKTtcblxuZXhwb3J0cy5IaXN0b3J5RGlhbG9nID0gX0hpc3RvcnlEaWFsb2cyWydkZWZhdWx0J107XG5leHBvcnRzLkNhbGxiYWNrcyA9IF9DYWxsYmFja3MyWydkZWZhdWx0J107XG4iXX0=
