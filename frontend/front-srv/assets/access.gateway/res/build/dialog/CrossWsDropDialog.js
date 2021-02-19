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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _pydioModelMetaNodeProvider = require('pydio/model/meta-node-provider');

var _pydioModelMetaNodeProvider2 = _interopRequireDefault(_pydioModelMetaNodeProvider);

var _pydioHttpApi = require('pydio/http/api');

var _pydioHttpApi2 = _interopRequireDefault(_pydioHttpApi);

var _cellsSdk = require('cells-sdk');

var _pydioModelCell = require('pydio/model/cell');

var _pydioModelCell2 = _interopRequireDefault(_pydioModelCell);

var _materialUiStyles = require('material-ui/styles');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var React = require('react');

var _require = require('material-ui');

var FontIcon = _require.FontIcon;
var ListItem = _require.ListItem;
var List = _require.List;
var FlatButton = _require.FlatButton;
var Subheader = _require.Subheader;

var Pydio = require('pydio');
var PydioDataModel = require('pydio/model/data-model');

var _Pydio$requireLib = Pydio.requireLib('boot');

var ActionDialogMixin = _Pydio$requireLib.ActionDialogMixin;

var CrossWsContent = (function (_React$Component) {
    _inherits(CrossWsContent, _React$Component);

    function CrossWsContent(props) {
        _classCallCheck(this, CrossWsContent);

        _get(Object.getPrototypeOf(CrossWsContent.prototype), 'constructor', this).call(this, props);
        this.state = { roots: [] };
    }

    _createClass(CrossWsContent, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this = this;

            // List roots for the cell
            var cellWs = this.props.cellWs;

            var metaService = new _cellsSdk.MetaServiceApi(_pydioHttpApi2['default'].getRestClient());
            var request = new _cellsSdk.RestGetBulkMetaRequest();
            var slug = cellWs.getSlug();
            console.log(slug);
            request.NodePaths = [slug, slug + '/*'];
            metaService.getBulkMeta(request).then(function (response) {
                var nodes = response.Nodes || [];
                var wsRoot = null,
                    wsChildren = [];
                nodes.forEach(function (node) {
                    if (node.Path === slug + '/') {
                        wsRoot = _pydioModelMetaNodeProvider2['default'].parseTreeNode(node, slug);
                    } else {
                        var child = _pydioModelMetaNodeProvider2['default'].parseTreeNode(node, slug);
                        if (!child.isLeaf()) {
                            wsChildren.push(child);
                        }
                    }
                });
                if (wsRoot.getMetadata().has('virtual_root')) {
                    console.log(wsChildren);
                    _this.setState({ roots: wsChildren });
                } else {
                    console.log(wsRoot);
                    _this.setState({ roots: [wsRoot] });
                }
            });
        }
    }, {
        key: 'move',
        value: function move(targetNode) {
            var _props = this.props;
            var source = _props.source;
            var cellWs = _props.cellWs;
            var pydio = _props.pydio;
            var dropEffect = _props.dropEffect;

            var moveFunction = require('../callback/applyCopyOrMove')(Pydio.getInstance());
            var selection = pydio.getContextHolder();
            var selectedNodes = selection.getSelectedNodes();
            if (selectedNodes.indexOf(source) === -1) {
                // Use source node instead of current datamodel selection
                var newSel = new PydioDataModel();
                newSel.setContextNode(selection.getContextNode());
                newSel.setSelectedNodes([source]);
                moveFunction(dropEffect, newSel, targetNode.getPath(), cellWs.getId());
            } else {
                moveFunction(dropEffect, selection, targetNode.getPath(), cellWs.getId());
            }
            this.props.onDismiss();
        }
    }, {
        key: 'share',
        value: function share() {
            var _this2 = this;

            var _props2 = this.props;
            var source = _props2.source;
            var cellWs = _props2.cellWs;
            var pydio = _props2.pydio;

            var model = new _pydioModelCell2['default']();
            model.load(cellWs.getId()).then(function () {
                model.addRootNode(source);
                model.save().then(function () {
                    _this2.props.onDismiss();
                    pydio.triggerRepositoryChange(cellWs.getId());
                });
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props;
            var source = _props3.source;
            var cellWs = _props3.cellWs;
            var dropEffect = _props3.dropEffect;
            var pydio = _props3.pydio;
            var muiTheme = _props3.muiTheme;
            var roots = this.state.roots;

            var m = function m(id) {
                return pydio.MessageHash['openother.drop.cell.' + id] || id;
            };
            var items = [];

            items.push(React.createElement(ListItem, {
                onClick: function () {
                    _this3.share();
                },
                primaryText: source.isLeaf() ? m('file.share') : m('folder.share'),
                secondaryText: m('share.legend').replace('%s', cellWs.getLabel()),
                leftIcon: React.createElement(FontIcon, { style: { color: muiTheme.palette.primary1Color }, className: "mdi mdi-share-variant" })
            }));
            var leaf = source.isLeaf() ? 'file' : 'folder';
            var title = m(leaf + '.' + dropEffect);
            roots.forEach(function (root) {
                var secondary = m('copymove.legend').replace('%s', cellWs.getLabel());
                if (root.getPath() !== "/" && root.getPath() !== "") {
                    secondary += "/" + root.getLabel();
                }
                items.push(React.createElement(ListItem, {
                    onClick: function () {
                        _this3.move(root);
                    },
                    primaryText: title,
                    secondaryText: secondary,
                    leftIcon: React.createElement(FontIcon, { style: { color: muiTheme.palette.primary1Color }, className: "mdi mdi-folder-" + (dropEffect === 'copy' ? "plus" : "move") })
                }));
            });
            return React.createElement(
                List,
                { style: { maxHeight: 320, overflowY: 'scroll', width: '100%', borderTop: '1px solid #e0e0e0' } },
                React.createElement(
                    Subheader,
                    { style: { overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: 16, textOverflow: 'ellipsis' } },
                    m('picker').replace('%s', source.getLabel())
                ),
                items
            );
        }
    }]);

    return CrossWsContent;
})(React.Component);

CrossWsContent = (0, _materialUiStyles.muiThemeable)()(CrossWsContent);

var CrossWsDropDialog = (0, _createReactClass2['default'])({

    propTypes: {
        pydio: _propTypes2['default'].instanceOf(Pydio),
        selection: _propTypes2['default'].instanceOf(PydioDataModel)
    },

    mixins: [ActionDialogMixin],

    getButtons: function getButtons(updater) {
        var actions = [];
        var mess = this.props.pydio.MessageHash;
        actions.push(React.createElement(FlatButton, {
            label: mess['49'],
            primary: true,
            keyboardFocused: true,
            onClick: this.props.onDismiss
        }));
        return actions;
    },

    getDefaultProps: function getDefaultProps() {
        return {
            dialogIsModal: false,
            dialogSize: 'sm',
            dialogPadding: 0
        };
    },

    render: function render() {
        return React.createElement(CrossWsContent, this.props);
    }

});

exports['default'] = CrossWsDropDialog;
module.exports = exports['default'];
