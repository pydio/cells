'use strict';

exports.__esModule = true;

var _this4 = this;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _utilDND = require('../util/DND');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUi = require('material-ui');

var _materialUiStyles = require('material-ui/styles');

var _Pydio$requireLib = _pydio2['default'].requireLib('hoc');

var withContextMenu = _Pydio$requireLib.withContextMenu;

var ContextMenuWrapper = function ContextMenuWrapper(props) {
    return _react2['default'].createElement('div', props);
};
ContextMenuWrapper = withContextMenu(ContextMenuWrapper);

/**
 * Tree Node
 */
var SimpleTreeNode = _createReactClass2['default']({
    displayName: 'SimpleTreeNode',

    propTypes: {
        collapse: _propTypes2['default'].bool,
        forceExpand: _propTypes2['default'].bool,
        childrenOnly: _propTypes2['default'].bool,
        depth: _propTypes2['default'].number,
        onNodeSelect: _propTypes2['default'].func,
        node: _propTypes2['default'].instanceOf(AjxpNode),
        dataModel: _propTypes2['default'].instanceOf(PydioDataModel),
        forceLabel: _propTypes2['default'].string,
        // Optional currently selected detection
        nodeIsSelected: _propTypes2['default'].func,
        // Optional checkboxes
        checkboxes: _propTypes2['default'].array,
        checkboxesValues: _propTypes2['default'].object,
        checkboxesComputeStatus: _propTypes2['default'].func,
        onCheckboxCheck: _propTypes2['default'].func,
        paddingOffset: _propTypes2['default'].number
    },

    getDefaultProps: function getDefaultProps() {
        return {
            collapse: false,
            childrenOnly: false,
            depth: 0,
            paddingOffset: 0,
            onNodeSelect: function onNodeSelect(node) {}
        };
    },

    listenToNode: function listenToNode(node) {
        this._childrenListener = (function () {
            if (!this.isMounted()) return;
            this.setState({ children: this._nodeToChildren(node) });
        }).bind(this);
        this._nodeListener = (function () {
            if (!this.isMounted()) return;
            this.forceUpdate();
        }).bind(this);
        node.observe("child_added", this._childrenListener);
        node.observe("child_removed", this._childrenListener);
        node.observe("loaded", this._childrenListener);
        node.observe("node_replaced", this._nodeListener);
    },

    stopListening: function stopListening(node) {
        node.stopObserving("child_added", this._childrenListener);
        node.stopObserving("child_removed", this._childrenListener);
        node.stopObserving("loaded", this._childrenListener);
        node.stopObserving("node_replaced", this._nodeListener);
    },

    componentDidMount: function componentDidMount() {
        this.listenToNode(this.props.node);
    },

    componentWillUnmount: function componentWillUnmount() {
        this.stopListening(this.props.node);
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var oldNode = this.props.node;
        var newNode = nextProps.node;
        if (newNode === oldNode && newNode.getMetadata().get("paginationData")) {
            var remapedChildren = this.state.children.map(function (c) {
                c.setParent(newNode);return c;
            });
            var remapedPathes = this.state.children.map(function (c) {
                return c.getPath();
            });
            var newChildren = this._nodeToChildren(newNode);
            newChildren.forEach(function (nc) {
                if (remapedPathes.indexOf(nc.getPath()) === -1) {
                    remapedChildren.push(nc);
                }
            });
            this.setState({ children: remapedChildren });
        } else {
            this.setState({ children: this._nodeToChildren(newNode) });
        }
        if (newNode !== oldNode) {
            this.stopListening(oldNode);
            this.listenToNode(newNode);
        }
    },

    getInitialState: function getInitialState() {
        return {
            showChildren: !this.props.collapse || this.props.forceExpand,
            children: this._nodeToChildren(this.props.node)
        };
    },

    _nodeToChildren: function _nodeToChildren() {
        var children = [];
        this.props.node.getChildren().forEach(function (c) {
            if (!c.isLeaf() || c.getAjxpMime() === 'ajxp_browsable_archive') {
                children.push(c);
            }
        });
        var sortFunction = function sortFunction(nodeA, nodeB) {
            // Recycle always last
            if (nodeA.isRecycle()) {
                return 1;
            }
            if (nodeB.isRecycle()) {
                return -1;
            }
            return nodeA.getLabel().localeCompare(nodeB.getLabel(), undefined, { numeric: true });
        };
        children.sort(sortFunction);

        return children;
    },

    onNodeSelect: function onNodeSelect(ev) {
        if (this.props.onNodeSelect) {
            this.props.onNodeSelect(this.props.node);
        }
        ev.preventDefault();
        ev.stopPropagation();
    },

    onChildDisplayToggle: function onChildDisplayToggle(ev) {
        if (this.props.node.getChildren().size) {
            this.setState({ showChildren: !this.state.showChildren });
        }
        ev.preventDefault();
        ev.stopPropagation();
    },

    nodeIsSelected: function nodeIsSelected(n) {
        if (this.props.nodeIsSelected) return this.props.nodeIsSelected(n);else return this.props.dataModel.getSelectedNodes().indexOf(n) !== -1;
    },

    render: function render() {
        var _this = this;

        var _props = this.props;
        var node = _props.node;
        var dataModel = _props.dataModel;
        var childrenOnly = _props.childrenOnly;
        var canDrop = _props.canDrop;
        var isOverCurrent = _props.isOverCurrent;
        var checkboxes = _props.checkboxes;
        var checkboxesComputeStatus = _props.checkboxesComputeStatus;
        var checkboxesValues = _props.checkboxesValues;
        var onCheckboxCheck = _props.onCheckboxCheck;
        var depth = _props.depth;
        var paddingOffset = _props.paddingOffset;
        var forceExpand = _props.forceExpand;
        var selectedItemStyle = _props.selectedItemStyle;
        var getItemStyle = _props.getItemStyle;
        var forceLabel = _props.forceLabel;
        var noPaginator = _props.noPaginator;

        var hasFolderChildrens = !!this.state.children.length;
        var hasChildren = undefined;
        if (hasFolderChildrens) {
            hasChildren = _react2['default'].createElement(
                'span',
                { onClick: this.onChildDisplayToggle },
                this.state.showChildren || forceExpand ? _react2['default'].createElement('span', { className: 'tree-icon icon-angle-down' }) : _react2['default'].createElement('span', { className: 'tree-icon icon-angle-right' })
            );
        } else {
            var cname = "tree-icon icon-angle-right";
            if (node.isLoaded()) {
                cname += " no-folder-children";
            }
            hasChildren = _react2['default'].createElement('span', { className: cname });
        }
        var isSelected = this.nodeIsSelected(node) ? 'mui-menu-item mui-is-selected' : 'mui-menu-item';
        var selfLabel;
        if (!childrenOnly) {
            if (canDrop && isOverCurrent) {
                isSelected += ' droppable-active';
            }
            var boxes;
            if (checkboxes) {
                var values = {},
                    inherited = false,
                    disabled = {},
                    additionalClassName = '';
                if (checkboxesComputeStatus) {
                    var status = checkboxesComputeStatus(node);
                    values = status.VALUES;
                    inherited = status.INHERITED;
                    disabled = status.DISABLED;
                    if (status.CLASSNAME) {
                        additionalClassName = ' ' + status.CLASSNAME;
                    }
                } else if (checkboxesValues && checkboxesValues[node.getPath()]) {
                    values = checkboxesValues[node.getPath()];
                }
                var valueClasses = [];
                boxes = checkboxes.map((function (c) {
                    var selected = values[c] === undefined ? false : values[c];
                    var click = (function (event, value) {
                        onCheckboxCheck(node, c, value);
                    }).bind(this);
                    if (selected) {
                        valueClasses.push(c);
                    }
                    return _react2['default'].createElement(_materialUi.Checkbox, {
                        name: c,
                        key: c + "-" + (selected ? "true" : "false"),
                        checked: selected,
                        onCheck: click,
                        disabled: disabled[c],
                        className: "cbox-" + c,
                        style: { width: 44 }
                    });
                }).bind(this));
                isSelected += inherited ? " inherited " : "";
                isSelected += valueClasses.length ? " checkbox-values-" + valueClasses.join('-') : " checkbox-values-empty";
                boxes = _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center' }, className: "tree-checkboxes" + additionalClassName },
                    boxes
                );
            }
            var itemStyle = { paddingLeft: paddingOffset + depth * 20 };
            if (this.nodeIsSelected(node) && selectedItemStyle) {
                itemStyle = _extends({}, itemStyle, selectedItemStyle);
            }
            if (getItemStyle) {
                itemStyle = _extends({}, itemStyle, getItemStyle(node));
            }
            var icon = 'mdi mdi-folder';
            var ajxpMime = node.getAjxpMime();
            if (ajxpMime === 'ajxp_browsable_archive') {
                icon = 'mdi mdi-archive';
            } else if (ajxpMime === 'ajxp_recycle') {
                icon = 'mdi mdi-delete';
            }
            selfLabel = _react2['default'].createElement(
                ContextMenuWrapper,
                { node: node, className: 'tree-item ' + isSelected + (boxes ? ' has-checkboxes' : ''), style: itemStyle },
                _react2['default'].createElement(
                    'div',
                    { className: 'tree-item-label', onClick: this.onNodeSelect, title: node.getLabel(),
                        'data-id': node.getPath() },
                    hasChildren,
                    _react2['default'].createElement('span', { className: "tree-icon " + icon }),
                    forceLabel ? forceLabel : node.getLabel()
                ),
                boxes
            );
        }

        var children = [];
        var connector = function connector(instance) {
            return instance;
        };
        var draggable = false;
        if (window.ReactDND && this.props.connectDropTarget && this.props.connectDragSource) {
            (function () {
                var connectDragSource = _this.props.connectDragSource;
                var connectDropTarget = _this.props.connectDropTarget;
                connector = function (instance) {
                    connectDragSource(ReactDOM.findDOMNode(instance));
                    connectDropTarget(ReactDOM.findDOMNode(instance));
                };
                draggable = true;
            })();
        }

        if (this.state.showChildren || forceExpand) {
            children = this.state.children.map((function (child) {
                var props = _extends({}, this.props, {
                    forceLabel: null,
                    childrenOnly: false,
                    key: child.getPath(),
                    node: child,
                    depth: depth + 1
                });
                return _react2['default'].createElement(draggable ? DragDropTreeNode : SimpleTreeNode, props);
            }).bind(this));
        }
        return _react2['default'].createElement(
            'li',
            { ref: connector, className: "treenode" + node.getPath().replace(/\//g, '_') },
            selfLabel,
            _react2['default'].createElement(
                'ul',
                null,
                !noPaginator && node.getMetadata().has('paginationData') && parseInt(node.getMetadata().get('paginationData').get('total')) > 1 && _react2['default'].createElement(TreePaginator, { node: node, dataModel: dataModel, depth: depth + 1, paddingOffset: paddingOffset }),
                children
            )
        );
    }
});

var DragDropTreeNode;
if (window.ReactDND) {
    DragDropTreeNode = ReactDND.flow(ReactDND.DragSource(_utilDND.Types.NODE_PROVIDER, _utilDND.nodeDragSource, _utilDND.collect), ReactDND.DropTarget(_utilDND.Types.NODE_PROVIDER, _utilDND.nodeDropTarget, _utilDND.collectDrop))(SimpleTreeNode);
} else {
    DragDropTreeNode = SimpleTreeNode;
}

var TreePaginator = (function (_React$Component) {
    _inherits(TreePaginator, _React$Component);

    function TreePaginator() {
        _classCallCheck(this, TreePaginator);

        _React$Component.apply(this, arguments);
    }

    TreePaginator.prototype.goTo = function goTo(i) {
        var _props2 = this.props;
        var dataModel = _props2.dataModel;
        var node = _props2.node;

        node.getMetadata().get('paginationData').set('current', i);
        node.reload(dataModel.getAjxpNodeProvider());
    };

    TreePaginator.prototype.render = function render() {
        var _this2 = this;

        var _props3 = this.props;
        var node = _props3.node;
        var depth = _props3.depth;
        var paddingOffset = _props3.paddingOffset;
        var muiTheme = _props3.muiTheme;

        var icProps = {
            style: { width: 24, height: 24, padding: 0 }
        };
        var data = node.getMetadata().get('paginationData');
        var crt = data.get('current');
        var total = data.get('total');
        var pageWord = _pydio2['default'].getMessages()['331'];
        var label = pageWord + ' ' + crt + ' / ' + total;
        return _react2['default'].createElement(
            'li',
            null,
            _react2['default'].createElement(
                'div',
                { style: { paddingLeft: paddingOffset + depth * 20, paddingTop: 5, paddingBottom: 5, display: 'flex', alignItems: 'center' } },
                _react2['default'].createElement('div', { style: { paddingLeft: 14, paddingRight: 6, color: 'rgba(0,0,0,.43)' }, className: "mdi mdi-format-list-bulleted" }),
                _react2['default'].createElement(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,.73)', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 3, marginRight: 10 } },
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-left", onClick: function () {
                            _this2.goTo(crt - 1);
                        }, disabled: crt === 1 }, icProps)),
                    _react2['default'].createElement(
                        'div',
                        { style: { padding: '0 20px', flex: 1, textAlign: 'center', fontSize: 13 } },
                        label
                    ),
                    _react2['default'].createElement(_materialUi.IconButton, _extends({ iconClassName: "mdi mdi-chevron-right", onClick: function () {
                            _this2.goTo(crt + 1);
                        }, disabled: crt === total }, icProps))
                )
            )
        );
    };

    return TreePaginator;
})(_react2['default'].Component);

TreePaginator = _materialUiStyles.muiThemeable()(TreePaginator);

/**
 * Simple openable / loadable tree taking AjxpNode as inputs
 */

var DNDTreeView = (function (_React$Component2) {
    _inherits(DNDTreeView, _React$Component2);

    function DNDTreeView() {
        var _this3 = this;

        _classCallCheck(this, DNDTreeView);

        _React$Component2.apply(this, arguments);

        this.onNodeSelect = function (node) {
            if (_this3.props.onNodeSelect) {
                _this3.props.onNodeSelect(node);
            } else {
                _this3.props.dataModel.setSelectedNodes([node]);
            }
        };
    }

    DNDTreeView.prototype.render = function render() {
        return _react2['default'].createElement(
            'ul',
            { className: this.props.className },
            _react2['default'].createElement(DragDropTreeNode, {
                childrenOnly: !this.props.showRoot,
                forceExpand: this.props.forceExpand,
                node: this.props.node ? this.props.node : this.props.dataModel.getRootNode(),
                dataModel: this.props.dataModel,
                onNodeSelect: this.onNodeSelect,
                nodeIsSelected: this.props.nodeIsSelected,
                forceLabel: this.props.rootLabel,
                checkboxes: this.props.checkboxes,
                checkboxesValues: this.props.checkboxesValues,
                checkboxesComputeStatus: this.props.checkboxesComputeStatus,
                onCheckboxCheck: this.props.onCheckboxCheck,
                selectedItemStyle: this.props.selectedItemStyle,
                getItemStyle: this.props.getItemStyle,
                paddingOffset: this.props.paddingOffset,
                noPaginator: this.props.noPaginator
            })
        );
    };

    _createClass(DNDTreeView, null, [{
        key: 'propTypes',
        value: {
            showRoot: _propTypes2['default'].bool,
            rootLabel: _propTypes2['default'].string,
            onNodeSelect: _propTypes2['default'].func,
            node: _propTypes2['default'].instanceOf(AjxpNode).isRequired,
            dataModel: _propTypes2['default'].instanceOf(PydioDataModel).isRequired,
            selectable: _propTypes2['default'].bool,
            selectableMultiple: _propTypes2['default'].bool,
            initialSelectionModel: _propTypes2['default'].array,
            onSelectionChange: _propTypes2['default'].func,
            forceExpand: _propTypes2['default'].bool,
            // Optional currently selected detection
            nodeIsSelected: _propTypes2['default'].func,
            // Optional checkboxes
            checkboxes: _propTypes2['default'].array,
            checkboxesValues: _propTypes2['default'].object,
            checkboxesComputeStatus: _propTypes2['default'].func,
            onCheckboxCheck: _propTypes2['default'].func,
            paddingOffset: _propTypes2['default'].number
        },
        enumerable: true
    }, {
        key: 'defaultProps',
        value: {
            showRoot: true,
            onNodeSelect: _this4.onNodeSelect
        },
        enumerable: true
    }]);

    return DNDTreeView;
})(_react2['default'].Component);

var TreeView = (function (_React$Component3) {
    _inherits(TreeView, _React$Component3);

    function TreeView() {
        var _this5 = this;

        _classCallCheck(this, TreeView);

        _React$Component3.apply(this, arguments);

        this.onNodeSelect = function (node) {
            if (_this5.props.onNodeSelect) {
                _this5.props.onNodeSelect(node);
            } else {
                _this5.props.dataModel.setSelectedNodes([node]);
            }
        };
    }

    TreeView.prototype.render = function render() {
        return _react2['default'].createElement(
            'ul',
            { className: this.props.className },
            _react2['default'].createElement(SimpleTreeNode, {
                childrenOnly: !this.props.showRoot,
                forceExpand: this.props.forceExpand,
                node: this.props.node ? this.props.node : this.props.dataModel.getRootNode(),
                dataModel: this.props.dataModel,
                onNodeSelect: this.onNodeSelect,
                nodeIsSelected: this.props.nodeIsSelected,
                forceLabel: this.props.rootLabel,
                checkboxes: this.props.checkboxes,
                checkboxesValues: this.props.checkboxesValues,
                checkboxesComputeStatus: this.props.checkboxesComputeStatus,
                onCheckboxCheck: this.props.onCheckboxCheck,
                selectedItemStyle: this.props.selectedItemStyle,
                getItemStyle: this.props.getItemStyle,
                paddingOffset: this.props.paddingOffset
            })
        );
    };

    _createClass(TreeView, null, [{
        key: 'propTypes',
        value: {
            showRoot: _propTypes2['default'].bool,
            rootLabel: _propTypes2['default'].string,
            onNodeSelect: _propTypes2['default'].func,
            node: _propTypes2['default'].instanceOf(AjxpNode).isRequired,
            dataModel: _propTypes2['default'].instanceOf(PydioDataModel).isRequired,
            selectable: _propTypes2['default'].bool,
            selectableMultiple: _propTypes2['default'].bool,
            initialSelectionModel: _propTypes2['default'].array,
            onSelectionChange: _propTypes2['default'].func,
            forceExpand: _propTypes2['default'].bool,
            // Optional currently selected detection
            nodeIsSelected: _propTypes2['default'].func,
            // Optional checkboxes
            checkboxes: _propTypes2['default'].array,
            checkboxesValues: _propTypes2['default'].object,
            checkboxesComputeStatus: _propTypes2['default'].func,
            onCheckboxCheck: _propTypes2['default'].func,
            paddingOffset: _propTypes2['default'].number
        },
        enumerable: true
    }, {
        key: 'defaultProps',
        value: {
            showRoot: true,
            onNodeSelect: _this4.onNodeSelect
        },
        enumerable: true
    }]);

    return TreeView;
})(_react2['default'].Component);

var FoldersTree = (function (_React$Component4) {
    _inherits(FoldersTree, _React$Component4);

    function FoldersTree() {
        var _this6 = this;

        _classCallCheck(this, FoldersTree);

        _React$Component4.apply(this, arguments);

        this.nodeObserver = function () {
            var r = _this6.props.dataModel.getRootNode();
            if (!r.isLoaded()) {
                r.observeOnce("loaded", (function () {
                    this.forceUpdate();
                }).bind(_this6));
            } else {
                _this6.forceUpdate();
            }
        };

        this.treeNodeSelected = function (n) {
            if (_this6.props.onNodeSelected) {
                _this6.props.onNodeSelected(n);
            } else {
                _this6.props.dataModel.requireContextChange(n);
            }
        };

        this.nodeIsSelected = function (n) {
            return n === _this6.props.dataModel.getContextNode();
        };
    }

    FoldersTree.prototype.componentDidMount = function componentDidMount() {
        var dm = this.props.dataModel;
        this._dmObs = this.nodeObserver;
        dm.observe("context_changed", this._dmObs);
        dm.observe("root_node_changed", this._dmObs);
        this.nodeObserver();
    };

    FoldersTree.prototype.componentWillUnmount = function componentWillUnmount() {
        if (this._dmObs) {
            var dm = this.props.dataModel;
            dm.stopObserving("context_changed", this._dmObs);
            dm.stopObserving("root_node_changed", this._dmObs);
        }
    };

    FoldersTree.prototype.render = function render() {
        if (this.props.draggable) {
            return _react2['default'].createElement(PydioComponents.DNDTreeView, {
                onNodeSelect: this.treeNodeSelected,
                nodeIsSelected: this.nodeIsSelected,
                dataModel: this.props.dataModel,
                node: this.props.dataModel.getRootNode(),
                showRoot: this.props.showRoot ? true : false,
                selectedItemStyle: this.props.selectedItemStyle,
                getItemStyle: this.props.getItemStyle,
                noPaginator: this.props.noPaginator,
                className: "folders-tree" + (this.props.className ? ' ' + this.props.className : '')
            });
        } else {
            return _react2['default'].createElement(PydioComponents.TreeView, {
                onNodeSelect: this.treeNodeSelected,
                nodeIsSelected: this.nodeIsSelected,
                dataModel: this.props.dataModel,
                node: this.props.dataModel.getRootNode(),
                selectedItemStyle: this.props.selectedItemStyle,
                getItemStyle: this.props.getItemStyle,
                showRoot: this.props.showRoot ? true : false,
                noPaginator: this.props.noPaginator,
                className: "folders-tree" + (this.props.className ? ' ' + this.props.className : '')
            });
        }
    };

    _createClass(FoldersTree, null, [{
        key: 'propTypes',
        value: {
            pydio: _propTypes2['default'].instanceOf(_pydio2['default']).isRequired,
            dataModel: _propTypes2['default'].instanceOf(PydioDataModel).isRequired,
            className: _propTypes2['default'].string,
            onNodeSelected: _propTypes2['default'].func,
            draggable: _propTypes2['default'].bool
        },
        enumerable: true
    }]);

    return FoldersTree;
})(_react2['default'].Component);

exports.TreeView = TreeView;
exports.DNDTreeView = DNDTreeView;
exports.FoldersTree = FoldersTree;
