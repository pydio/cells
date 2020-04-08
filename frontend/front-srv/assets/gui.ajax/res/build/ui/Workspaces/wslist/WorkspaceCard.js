/*
 * Copyright 2007-2020 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _pydioHttpResourcesManager = require('pydio/http/resources-manager');

var _pydioHttpResourcesManager2 = _interopRequireDefault(_pydioHttpResourcesManager);

var _Pydio$requireLib = _pydio2['default'].requireLib('components');

var GenericCard = _Pydio$requireLib.GenericCard;
var GenericLine = _Pydio$requireLib.GenericLine;

var WorkspaceCard = (function (_React$Component) {
    _inherits(WorkspaceCard, _React$Component);

    function WorkspaceCard(props) {
        var _this = this;

        _classCallCheck(this, WorkspaceCard);

        _React$Component.call(this, props);
        this.state = {};
        var rootNode = this.props.rootNode;

        if (rootNode.getMetadata().has('virtual_root')) {
            // Use node children instead
            if (rootNode.isLoaded()) {
                this.state.rootNodes = [];
                rootNode.getChildren().forEach(function (n) {
                    return _this.state.rootNodes.push(n);
                });
            } else {
                // Trigger children load
                rootNode.observeOnce('loaded', function () {
                    var rootNodes = [];
                    rootNode.getChildren().forEach(function (n) {
                        return rootNodes.push(n);
                    });
                    _this.setState({ rootNodes: rootNodes });
                });
                rootNode.load();
            }
        } else {
            this.state.rootNodes = [rootNode];
        }
        _pydioHttpResourcesManager2['default'].loadClassesAndApply(["PydioActivityStreams"], function () {
            _this.setState({ ASLib: true });
        });
        _pydioHttpResourcesManager2['default'].loadClassesAndApply(["PydioCoreActions"], function () {
            _this.setState({ CALib: true });
        });
    }

    WorkspaceCard.prototype.render = function render() {
        var _props = this.props;
        var pydio = _props.pydio;
        var workspace = _props.workspace;
        var onDismiss = _props.onDismiss;
        var rootNodes = this.state.rootNodes;
        var _state = this.state;
        var ASLib = _state.ASLib;
        var CALib = _state.CALib;

        var watchLine = undefined,
            bookmarkAction = undefined;
        if (pydio.getPluginConfigs('core.activitystreams').get('ACTIVITY_SHOW_ACTIVITIES') && ASLib && rootNodes) {

            var selector = _react2['default'].createElement(PydioActivityStreams.WatchSelector, { pydio: pydio, nodes: rootNodes });
            watchLine = _react2['default'].createElement(GenericLine, { iconClassName: "mdi mdi-bell-outline", legend: "Get notifications...", iconStyle: { marginTop: 32 }, data: selector });
        }
        if (CALib && rootNodes) {
            bookmarkAction = _react2['default'].createElement(PydioCoreActions.BookmarkButton, { pydio: pydio, nodes: rootNodes, styles: { iconStyle: { color: 'white' } } });
        }

        return _react2['default'].createElement(
            GenericCard,
            {
                pydio: pydio,
                title: workspace.getLabel(),
                onDismissAction: onDismiss,
                style: { width: 350 },
                otherActions: [bookmarkAction]
            },
            workspace.getDescription() && _react2['default'].createElement(GenericLine, { iconClassName: 'mdi mdi-information', legend: "Description", data: workspace.getDescription() }),
            watchLine
        );
    };

    return WorkspaceCard;
})(_react2['default'].Component);

exports['default'] = WorkspaceCard;
module.exports = exports['default'];
