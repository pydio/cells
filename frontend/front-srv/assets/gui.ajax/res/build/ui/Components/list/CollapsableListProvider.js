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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _pydioModelRemoteNodeProvider = require("pydio/model/remote-node-provider");

var _pydioModelRemoteNodeProvider2 = _interopRequireDefault(_pydioModelRemoteNodeProvider);

var _NodeListCustomProvider = require('./NodeListCustomProvider');

var _NodeListCustomProvider2 = _interopRequireDefault(_NodeListCustomProvider);

var _elementsDataModelBadge = require('../elements/DataModelBadge');

var _elementsDataModelBadge2 = _interopRequireDefault(_elementsDataModelBadge);

var CollapsableListProvider = (function (_React$Component) {
    _inherits(CollapsableListProvider, _React$Component);

    // propTypes:{
    //     paneData:React.PropTypes.object,
    //     pydio:React.PropTypes.instanceOf(Pydio),
    //     nodeClicked:React.PropTypes.func,
    //     startOpen:React.PropTypes.bool,
    //     onBadgeIncrease: React.PropTypes.func,
    //     onBadgeChange: React.PropTypes.func
    // },

    function CollapsableListProvider(props) {
        _classCallCheck(this, CollapsableListProvider);

        _React$Component.call(this, props);
        var dataModel = new _pydioModelDataModel2['default'](true);
        var rNodeProvider = new _pydioModelRemoteNodeProvider2['default']();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(this.props.paneData.options['nodeProviderProperties']);
        var rootNode = new _pydioModelNode2['default']("/", false, "loading", "folder.png", rNodeProvider);
        dataModel.setRootNode(rootNode);

        this.state = {
            open: false,
            componentLaunched: !!this.props.paneData.options['startOpen'],
            dataModel: dataModel
        };
    }

    CollapsableListProvider.prototype.toggleOpen = function toggleOpen() {
        this.setState({ open: !this.state.open, componentLaunched: true });
    };

    CollapsableListProvider.prototype.onBadgeIncrease = function onBadgeIncrease(newValue, prevValue, memoData) {
        if (this.props.onBadgeIncrease) {
            this.props.onBadgeIncrease(this.props.paneData, newValue, prevValue, memoData);
            if (!this.state.open) {
                this.toggleOpen();
            }
        }
    };

    CollapsableListProvider.prototype.onBadgeChange = function onBadgeChange(newValue, prevValue, memoData) {
        if (this.props.onBadgeChange) {
            this.props.onBadgeChange(this.props.paneData, newValue, prevValue, memoData);
            if (!this.state.open) {
                this.toggleOpen();
            }
        }
    };

    CollapsableListProvider.prototype.render = function render() {

        var messages = this.props.pydio.MessageHash;
        var paneData = this.props.paneData;

        var title = messages[paneData.options.title] || paneData.options.title;
        var className = 'simple-provider ' + (paneData.options['className'] ? paneData.options['className'] : '');
        var titleClassName = 'section-title ' + (paneData.options['titleClassName'] ? paneData.options['titleClassName'] : '');

        var badge = undefined;
        if (paneData.options.dataModelBadge) {
            badge = _react2['default'].createElement(_elementsDataModelBadge2['default'], {
                dataModel: this.state.dataModel,
                options: paneData.options.dataModelBadge,
                onBadgeIncrease: this.onBadgeIncrease.bind(this),
                onBadgeChange: this.onBadgeChange.bind(this)
            });
        }
        var emptyMessage = undefined;
        if (paneData.options.emptyChildrenMessage) {
            emptyMessage = _react2['default'].createElement(_elementsDataModelBadge2['default'], {
                dataModel: this.state.dataModel,
                options: {
                    property: 'root_children_empty',
                    className: 'emptyMessage',
                    emptyMessage: messages[paneData.options.emptyChildrenMessage]
                }
            });
        }

        var component = undefined;
        if (this.state.componentLaunched) {
            var entryRenderFirstLine = undefined;
            if (paneData.options['tipAttribute']) {
                entryRenderFirstLine = function (node) {
                    var meta = node.getMetadata().get(paneData.options['tipAttribute']);
                    if (meta) {
                        return _react2['default'].createElement(
                            'div',
                            { title: meta.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?(\/)?>|<\/\w+>/gi, '') },
                            node.getLabel()
                        );
                    } else {
                        return node.getLabel();
                    }
                };
            }
            component = _react2['default'].createElement(_NodeListCustomProvider2['default'], {
                pydio: this.props.pydio,
                ref: paneData.id,
                title: title,
                elementHeight: 36,
                heightAutoWithMax: 4000,
                entryRenderFirstLine: entryRenderFirstLine,
                nodeClicked: this.props.nodeClicked,
                presetDataModel: this.state.dataModel,
                reloadOnServerMessage: paneData.options['reloadOnServerMessage'],
                actionBarGroups: paneData.options['actionBarGroups'] ? paneData.options['actionBarGroups'] : []
            });
        }

        return _react2['default'].createElement(
            'div',
            { className: className + (this.state.open ? " open" : " closed") },
            _react2['default'].createElement(
                'div',
                { className: titleClassName },
                _react2['default'].createElement(
                    'span',
                    { className: 'toggle-button', onClick: this.toggleOpen.bind(this) },
                    this.state.open ? messages[514] : messages[513]
                ),
                title,
                ' ',
                badge
            ),
            component,
            emptyMessage
        );
    };

    return CollapsableListProvider;
})(_react2['default'].Component);

exports['default'] = CollapsableListProvider;
module.exports = exports['default'];
