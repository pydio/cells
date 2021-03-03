/*
 * Copyright 2007-2021 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _reactInfinite = require('react-infinite');

var _reactInfinite2 = _interopRequireDefault(_reactInfinite);

var _reactScrollbar = require('react-scrollbar');

var _reactScrollbar2 = _interopRequireDefault(_reactScrollbar);

var _materialUi = require('material-ui');

var _ListEntry = require('./ListEntry');

var _TableListEntry = require('./TableListEntry');

var _TableListEntry2 = _interopRequireDefault(_TableListEntry);

var _TableListHeader = require('./TableListHeader');

var _TableListHeader2 = _interopRequireDefault(_TableListHeader);

var _ConfigurableListEntry = require('./ConfigurableListEntry');

var _ConfigurableListEntry2 = _interopRequireDefault(_ConfigurableListEntry);

var _SortColumns = require('./SortColumns');

var _SortColumns2 = _interopRequireDefault(_SortColumns);

var _ListPaginator = require('./ListPaginator');

var _ListPaginator2 = _interopRequireDefault(_ListPaginator);

var _viewsSimpleReactActionBar = require('../views/SimpleReactActionBar');

var _viewsSimpleReactActionBar2 = _interopRequireDefault(_viewsSimpleReactActionBar);

var _InlineEditor = require('./InlineEditor');

var _InlineEditor2 = _interopRequireDefault(_InlineEditor);

var _viewsEmptyStateView = require('../views/EmptyStateView');

var _viewsEmptyStateView2 = _interopRequireDefault(_viewsEmptyStateView);

var _PlaceHolders = require("./PlaceHolders");

var _PlaceHolders2 = _interopRequireDefault(_PlaceHolders);

var DOMUtils = require('pydio/util/dom');
var LangUtils = require('pydio/util/lang');
var PydioDataModel = require('pydio/model/data-model');
var PeriodicalExecuter = require('pydio/util/periodical-executer');

/**
 * Generic List component, using Infinite for cell virtualization, pagination, various
 * displays, etc... It provides many hooks for rendering cells on-demand.
 * It uses createReactClass old syntax
 */
var SimpleList = _createReactClass2['default']({
    displayName: 'SimpleList',

    propTypes: {
        infiniteSliceCount: _propTypes2['default'].number,
        filterNodes: _propTypes2['default'].func,
        customToolbar: _propTypes2['default'].object,
        tableKeys: _propTypes2['default'].object,
        autoRefresh: _propTypes2['default'].number,
        reloadAtCursor: _propTypes2['default'].bool,
        clearSelectionOnReload: _propTypes2['default'].bool,
        heightAutoWithMax: _propTypes2['default'].number,
        containerHeight: _propTypes2['default'].number,
        observeNodeReload: _propTypes2['default'].bool,
        defaultGroupBy: _propTypes2['default'].string,
        defaultGroupByLabel: _propTypes2['default'].string,

        skipParentNavigation: _propTypes2['default'].bool,
        skipInternalDataModel: _propTypes2['default'].bool,
        delayInitialLoad: _propTypes2['default'].number,

        entryEnableSelector: _propTypes2['default'].func,
        renderCustomEntry: _propTypes2['default'].func,
        entryRenderIcon: _propTypes2['default'].func,
        entryRenderActions: _propTypes2['default'].func,
        entryRenderFirstLine: _propTypes2['default'].func,
        entryRenderSecondLine: _propTypes2['default'].func,
        entryRenderThirdLine: _propTypes2['default'].func,
        entryHandleClicks: _propTypes2['default'].func,
        hideToolbar: _propTypes2['default'].bool,
        computeActionsForNode: _propTypes2['default'].bool,
        multipleActions: _propTypes2['default'].array,

        openEditor: _propTypes2['default'].func,
        openCollection: _propTypes2['default'].func,

        elementStyle: _propTypes2['default'].object,
        passScrollingStateToChildren: _propTypes2['default'].bool,
        elementHeight: _propTypes2['default'].oneOfType([_propTypes2['default'].number, _propTypes2['default'].object]).isRequired

    },

    statics: {
        HEIGHT_ONE_LINE: 50,
        HEIGHT_TWO_LINES: 73,
        CLICK_TYPE_SIMPLE: 'simple',
        CLICK_TYPE_DOUBLE: 'double',
        PARENT_FOLDER_ICON: 'mdi mdi-chevron-left'
    },

    getDefaultProps: function getDefaultProps() {
        return { infiniteSliceCount: 30, clearSelectionOnReload: true };
    },

    getMessage: function getMessage(id) {
        return _pydio2['default'].getMessages()[id] || id;
    },

    clickRow: function clickRow(gridRow, event) {
        var node = undefined;
        if (gridRow.props) {
            node = gridRow.props.data.node;
        } else {
            node = gridRow;
        }
        if (this.props.entryHandleClicks) {
            this.props.entryHandleClicks(node, SimpleList.CLICK_TYPE_SIMPLE, event);
            return;
        }
        if (node.isLeaf() && this.props.openEditor) {
            if (this.props.openEditor(node) === false) {
                return;
            }
            var uniqueSelection = new Map();
            uniqueSelection.set(node, true);
            this.setState({ selection: uniqueSelection }, this.rebuildLoadedElements);
        } else if (!node.isLeaf()) {
            if (this.props.openCollection) {
                this.props.openCollection(node);
            } else {
                this.props.dataModel.setSelectedNodes([node]);
            }
        }
    },

    doubleClickRow: function doubleClickRow(gridRow, event) {
        var node = undefined;
        if (gridRow.props) {
            node = gridRow.props.data.node;
        } else {
            node = gridRow;
        }
        if (this.props.entryHandleClicks) {
            this.props.entryHandleClicks(node, SimpleList.CLICK_TYPE_DOUBLE, event);
        }
    },

    onColumnSort: function onColumnSort(column) {
        var stateSetCallback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

        var pagination = this.props.node.getMetadata().get('paginationData');
        if (pagination && pagination.get('total') > 1 && pagination.get('remote_order')) {

            var dir = 'asc';
            if (this.props.node.getMetadata().get('paginationData').get('currentOrderDir')) {
                dir = this.props.node.getMetadata().get('paginationData').get('currentOrderDir') === 'asc' ? 'desc' : 'asc';
            }
            var orderData = new Map();
            orderData.set('order_column', column['remoteSortAttribute'] ? column.remoteSortAttribute : column.name);
            orderData.set('order_direction', dir);
            this.props.node.getMetadata().set("remote_order", orderData);
            this.props.dataModel.requireContextChange(this.props.node, true);
        } else {

            var att = column['sortAttribute'] ? column['sortAttribute'] : column.name;
            var sortingInfo = undefined;
            var _state$sortingInfo = this.state.sortingInfo;
            var attribute = _state$sortingInfo.attribute;
            var direction = _state$sortingInfo.direction;

            if (attribute === att && direction) {
                if (direction === 'asc') {
                    // Switch direction
                    sortingInfo = { attribute: att, sortType: column.sortType, direction: 'desc' };
                } else {
                    // Reset sorting
                    sortingInfo = this.props.defaultSortingInfo || {};
                }
            } else {
                sortingInfo = { attribute: att, sortType: column.sortType, direction: 'asc' };
            }
            this.setState({ sortingInfo: sortingInfo }, (function () {
                this.rebuildLoadedElements();
                if (stateSetCallback) {
                    stateSetCallback();
                }
            }).bind(this));
        }
    },

    computeSelectionFromCurrentPlusTargetNode: function computeSelectionFromCurrentPlusTargetNode(currentSelection, targetNode) {

        var currentIndexStart = undefined,
            currentIndexEnd = undefined,
            nodeBefore = false;
        if (!this.indexedElements) {
            return [];
        }
        var firstSelected = currentSelection[0];
        var lastSelected = currentSelection[currentSelection.length - 1];
        var newSelection = [];
        for (var i = 0; i < this.indexedElements.length; i++) {
            if (currentIndexStart !== undefined) {
                newSelection.push(this.indexedElements[i].node);
            }
            if (this.indexedElements[i].node === targetNode) {
                if (currentIndexStart !== undefined && currentIndexEnd === undefined) {
                    currentIndexEnd = i;
                    break;
                }
                currentIndexStart = i;
                nodeBefore = true;
                newSelection.push(this.indexedElements[i].node);
            }
            if (this.indexedElements[i].node === firstSelected && currentIndexStart === undefined) {
                currentIndexStart = i;
                newSelection.push(this.indexedElements[i].node);
            }
            if (this.indexedElements[i].node === lastSelected && nodeBefore) {
                currentIndexEnd = i;
                break;
            }
        }
        return newSelection;
    },

    onKeyDown: function onKeyDown(e) {
        var currentIndexStart = undefined,
            currentIndexEnd = undefined;
        var contextHolder = window.pydio.getContextHolder();
        var elementsPerLine = this.props.elementsPerLine || 1;
        var shiftKey = e.shiftKey;
        var key = e.key;

        if (contextHolder.isEmpty() || !this.indexedElements) {
            return;
        }
        var downKeys = ['ArrowDown', 'ArrowRight', 'PageDown', 'End'];

        var position = shiftKey && downKeys.indexOf(key) > -1 ? 'first' : 'last';
        var currentSelection = contextHolder.getSelectedNodes();

        var firstSelected = currentSelection[0];
        var lastSelected = currentSelection[currentSelection.length - 1];

        if (key === 'Enter') {
            this.doubleClickRow(firstSelected);
            return;
        }
        if (key === 'Delete' && global.pydio.Controller.fireActionByKey('key_delete')) {
            return;
        }

        for (var i = 0; i < this.indexedElements.length; i++) {
            if (this.indexedElements[i].node === firstSelected) {
                currentIndexStart = i;
            }
            if (this.indexedElements[i].node === lastSelected) {
                currentIndexEnd = i;
                break;
            }
        }
        var selectionIndex = undefined;
        var maxIndex = this.indexedElements.length - 1;
        var increment = key === 'PageDown' || key === 'PageUp' ? 10 : 1;
        if (key === 'ArrowDown' || key === 'PageDown') {
            selectionIndex = Math.min(currentIndexEnd + elementsPerLine * increment, maxIndex);
        } else if (key === 'ArrowUp' || key === 'PageUp') {
            selectionIndex = Math.max(currentIndexStart - elementsPerLine * increment, 0);
        } else if (key === 'Home') {
            selectionIndex = 0;
        } else if (key === 'End') {
            selectionIndex = maxIndex;
        }
        if (elementsPerLine > 1) {
            if (key === 'ArrowRight') {
                selectionIndex = currentIndexEnd + 1;
            } else if (key === 'ArrowLeft') {
                selectionIndex = currentIndexStart - 1;
            }
        }

        if (shiftKey && selectionIndex !== undefined) {
            var min = Math.min(currentIndexStart, currentIndexEnd, selectionIndex);
            var max = Math.max(currentIndexStart, currentIndexEnd, selectionIndex);
            if (min !== max) {
                var selection = [];
                for (var i = min; i < max + 1; i++) {
                    if (this.indexedElements[i]) selection.push(this.indexedElements[i].node);
                }
                contextHolder.setSelectedNodes(selection);
            }
        } else if (this.indexedElements[selectionIndex] && this.indexedElements[selectionIndex].node) {
            contextHolder.setSelectedNodes([this.indexedElements[selectionIndex].node]);
        }
    },

    getInitialState: function getInitialState() {
        this.actionsCache = { multiple: new Map() };
        if (!this.props.skipInternalDataModel) {
            this.dm = new PydioDataModel();
            this.dm.setRootNode(this.props.dataModel.getContextNode());
            this.dm.setContextNode(this.props.dataModel.getContextNode());
        } else {
            this.dm = this.props.dataModel;
        }
        var state = {
            loaded: this.props.node.isLoaded(),
            loading: !this.props.node.isLoaded(),
            showSelector: false,
            elements: this.props.node.isLoaded() ? this.buildElements(0, this.props.infiniteSliceCount) : [],
            containerHeight: this.props.containerHeight ? this.props.containerHeight : this.props.heightAutoWithMax ? 0 : 500,
            sortingInfo: this.props.defaultSortingInfo || null
        };
        if (this.props.elementHeight instanceof Object) {
            state.elementHeight = this.computeElementHeightResponsive();
        }
        state.infiniteLoadBeginBottomOffset = 200;
        return state;
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var _this = this;

        this.indexedElements = null;
        var currentLength = Math.max(this.state.elements.length, nextProps.infiniteSliceCount);
        this.setState({
            loaded: nextProps.node.isLoaded(),
            loading: !nextProps.node.isLoaded(),
            showSelector: false,
            elements: nextProps.node.isLoaded() ? this.buildElements(0, currentLength, nextProps.node) : [],
            infiniteLoadBeginBottomOffset: 200,
            sortingInfo: this.state.sortingInfo || nextProps.defaultSortingInfo || null
        }, function () {
            if (nextProps.node.isLoaded()) _this.updateInfiniteContainerHeight();
        });
        if (!nextProps.autoRefresh && this.refreshInterval) {
            window.clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        } else if (nextProps.autoRefresh && !this.refreshInterval) {
            this.refreshInterval = window.setInterval(this.reload, nextProps.autoRefresh);
        }
        this.patchInfiniteGrid(nextProps.elementsPerLine);
        if (this.props.node && nextProps.node !== this.props.node) {
            this.observeNodeChildren(this.props.node, true);
        }
        if (this._manualScrollPe) {
            this._manualScrollPe.stop();
            this._manualScrollPe = null;
        }
    },

    observeNodeChildren: function observeNodeChildren(node) {
        var stop = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        if (stop && !this._childrenObserver) return;

        if (!this._childrenObserver) {
            this._childrenObserver = (function () {
                this.indexedElements = null;
                this.rebuildLoadedElements();
            }).bind(this);
        }
        if (!this._childrenActionsObserver) {
            this._childrenActionsObserver = (function (eventMemo) {
                if (eventMemo.type === 'prompt-rename') {
                    this.setState({ inlineEditionForNode: eventMemo.child, inlineEditionCallback: eventMemo.callback });
                }
            }).bind(this);
        }
        if (stop) {
            node.stopObserving("child_added", this._childrenObserver);
            node.stopObserving("child_removed", this._childrenObserver);
            node.stopObserving("child_node_action", this._childrenActionsObserver);
        } else {
            node.observe("child_added", this._childrenObserver);
            node.observe("child_removed", this._childrenObserver);
            node.observe("child_node_action", this._childrenActionsObserver);
        }
    },

    _loadNodeIfNotLoaded: function _loadNodeIfNotLoaded() {
        var node = this.props.node;

        if (!node.isLoaded()) {
            node.observeOnce("loaded", (function () {
                if (!this.isMounted()) return;
                if (this.props.node === node) {
                    this.observeNodeChildren(node);
                    this.setState({
                        loaded: true,
                        loading: false,
                        elements: this.buildElements(0, this.props.infiniteSliceCount)
                    });
                }
                if (this.props.heightAutoWithMax) {
                    this.updateInfiniteContainerHeight();
                }
            }).bind(this));
            node.load();
        } else {
            this.observeNodeChildren(node);
        }
    },

    _loadingListener: function _loadingListener() {
        this.observeNodeChildren(this.props.node, true);
        this.setState({ loaded: false, loading: true });
        this.indexedElements = null;
    },

    _loadedListener: function _loadedListener() {
        var currentLength = Math.max(this.state.elements.length, this.props.infiniteSliceCount);
        this.setState({
            loading: false,
            elements: this.buildElements(0, currentLength, this.props.node)
        });
        if (this.props.heightAutoWithMax) {
            this.updateInfiniteContainerHeight();
        }
        this.observeNodeChildren(this.props.node);
    },

    reload: function reload() {
        if (this.props.reloadAtCursor && this._currentCursor) {
            this.loadStartingAtCursor();
            return;
        }
        if (this.props.clearSelectionOnReload) {
            this.props.dataModel.setSelectedNodes([]);
        }
        this._loadingListener();
        this.props.node.observeOnce("loaded", this._loadedListener);
        this.props.node.reload();
    },

    loadStartingAtCursor: function loadStartingAtCursor() {
        this._loadingListener();
        var node = this.props.node;
        var cachedChildren = node.getChildren();
        var newChildren = [];
        node.observeOnce("loaded", (function () {
            var reorderedChildren = new Map();
            newChildren.map(function (c) {
                reorderedChildren.set(c.getPath(), c);
            });
            cachedChildren.forEach(function (c) {
                reorderedChildren.set(c.getPath(), c);
            });
            node._children = reorderedChildren;
            this._loadedListener();
        }).bind(this));
        node.setLoaded(false);
        node.observe("child_added", function (newChild) {
            newChildren.push(node._children.get(newChild));
        });
        this.props.node.load(null, { cursor: this._currentCursor });
    },

    wireReloadListeners: function wireReloadListeners() {
        this.wrappedLoading = this._loadingListener;
        this.wrappedLoaded = this._loadedListener;
        this.props.node.observe("loading", this.wrappedLoading);
        this.props.node.observe("loaded", this.wrappedLoaded);
    },

    stopReloadListeners: function stopReloadListeners() {
        this.props.node.stopObserving("loading", this.wrappedLoading);
        this.props.node.stopObserving("loaded", this.wrappedLoaded);
    },

    toggleSelector: function toggleSelector() {
        // Force rebuild elements
        this.setState({
            showSelector: !this.state.showSelector,
            selection: new Map()
        }, this.rebuildLoadedElements);
    },

    toggleSelection: function toggleSelection(node) {
        var selection = this.state.selection || new Map();
        if (selection.get(node)) selection['delete'](node);else selection.set(node, true);
        if (this.refs.all_selector) this.refs.all_selector.setChecked(false);
        this.setState({
            selection: selection
        }, this.rebuildLoadedElements);
    },

    selectAll: function selectAll() {
        var _this2 = this;

        if (this.refs.all_selector && !this.refs.all_selector.isChecked()) {
            this.setState({ selection: new Map() }, this.rebuildLoadedElements);
        } else {
            (function () {
                var selection = new Map();
                _this2.props.node.getChildren().forEach((function (child) {
                    if (this.props.filterNodes && !this.props.filterNodes(child)) {
                        return;
                    }
                    if (child.isLeaf()) {
                        selection.set(child, true);
                    }
                }).bind(_this2));
                if (_this2.refs.all_selector) _this2.refs.all_selector.setChecked(true);
                _this2.setState({ selection: selection }, _this2.rebuildLoadedElements);
            })();
        }
    },

    applyMultipleAction: function applyMultipleAction(ev) {
        if (!this.state.selection || !this.state.selection.size) {
            return;
        }
        var actionName = ev.currentTarget.getAttribute('data-action');
        var dm = this.dm || new PydioDataModel();
        dm.setContextNode(this.props.node);
        var selNodes = [];
        this.state.selection.forEach(function (v, node) {
            selNodes.push(node);
        });
        dm.setSelectedNodes(selNodes);
        var a = this.props.pydio.Controller.getActionByName(actionName);
        a.fireContextChange(dm, true, this.props.pydio.user);
        a.apply([dm]);

        ev.stopPropagation();
        ev.preventDefault();
    },

    getActionsForNode: function getActionsForNode(dm, node) {
        if (!this.props.computeActionsForNode) {
            return [];
        }
        var cacheKey = node.isLeaf() ? 'file-' + node.getAjxpMime() : 'folder';
        var selectionType = node.isLeaf() ? 'file' : 'dir';
        var nodeActions = [];
        if (this.actionsCache[cacheKey]) {
            nodeActions = this.actionsCache[cacheKey];
        } else {
            dm.setSelectedNodes([node]);
            window.pydio.Controller.actions.forEach((function (a) {
                a.fireContextChange(dm, true, window.pydio.user);
                if (a.context.selection && a.context.actionBar && a.selectionContext[selectionType] && !a.deny && a.options.icon_class && (!this.props.actionBarGroups || this.props.actionBarGroups.indexOf(a.context.actionBarGroup) !== -1) && (!a.selectionContext.allowedMimes.length || a.selectionContext.allowedMimes.indexOf(node.getAjxpMime()) !== -1)) {
                    nodeActions.push(a);
                    if (node.isLeaf() && a.selectionContext.unique === false) {
                        this.actionsCache.multiple.set(a.options.name, a);
                    }
                }
            }).bind(this));
            this.actionsCache[cacheKey] = nodeActions;
        }
        return nodeActions;
    },

    updateInfiniteContainerHeight: function updateInfiniteContainerHeight() {
        var retries = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (this.props.containerHeight) {
            return this.props.containerHeight;
        }
        if (!this.refs.infiniteParent) {
            return;
        }
        var containerHeight = this.refs.infiniteParent.clientHeight;
        if (this.props.heightAutoWithMax) {
            var number = this.indexedElements ? this.indexedElements.length : this.props.node.getChildren().size;
            var elementHeight = this.state.elementHeight ? this.state.elementHeight : this.props.elementHeight;
            containerHeight = Math.min(number * elementHeight, this.props.heightAutoWithMax);
        }
        if (!containerHeight && !retries) {
            global.setTimeout((function () {
                this.updateInfiniteContainerHeight(true);
            }).bind(this), 50);
        }
        this.setState({ containerHeight: containerHeight });
    },

    computeElementHeightResponsive: function computeElementHeightResponsive() {
        var breaks = this.props.elementHeight;
        if (!(breaks instanceof Object)) {
            breaks = {
                "min-width:480px": this.props.elementHeight,
                "max-width:480px": Object.keys(this.props.tableKeys).length * 24 + 33
            };
        }
        if (window.matchMedia) {
            for (var k in breaks) {
                if (breaks.hasOwnProperty(k) && window.matchMedia('(' + k + ')').matches) {
                    return breaks[k];
                }
            }
        } else {
            var width = DOMUtils.getViewportWidth();
            if (width < 480) return breaks["max-width:480px"];else return breaks["max-width:480px"];
        }
        return 50;
    },

    updateElementHeightResponsive: function updateElementHeightResponsive() {
        var newH = this.computeElementHeightResponsive();
        if (!this.state || !this.state.elementHeight || this.state.elementHeight != newH) {
            this.setState({ elementHeight: newH }, (function () {
                if (this.props.heightAutoWithMax) {
                    this.updateInfiniteContainerHeight();
                }
            }).bind(this));
        }
    },

    patchInfiniteGrid: function patchInfiniteGrid(els) {
        if (this.refs.infinite && els > 1) {
            this.refs.infinite.state.infiniteComputer.__proto__.getDisplayIndexStart = function (windowTop) {
                return els * Math.floor(windowTop / this.heightData / els);
            };
            this.refs.infinite.state.infiniteComputer.__proto__.getDisplayIndexEnd = function (windowBottom) {
                return els * Math.ceil(windowBottom / this.heightData / els);
            };
        }
    },

    componentDidMount: function componentDidMount() {
        var _this3 = this;

        if (this.props.delayInitialLoad) {
            setTimeout(function () {
                _this3._loadNodeIfNotLoaded();
            }, this.props.delayInitialLoad);
        } else {
            this._loadNodeIfNotLoaded();
        }
        this.patchInfiniteGrid(this.props.elementsPerLine);
        if (this.refs.infiniteParent) {
            this.updateInfiniteContainerHeight();
            if (!this.props.heightAutoWithMax && !this.props.externalResize) {
                if (window.addEventListener) {
                    window.addEventListener('resize', this.updateInfiniteContainerHeight);
                } else {
                    window.attachEvent('onresize', this.updateInfiniteContainerHeight);
                }
            }
        }
        if (this.props.autoRefresh) {
            this.refreshInterval = window.setInterval(this.reload, this.props.autoRefresh);
        }
        if (this.props.observeNodeReload) {
            this.wireReloadListeners();
        }
        if (this.props.elementHeight instanceof Object || this.props.tableKeys) {
            if (window.addEventListener) {
                window.addEventListener('resize', this.updateElementHeightResponsive);
            } else {
                window.attachEvent('onresize', this.updateElementHeightResponsive);
            }
            this.updateElementHeightResponsive();
        }
        this.props.dataModel.observe('root_node_changed', function (rootNode) {
            _this3.rootNodeChangedFlag = true;
        });
        this.props.dataModel.observe('selection_changed', (function () {
            var _this4 = this;

            if (!this.isMounted()) return;
            var selection = new Map();
            var selectedNodes = this.props.dataModel.getSelectedNodes();
            selectedNodes.map(function (n) {
                selection.set(n, true);
            });
            this.setState({ selection: selection }, function () {
                _this4.rebuildLoadedElements();
                if (selectedNodes.length === 1) {
                    _this4.scrollToView(selectedNodes[0]);
                }
            });
        }).bind(this));
    },

    componentWillUnmount: function componentWillUnmount() {
        if (!this.props.heightAutoWithMax) {
            if (window.removeEventListener) {
                window.removeEventListener('resize', this.updateInfiniteContainerHeight);
            } else {
                window.detachEvent('onresize', this.updateInfiniteContainerHeight);
            }
        }
        if (this.props.elementHeight instanceof Object || this.props.tableKeys) {
            if (window.removeEventListener) {
                window.removeEventListener('resize', this.updateElementHeightResponsive);
            } else {
                window.detachEvent('resize', this.updateElementHeightResponsive);
            }
        }
        if (this.refreshInterval) {
            window.clearInterval(this.refreshInterval);
        }
        if (this.props.observeNodeReload) {
            this.stopReloadListeners();
        }
        if (this.props.node) {
            this.observeNodeChildren(this.props.node, true);
        }
    },

    componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
        if (!this.rootNodeChangedFlag && prevProps.node && this.props.node && prevProps.node.getPath() === this.props.node.getPath()) {
            return;
        }
        this._loadNodeIfNotLoaded();
        this.rootNodeChangedFlag = false;
    },

    onScroll: function onScroll(scrollTop) {

        if (!this.props.passScrollingStateToChildren) {
            return;
        }
        // Maintains a series of timeouts to set this.state.isScrolling
        // to be true when the element is scrolling.

        if (this.state.scrollTimeout) {
            clearTimeout(this.state.scrollTimeout);
        }

        var that = this,
            scrollTimeout = setTimeout(function () {
            that.setState({
                isScrolling: false,
                scrollTimeout: undefined
            });
        }, 150);

        this.setState({
            isScrolling: true,
            scrollTimeout: scrollTimeout
        });
    },

    scrollToLast: function scrollToLast() {
        if (this.indexedElements && this.indexedElements[this.indexedElements.length - 1].node) {
            this.scrollToView(this.indexedElements[this.indexedElements.length - 1].node);
        }
    },

    scrollToView: function scrollToView(node) {
        var _this5 = this;

        if (!this.indexedElements || !this.refs.infinite || !this.refs.infinite.scrollable) return;
        var scrollable = this.refs.infinite.scrollable;
        var visibleFrame = {
            top: scrollable.scrollTop + this.props.elementHeight / 2,
            bottom: scrollable.scrollTop + this.state.containerHeight - this.props.elementHeight / 2
        };
        var realMaxScrollTop = this.indexedElements.length * this.props.elementHeight - this.state.containerHeight;

        var position = -1;
        this.indexedElements.forEach(function (e, k) {
            if (e.node && e.node === node) position = k;
        });
        if (position === -1) return;
        var elementHeight = this.props.elementHeight;
        var scrollTarget = position * elementHeight;

        if (scrollTarget > visibleFrame.top && scrollTarget < visibleFrame.bottom) {
            // already visible;
            return;
        } else if (scrollTarget >= visibleFrame.bottom) {
            scrollTarget -= this.state.containerHeight - elementHeight * 2;
        }
        scrollTarget = Math.min(scrollTarget, realMaxScrollTop);
        scrollable.scrollTop = scrollTarget;
        if (this._manualScrollPe) this._manualScrollPe.stop();
        if (scrollable.scrollHeight < scrollTarget) {
            this._manualScrollPe = new PeriodicalExecuter(function () {
                scrollable.scrollTop = scrollTarget;
                if (scrollable.scrollHeight >= scrollTarget) {
                    _this5._manualScrollPe.stop();
                    _this5._manualScrollPe = null;
                }
            }, .25);
        }
    },

    buildElementsFromNodeEntries: function buildElementsFromNodeEntries(nodeEntries, showSelector) {

        var components = [],
            index = 0;
        var nodeEntriesLength = nodeEntries.length;
        nodeEntries.forEach((function (entry) {
            var data = undefined;
            if (entry.parent) {
                data = {
                    node: entry.node,
                    key: entry.node.getPath(),
                    id: entry.node.getPath(),
                    mainIcon: SimpleList.PARENT_FOLDER_ICON,
                    firstLine: "..",
                    className: "list-parent-node",
                    secondLine: this.getMessage('react.1'),
                    onClick: this.clickRow.bind(this),
                    onDoubleClick: this.doubleClickRow.bind(this),
                    showSelector: false,
                    selectorDisabled: true,
                    noHover: false
                };
                if (this.props.entryRenderParentIcon && !this.props.tableKeys) {
                    data['iconCell'] = this.props.entryRenderParentIcon(entry.node, entry);
                } else {
                    data['mainIcon'] = SimpleList.PARENT_FOLDER_ICON;
                }
                if (this.props.elementStyle) {
                    data['style'] = this.props.elementStyle;
                }
                if (this.props.passScrollingStateToChildren) {
                    data['parentIsScrolling'] = this.state.isScrolling;
                }
                components.push(_react2['default'].createElement(_ListEntry.ListEntry, data));
            } else if (entry.groupHeader) {
                var id = entry.groupHeader,
                    firstLine = entry.groupHeaderLabel;
                if (this.props.entryRenderGroupHeader) {
                    firstLine = this.props.entryRenderGroupHeader(id, firstLine);
                }
                data = {
                    node: null,
                    key: entry.groupHeader,
                    id: id,
                    mainIcon: null,
                    firstLine: firstLine,
                    className: 'list-group-header',
                    onClick: null,
                    showSelector: false,
                    selectorDisabled: true,
                    noHover: true
                };
                if (this.props.passScrollingStateToChildren) {
                    data['parentIsScrolling'] = this.state.isScrolling;
                }
                components.push(_react2['default'].createElement(_ListEntry.ListEntry, data));
            } else {
                data = {
                    node: entry.node,
                    onClick: this.clickRow.bind(this),
                    onDoubleClick: this.doubleClickRow.bind(this),
                    onSelect: this.toggleSelection.bind(this),
                    key: entry.node.getPath(),
                    id: entry.node.getPath(),
                    renderIcon: this.props.entryRenderIcon,
                    renderFirstLine: this.props.entryRenderFirstLine,
                    renderSecondLine: this.props.entryRenderSecondLine,
                    renderThirdLine: this.props.entryRenderThirdLine,
                    renderActions: this.props.entryRenderActions,
                    showSelector: showSelector,
                    selected: this.state && this.state.selection ? this.state.selection.get(entry.node) : false,
                    actions: _react2['default'].createElement(_viewsSimpleReactActionBar2['default'], { node: entry.node, actions: entry.actions, dataModel: this.dm }),
                    selectorDisabled: !(this.props.entryEnableSelector ? this.props.entryEnableSelector(entry.node) : entry.node.isLeaf())
                };
                data['isFirst'] = index === 0;
                data['isLast'] = index === nodeEntriesLength - 1;
                index++;
                if (this.props.elementStyle) {
                    data['style'] = this.props.elementStyle;
                }
                if (this.props.passScrollingStateToChildren) {
                    data['parentIsScrolling'] = this.state.isScrolling;
                }
                if (this.props.renderCustomEntry) {

                    components.push(this.props.renderCustomEntry(data));
                } else if (this.props.tableKeys) {

                    if (this.props.defaultGroupBy) {
                        data['tableKeys'] = LangUtils.deepCopy(this.props.tableKeys);
                        delete data['tableKeys'][this.props.defaultGroupBy];
                    } else {
                        data['tableKeys'] = this.props.tableKeys;
                    }
                    components.push(_react2['default'].createElement(_TableListEntry2['default'], data));
                } else {

                    components.push(_react2['default'].createElement(_ConfigurableListEntry2['default'], data));
                }
            }
        }).bind(this));

        return components;
    },

    buildElements: function buildElements(start, end, node) {
        var _this6 = this;

        var theNode = node || this.props.node;

        if (!this.indexedElements || this.indexedElements.length !== theNode.getChildren().size) {
            (function () {
                _this6.indexedElements = [];
                var groupBy = undefined,
                    groupByLabel = undefined,
                    groups = undefined,
                    groupKeys = undefined,
                    groupLabels = undefined;
                if (_this6.props.defaultGroupBy) {
                    groupBy = _this6.props.defaultGroupBy;
                    groupByLabel = _this6.props.groupByLabel || false;
                    groups = {};groupKeys = [];groupLabels = {};
                }

                if (!_this6.props.skipParentNavigation && theNode.getParent() && (_this6.props.dataModel.getContextNode() !== theNode || _this6.props.skipInternalDataModel)) {
                    _this6.indexedElements.push({ node: theNode.getParent(), parent: true, actions: null });
                }

                theNode.getChildren().forEach((function (child) {
                    if (child.getMetadata().has('cursor')) {
                        var childCursor = parseInt(child.getMetadata().get('cursor'));
                        this._currentCursor = Math.max(this._currentCursor ? this._currentCursor : 0, childCursor);
                    }
                    if (this.props.filterNodes && !this.props.filterNodes(child)) {
                        return;
                    }
                    var nodeActions = this.getActionsForNode(this.dm, child);
                    if (groupBy) {
                        var groupValue = child.getMetadata().get(groupBy) || 'N/A';
                        if (!groups[groupValue]) {
                            groups[groupValue] = [];
                            groupKeys.push(groupValue);
                        }
                        if (groupByLabel && child.getMetadata().has(groupByLabel) && !groupLabels[groupValue]) {
                            groupLabels[groupValue] = child.getMetadata().get(groupByLabel);
                        }
                        groups[groupValue].push({ node: child, parent: false, actions: nodeActions });
                    } else {
                        this.indexedElements.push({ node: child, parent: false, actions: nodeActions });
                    }
                }).bind(_this6));

                if (groupBy) {
                    groupKeys = groupKeys.sort();
                    groupKeys.map((function (k) {
                        var label = k;
                        if (groupLabels[k]) {
                            label = groupLabels[k];
                        } else if (this.props.renderGroupLabels) {
                            label = this.props.renderGroupLabels(groupBy, k);
                        }
                        this.indexedElements.push({
                            node: null,
                            groupHeader: k,
                            groupHeaderLabel: label,
                            parent: false,
                            actions: null
                        });
                        this.indexedElements = this.indexedElements.concat(groups[k]);
                    }).bind(_this6));
                }
            })();
        }

        if (this.state && this.state.sortingInfo && !this.remoteSortingInfo()) {
            (function () {
                var _state$sortingInfo2 = _this6.state.sortingInfo;
                var attribute = _state$sortingInfo2.attribute;
                var direction = _state$sortingInfo2.direction;
                var sortType = _state$sortingInfo2.sortType;

                var sortFunction = undefined;
                if (sortType === 'file-natural') {
                    sortFunction = function (a, b) {
                        if (a.parent) {
                            return -1;
                        }
                        if (b.parent) {
                            return 1;
                        }
                        var nodeA = a.node;
                        var nodeB = b.node;
                        // Recycle always last
                        if (nodeA.isRecycle()) return 1;
                        if (nodeB.isRecycle()) return -1;
                        // Folders first
                        var aLeaf = nodeA.isLeaf();
                        var bLeaf = nodeB.isLeaf();
                        var res = aLeaf && !bLeaf ? 1 : !aLeaf && bLeaf ? -1 : 0;
                        if (res !== 0) {
                            return res;
                        } else {
                            return nodeA.getLabel().localeCompare(nodeB.getLabel(), undefined, { numeric: true });
                        }
                    };
                } else {
                    sortFunction = function (a, b) {
                        if (a.parent) {
                            return -1;
                        }
                        if (b.parent) {
                            return 1;
                        }
                        var res = undefined;
                        if (sortType === 'number') {
                            var aMeta = a.node.getMetadata().get(attribute) || 0;
                            var bMeta = b.node.getMetadata().get(attribute) || 0;
                            aMeta = parseFloat(aMeta);
                            bMeta = parseFloat(bMeta);
                            res = direction === 'asc' ? aMeta - bMeta : bMeta - aMeta;
                        } else if (sortType === 'string') {
                            var aMeta = a.node.getMetadata().get(attribute) || "";
                            var bMeta = b.node.getMetadata().get(attribute) || "";
                            res = direction === 'asc' ? aMeta.localeCompare(bMeta) : bMeta.localeCompare(aMeta);
                        }
                        if (res === 0) {
                            // Resort by label to make it stable
                            var labComp = a.node.getLabel().localeCompare(b.node.getLabel(), undefined, { numeric: true });
                            res = direction === 'asc' ? labComp : -labComp;
                        }
                        return res;
                    };
                }
                _this6.indexedElements.sort(sortFunction);
            })();
        }

        if (this.props.elementPerLine > 1) {
            end = end * this.props.elementPerLine;
            start = start * this.props.elementPerLine;
        }
        return this.indexedElements.slice(start, end);
    },

    rebuildLoadedElements: function rebuildLoadedElements() {
        var newElements = this.buildElements(0, Math.max(this.state.elements.length, this.props.infiniteSliceCount));
        var infiniteLoadBeginBottomOffset = newElements.length ? 200 : 0;
        this.setState({
            elements: newElements,
            infiniteLoadBeginBottomOffset: infiniteLoadBeginBottomOffset
        });
        this.updateInfiniteContainerHeight();
    },

    handleInfiniteLoad: function handleInfiniteLoad() {
        var elemLength = this.state.elements.length;
        var newElements = this.buildElements(elemLength, elemLength + this.props.infiniteSliceCount);
        var infiniteLoadBeginBottomOffset = newElements.length ? 200 : 0;
        this.setState({
            isInfiniteLoading: false,
            elements: this.state.elements.concat(newElements),
            infiniteLoadBeginBottomOffset: infiniteLoadBeginBottomOffset
        });
    },

    /**
     * Extract remote sorting info from current node metadata
     */
    remoteSortingInfo: function remoteSortingInfo() {
        var meta = this.props.node.getMetadata().get('paginationData');
        if (meta && meta.get('total') > 1 && meta.has('remote_order')) {
            var col = meta.get('currentOrderCol');
            var dir = meta.get('currentOrderDir');
            if (col && dir) {
                return {
                    remote: true,
                    attribute: col,
                    direction: dir
                };
            }
        }
        return null;
    },

    renderToolbar: function renderToolbar() {
        var _this7 = this;

        var hiddenMode = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (hiddenMode) {
            if (this.props.sortKeys) {
                var sortingInfo = undefined,
                    remoteSortingInfo = this.remoteSortingInfo();
                if (remoteSortingInfo) {
                    sortingInfo = remoteSortingInfo;
                } else {
                    sortingInfo = this.state ? this.state.sortingInfo : null;
                }
                return _react2['default'].createElement(_SortColumns2['default'], { displayMode: 'hidden', tableKeys: this.props.sortKeys, columnClicked: this.onColumnSort, sortingInfo: sortingInfo });
            }
            return null;
        }

        var rightButtons = [_react2['default'].createElement(_materialUi.FontIcon, {
            key: 1,
            tooltip: 'Reload',
            className: "mdi mdi-reload" + (this.state.loading ? " rotating" : ""),
            onClick: this.reload
        })];
        var i = 2;
        if (this.props.sortKeys) {

            var sortingInfo = undefined,
                remoteSortingInfo = this.remoteSortingInfo();
            if (remoteSortingInfo) {
                sortingInfo = remoteSortingInfo;
            } else {
                sortingInfo = this.state ? this.state.sortingInfo : null;
            }
            rightButtons.push(_react2['default'].createElement(_SortColumns2['default'], {
                key: i,
                displayMode: 'menu',
                tableKeys: this.props.sortKeys,
                columnClicked: this.onColumnSort,
                sortingInfo: sortingInfo
            }));
            i++;
        }
        if (this.props.additionalActions) {
            rightButtons.push(this.props.additionalActions);
        }

        var leftToolbar = undefined,
            paginator = undefined;
        if (this.props.node.getMetadata().get("paginationData") && this.props.node.getMetadata().get("paginationData").get('total') > 1) {
            paginator = _react2['default'].createElement(_ListPaginator2['default'], { dataModel: this.dm, node: this.props.node });
        }

        if (this.props.listTitle) {
            leftToolbar = _react2['default'].createElement(
                _materialUi.ToolbarGroup,
                { key: 0, float: 'left' },
                _react2['default'].createElement(
                    'div',
                    { className: 'list-title' },
                    this.props.listTitle
                )
            );
        }

        if (this.props.searchResultData) {

            leftToolbar = _react2['default'].createElement(
                _materialUi.ToolbarGroup,
                { key: 0, float: 'left' },
                _react2['default'].createElement(
                    'div',
                    { style: { fontSize: 12, fontWeight: 500, color: '#9e9e9e' } },
                    this.getMessage('react.3').replace('%s', this.props.searchResultData.term)
                )
            );
            rightButtons = _react2['default'].createElement(_materialUi.RaisedButton, { key: 1, label: this.getMessage('react.4'), primary: true, onClick: this.props.searchResultData.toggleState, style: { marginRight: -10 } });
        } else if (this.actionsCache.multiple.size || this.props.multipleActions) {
            var bulkLabel = this.getMessage('react.2');
            var hiddenStyle = {
                transform: 'translateX(-80px)'
            };
            var cbStyle = _extends({ width: 24 }, hiddenStyle);
            var buttonStyle = _extends({}, hiddenStyle);
            if (this.state.showSelector) {
                cbStyle = { width: 24, transform: 'translateX(-12px)' };
                buttonStyle = { transform: 'translateX(-40px)' };
            }
            if (this.state.selection && this.state.showSelector) {
                bulkLabel += " (" + this.state.selection.size + ")";
            }
            leftToolbar = _react2['default'].createElement(
                _materialUi.ToolbarGroup,
                { key: 0, float: 'left', className: 'hide-on-vertical-layout' },
                _react2['default'].createElement(_materialUi.Checkbox, { ref: 'all_selector', onClick: this.selectAll, style: cbStyle }),
                _react2['default'].createElement(_materialUi.FlatButton, { label: bulkLabel, onClick: this.toggleSelector, style: buttonStyle })
            );

            if (this.state.showSelector) {
                (function () {
                    rightButtons = [];
                    var index = 0;
                    var actions = _this7.props.multipleActions || _this7.actionsCache.multiple;
                    actions.forEach((function (a) {
                        rightButtons.push(_react2['default'].createElement(_materialUi.RaisedButton, {
                            key: index,
                            label: a.options.text,
                            'data-action': a.options.name,
                            onClick: this.applyMultipleAction,
                            primary: true }));
                    }).bind(_this7));
                    rightButtons = _react2['default'].createElement(
                        'span',
                        null,
                        rightButtons
                    );
                })();
            }
        }

        return _react2['default'].createElement(
            _materialUi.Toolbar,
            { style: this.props.toolbarStyle },
            leftToolbar,
            _react2['default'].createElement(
                _materialUi.ToolbarGroup,
                { key: 1, float: 'right' },
                paginator,
                rightButtons
            )
        );
    },

    render: function render() {
        var _this8 = this;

        var containerClasses = "material-list vertical-layout layout-fill";
        if (this.props.className) {
            containerClasses += " " + this.props.className;
        }
        if (this.state.showSelector) {
            containerClasses += " list-show-selectors";
        }
        if (this.props.tableKeys) {
            containerClasses += " table-mode";
        }
        var toolbar = undefined;
        var hiddenToolbar = undefined;
        if (this.props.tableKeys) {
            var tableKeys = undefined;
            if (this.props.defaultGroupBy) {
                tableKeys = LangUtils.deepCopy(this.props.tableKeys);
                delete tableKeys[this.props.defaultGroupBy];
            } else {
                tableKeys = this.props.tableKeys;
            }
            var sortingInfo = undefined,
                remoteSortingInfo = this.remoteSortingInfo();
            if (remoteSortingInfo) {
                sortingInfo = remoteSortingInfo;
            } else {
                sortingInfo = this.state ? this.state.sortingInfo : null;
            }
            toolbar = _react2['default'].createElement(_TableListHeader2['default'], {
                tableKeys: tableKeys,
                loading: this.state.loading,
                reload: this.reload,
                ref: 'loading_indicator',
                dm: this.props.dataModel,
                node: this.props.node,
                additionalActions: this.props.additionalActions,
                onHeaderClick: this.onColumnSort,
                sortingInfo: sortingInfo
            });
        } else {
            toolbar = this.props.customToolbar ? this.props.customToolbar : !this.props.hideToolbar ? this.renderToolbar() : null;
            if (this.props.hideToolbar || this.props.customToolbar) {
                hiddenToolbar = this.renderToolbar(true);
            }
        }

        var inlineEditor = undefined;
        if (this.state.inlineEditionForNode) {
            inlineEditor = _react2['default'].createElement(_InlineEditor2['default'], {
                detached: true,
                node: this.state.inlineEditionForNode,
                callback: this.state.inlineEditionCallback,
                onClose: function () {
                    _this8.setState({ inlineEditionForNode: null });
                }
            });
        }

        var emptyState = undefined;
        var _props = this.props;
        var emptyStateProps = _props.emptyStateProps;
        var node = _props.node;

        if (emptyStateProps && this.props.node.isLoaded() && !this.props.node.isLoading() && (!this.state.elements.length || this.state.elements.length === 1 && this.state.elements[0].parent)) {

            var actionProps = {};
            if (this.state.elements.length === 1 && this.state.elements[0].parent) {
                (function () {
                    var parentNode = _this8.state.elements[0].node;
                    actionProps = {
                        actionLabelId: 'react.1',
                        actionIconClassName: SimpleList.PARENT_FOLDER_ICON,
                        actionCallback: function actionCallback(e) {
                            if (_this8.props.entryHandleClicks) {
                                _this8.props.entryHandleClicks(parentNode, SimpleList.CLICK_TYPE_DOUBLE, e);
                            }
                        }
                    };
                })();
            }
            emptyState = _react2['default'].createElement(_viewsEmptyStateView2['default'], _extends({}, emptyStateProps, actionProps));
        } else if (emptyStateProps && emptyStateProps.checkEmptyState && emptyStateProps.checkEmptyState(this.props.node)) {

            emptyState = _react2['default'].createElement(_viewsEmptyStateView2['default'], emptyStateProps);
        }

        var elements = this.buildElementsFromNodeEntries(this.state.elements, this.state.showSelector);

        var _props2 = this.props;
        var verticalScroller = _props2.verticalScroller;
        var heightAutoWithMax = _props2.heightAutoWithMax;
        var usePlaceHolder = _props2.usePlaceHolder;

        var content = elements;
        if (!elements.length && usePlaceHolder) {
            content = _react2['default'].createElement(_PlaceHolders2['default'], this.props);
        }
        if (emptyState) {

            content = emptyState;
        } else if (verticalScroller) {

            content = _react2['default'].createElement(
                _reactScrollbar2['default'],
                {
                    speed: 0.8,
                    horizontalScroll: false,
                    style: { height: this.state.containerHeight },
                    verticalScrollbarStyle: { borderRadius: 10, width: 6 },
                    verticalContainerStyle: { width: 8 }
                },
                _react2['default'].createElement(
                    'div',
                    null,
                    content
                )
            );
        } else {

            content = _react2['default'].createElement(
                _reactInfinite2['default'],
                {
                    elementHeight: this.state.elementHeight ? this.state.elementHeight : this.props.elementHeight,
                    containerHeight: this.state.containerHeight ? this.state.containerHeight : 1,
                    infiniteLoadBeginEdgeOffset: this.state.infiniteLoadBeginBottomOffset,
                    onInfiniteLoad: this.handleInfiniteLoad,
                    handleScroll: this.onScroll,
                    ref: 'infinite'
                },
                content
            );
        }

        return _react2['default'].createElement(
            'div',
            { className: containerClasses, tabIndex: '0', onKeyDown: this.onKeyDown, style: this.props.style },
            toolbar,
            hiddenToolbar,
            inlineEditor,
            _react2['default'].createElement(
                'div',
                { className: heightAutoWithMax ? "infinite-parent-smooth-height" : emptyState ? "layout-fill vertical_layout" : "layout-fill", ref: 'infiniteParent' },
                content
            )
        );
    }
});

exports['default'] = SimpleList;
module.exports = exports['default'];
