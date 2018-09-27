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

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _OpenNodesModel = require('../OpenNodesModel');

var _OpenNodesModel2 = _interopRequireDefault(_OpenNodesModel);

var _reactRedux = require('react-redux');

var _editor = require('../editor');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib.EditorActions;

var EditionPanel = (function (_React$Component) {
    _inherits(EditionPanel, _React$Component);

    function EditionPanel(props) {
        _classCallCheck(this, EditionPanel);

        _React$Component.call(this, props);
    }

    EditionPanel.prototype.componentDidMount = function componentDidMount() {
        var _this = this;

        this._nodesModelObserver = function (node) {
            return _this._handleNodePushed(node);
        };
        this._nodesRemoveObserver = function (index) {
            return _this._handleNodeRemoved(index);
        };
        this._titlesObserver = function () {
            return _this.forceUpdate();
        };

        _OpenNodesModel2['default'].getInstance().observe("nodePushed", this._nodesModelObserver);
        _OpenNodesModel2['default'].getInstance().observe("nodeRemovedAtIndex", this._nodesRemoveObserver);
        _OpenNodesModel2['default'].getInstance().observe("titlesUpdated", this._titlesObserver);
    };

    EditionPanel.prototype.componentWillUnmount = function componentWillUnmount() {
        _OpenNodesModel2['default'].getInstance().stopObserving("nodePushed", this._nodesModelObserver);
        _OpenNodesModel2['default'].getInstance().stopObserving("nodeRemovedAtIndex", this._nodesRemoveObserver);
        _OpenNodesModel2['default'].getInstance().stopObserving("titlesUpdated", this._titlesObserver);
    };

    EditionPanel.prototype._handleNodePushed = function _handleNodePushed(object) {
        var _this2 = this;

        var _props = this.props;
        var pydio = _props.pydio;
        var tabCreate = _props.tabCreate;
        var editorModify = _props.editorModify;
        var editorSetActiveTab = _props.editorSetActiveTab;
        var _object$node = object.node;
        var node = _object$node === undefined ? {} : _object$node;
        var editorData = object.editorData;

        pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
            var EditorClass = null;

            if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                _this2.setState({
                    error: "Cannot find editor component (" + editorData.editorClass + ")!"
                });
                return;
            }

            console.log(EditorClass);

            var tabId = tabCreate({
                id: node.getLabel(),
                title: node.getLabel(),
                url: node.getPath(),
                icon: PydioWorkspaces.FilePreview,
                Editor: EditorClass.Editor,
                Controls: EditorClass.Controls,
                pydio: pydio,
                node: node,
                editorData: editorData,
                registry: pydio.Registry
            }).id;

            editorSetActiveTab(tabId);

            editorModify({
                isMinimised: false
            });
        });
    };

    EditionPanel.prototype._handleNodeRemoved = function _handleNodeRemoved(index) {};

    EditionPanel.prototype.render = function render() {
        return React.createElement(_editor.Editor, null);
    };

    return EditionPanel;
})(React.Component);

EditionPanel.PropTypes = {
    pydio: React.PropTypes.instanceOf(_pydio2['default'])
};

exports['default'] = _reactRedux.connect(null, EditorActions)(EditionPanel);
module.exports = exports['default'];
