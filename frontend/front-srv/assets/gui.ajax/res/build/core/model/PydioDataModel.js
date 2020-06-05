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

var _langObservable = require('../lang/Observable');

var _langObservable2 = _interopRequireDefault(_langObservable);

var _langLogger = require('../lang/Logger');

var _langLogger2 = _interopRequireDefault(_langLogger);

var _AjxpNode = require('./AjxpNode');

var _AjxpNode2 = _interopRequireDefault(_AjxpNode);

var _utilLangUtils = require('../util/LangUtils');

var _utilLangUtils2 = _interopRequireDefault(_utilLangUtils);

var _utilPathUtils = require('../util/PathUtils');

var _utilPathUtils2 = _interopRequireDefault(_utilPathUtils);

var _httpPydioApi = require('../http/PydioApi');

var _httpPydioApi2 = _interopRequireDefault(_httpPydioApi);

var _modelMetaNodeProvider = require('../model/MetaNodeProvider');

var _modelMetaNodeProvider2 = _interopRequireDefault(_modelMetaNodeProvider);

/**
 * Full container of the data tree. Contains the SelectionModel as well.
 */

var PydioDataModel = (function (_Observable) {
	_inherits(PydioDataModel, _Observable);

	/**
  * Constructor
     * > Warning, events are now LOCAL by default
  */

	function PydioDataModel() {
		var localEvents = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

		_classCallCheck(this, PydioDataModel);

		_Observable.call(this);
		this._currentRep = '/';
		this._selectedNodes = [];
		this._bEmpty = true;
		this._globalEvents = !localEvents;

		this._bFile = false;
		this._bDir = false;
		this._isRecycle = false;

		this._pendingSelection = null;
		this._selectionSource = {};

		this._rootNode = null;
	}

	PydioDataModel.RemoteDataModelFactory = function RemoteDataModelFactory(providerProperties) {
		var rootLabel = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

		var dataModel = new PydioDataModel(true);
		var rNodeProvider = new _modelMetaNodeProvider2['default'](providerProperties);
		dataModel.setAjxpNodeProvider(rNodeProvider);
		var rootNode = new _AjxpNode2['default']("/", false, rootLabel, '', rNodeProvider);
		dataModel.setRootNode(rootNode);
		return dataModel;
	};

	/**
  * Sets the data source that will feed the nodes with children.
  * @param iAjxpNodeProvider IAjxpNodeProvider
  */

	PydioDataModel.prototype.setAjxpNodeProvider = function setAjxpNodeProvider(iAjxpNodeProvider) {
		this._iAjxpNodeProvider = iAjxpNodeProvider;
	};

	/**
  * Return the current data source provider
  * @return IAjxpNodeProvider
  */

	PydioDataModel.prototype.getAjxpNodeProvider = function getAjxpNodeProvider() {
		return this._iAjxpNodeProvider;
	};

	/**
  * Changes the current context node.
  * @param ajxpNode AjxpNode Target node, either an existing one or a fake one containing the target part.
  * @param forceReload Boolean If set to true, the node will be reloaded even if already loaded.
  */

	PydioDataModel.prototype.requireContextChange = function requireContextChange(ajxpNode) {
		var _this = this,
		    _arguments = arguments;

		var forceReload = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		if (ajxpNode === null) return;
		this.setSelectedNodes([]);
		var path = ajxpNode.getPath();
		if ((path === "" || path === "/") && ajxpNode !== this._rootNode) {
			ajxpNode = this._rootNode;
		}
		var paginationPage = null;
		if (ajxpNode.getMetadata().has('paginationData') && ajxpNode.getMetadata().get('paginationData').has('new_page') && ajxpNode.getMetadata().get('paginationData').get('new_page') !== ajxpNode.getMetadata().get('paginationData').get('current')) {
			paginationPage = ajxpNode.getMetadata().get('paginationData').get('new_page');
			forceReload = true;
		}
		if (ajxpNode !== this._rootNode && (!ajxpNode.getParent() || ajxpNode.fake)) {
			// Find in arbo or build fake arbo
			var fakeNodes = [];
			ajxpNode = ajxpNode.findInArbo(this._rootNode, fakeNodes);
			if (fakeNodes.length) {
				var _ret = (function () {
					var firstFake = fakeNodes.shift();
					firstFake.observeOnce("first_load", function (e) {
						_this.requireContextChange(ajxpNode);
					});
					firstFake.observeOnce("error", function (message) {
						_langLogger2['default'].error(message);
						firstFake.notify("node_removed");
						var parent = firstFake.getParent();
						parent.removeChild(firstFake);
						//delete(firstFake);
						_this.requireContextChange(parent);
					});
					_this.publish("context_loading");
					firstFake.load(_this._iAjxpNodeProvider);
					return {
						v: undefined
					};
				})();

				if (typeof _ret === 'object') return _ret.v;
			}
		}
		ajxpNode.observeOnce("loaded", function () {
			_this.setContextNode(ajxpNode, true);
			_this.publish("context_loaded");
			if (_this.getPendingSelection()) {
				var selPath = ajxpNode.getPath() + (ajxpNode.getPath() === "/" ? "" : "/") + _this.getPendingSelection();
				var selNode = ajxpNode.findChildByPath(selPath);
				if (selNode) {
					_this.setSelectedNodes([selNode], _this);
				} else if (ajxpNode.getMetadata().get("paginationData") && _arguments.length < 3) {
					_this.loadPathInfoSync(selPath, function (foundNode) {
						ajxpNode.addChild(foundNode);
						_this.setSelectedNodes([foundNode], _this);
					});
				}
				_this.clearPendingSelection();
			}
		});
		ajxpNode.observeOnce("error", function (message) {
			_langLogger2['default'].error(message);
			_this.publish("context_loaded");
		});
		this.publish("context_loading");
		try {
			if (forceReload) {
				if (paginationPage) {
					ajxpNode.getMetadata().get('paginationData').set('current', paginationPage);
				}
				ajxpNode.reload(this._iAjxpNodeProvider, true);
			} else {
				ajxpNode.load(this._iAjxpNodeProvider);
			}
		} catch (e) {
			this.publish("context_loaded");
		}
	};

	PydioDataModel.prototype.requireNodeReload = function requireNodeReload(nodeOrPath, completeCallback) {
		if (nodeOrPath instanceof String) {
			nodeOrPath = new _AjxpNode2['default'](nodeOrPath);
		}
		var onComplete = null;
		if (this._selectedNodes.length) {
			var found = -1;
			this._selectedNodes.map(function (node, key) {
				if (node.getPath() === nodeOrPath.getPath()) found = key;
			});
			if (found !== -1) {
				// MAKE SURE SELECTION IS OK AFTER RELOAD
				this._selectedNodes = _utilLangUtils2['default'].arrayWithout(this._selectedNodes, found);
				this.publish("selection_changed", this);
				onComplete = (function (newNode) {
					this._selectedNodes.push(newNode);
					this._selectionSource = {};
					this.publish("selection_changed", this);
					if (completeCallback) completeCallback(newNode);
				}).bind(this);
			}
		}
		this._iAjxpNodeProvider.refreshNodeAndReplace(nodeOrPath, onComplete);
	};

	PydioDataModel.prototype.loadPathInfoSync = function loadPathInfoSync(path, callback) {
		var additionalParameters = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

		this._iAjxpNodeProvider.loadLeafNodeSync(new _AjxpNode2['default'](path), callback, false, additionalParameters);
	};

	PydioDataModel.prototype.loadPathInfoAsync = function loadPathInfoAsync(path, callback) {
		this._iAjxpNodeProvider.loadLeafNodeSync(new _AjxpNode2['default'](path), callback, true);
	};

	/**
  * Sets the root of the data store
  * @param ajxpRootNode AjxpNode The parent node
  */

	PydioDataModel.prototype.setRootNode = function setRootNode(ajxpRootNode) {
		this._rootNode = ajxpRootNode;
		this._rootNode.setRoot();
		this._rootNode.observe("child_added", function (c) {
			//console.log(c);
		});
		this.publish("root_node_changed", this._rootNode);
		this.setContextNode(this._rootNode);
	};

	/**
  * Gets the current root node
  * @returns AjxpNode
  */

	PydioDataModel.prototype.getRootNode = function getRootNode() {
		return this._rootNode;
	};

	/**
  * Sets the current context node
  * @param ajxpDataNode AjxpNode
  * @param forceEvent Boolean If set to true, event will be triggered even if the current node is already the same.
  */

	PydioDataModel.prototype.setContextNode = function setContextNode(ajxpDataNode, forceEvent) {
		if (this._contextNode && this._contextNode == ajxpDataNode && this._currentRep == ajxpDataNode.getPath() && !forceEvent) {
			return; // No changes
		}
		if (!ajxpDataNode) return;
		if (this._contextNodeReplacedObserver && this._contextNode) {
			this._contextNode.stopObserving("node_replaced", this._contextNodeReplacedObserver);
		}
		this._contextNode = ajxpDataNode;
		this._currentRep = ajxpDataNode.getPath();
		this.publish("context_changed", ajxpDataNode);
		if (!this._contextNodeReplacedObserver) this._contextNodeReplacedObserver = this.contextNodeReplaced.bind(this);
		ajxpDataNode.observe("node_replaced", this._contextNodeReplacedObserver);
	};

	PydioDataModel.prototype.contextNodeReplaced = function contextNodeReplaced(newNode) {
		this.setContextNode(newNode, true);
	};

	/**
  *
  */

	PydioDataModel.prototype.publish = function publish(eventName, optionalData) {
		var args = [];
		if (this._globalEvents) {
			if (window.pydio) {
				args.push(eventName);
				if (optionalData) args.push(optionalData);
				window.pydio.fire.apply(window.pydio, args);
			} else if (document.fire) {
				args.push("pydio:" + eventName);
				if (optionalData) args.push(optionalData);
				document.fire.apply(document, args);
			}
			if (optionalData) {
				args = [eventName, { memo: optionalData }];
			} else {
				args = [eventName];
			}
			this.notify.apply(this, args);
		} else {
			if (optionalData) {
				args = [eventName, { memo: optionalData }];
			} else {
				args = [eventName];
			}
			this.notify.apply(this, args);
		}
	};

	/**
  * Get the current context node
  * @returns AjxpNode
  */

	PydioDataModel.prototype.getContextNode = function getContextNode() {
		return this._contextNode;
	};

	/**
  * After a copy or move operation, many nodes may have to be reloaded
  * This function tries to reload them in the right order and if necessary.
  * @param nodes AjxpNodes[] An array of nodes
  */

	PydioDataModel.prototype.multipleNodesReload = function multipleNodesReload(nodes) {
		for (var i = 0; i < nodes.length; i++) {
			var nodePathOrNode = nodes[i];
			var node;
			if (nodePathOrNode instanceof String) {
				node = new _AjxpNode2['default'](nodePathOrNode);
				if (node.getPath() == this._rootNode.getPath()) node = this._rootNode;else node = node.findInArbo(this._rootNode, []);
			} else {
				node = nodePathOrNode;
			}
			nodes[i] = node;
		}
		var children = [];
		nodes.sort(function (a, b) {
			if (a.isParentOf(b)) {
				children.push(b);
				return -1;
			}
			if (a.isChildOf(b)) {
				children.push(a);
				return +1;
			}
			return 0;
		});
		children.map(function (c) {
			nodes = _utilLangUtils2['default'].arrayWithout(nodes, c);
		});
		nodes.map(this.queueNodeReload.bind(this));
		this.nextNodeReloader();
	};

	/**
  * Add a node to the queue of nodes to reload.
  * @param node AjxpNode
  */

	PydioDataModel.prototype.queueNodeReload = function queueNodeReload(node) {
		if (!this.queue) this.queue = [];
		if (node) {
			this.queue.push(node);
		}
	};

	/**
  * Queue processor for the nodes to reload
  */

	PydioDataModel.prototype.nextNodeReloader = function nextNodeReloader() {
		if (!this.queue.length) {
			window.setTimeout((function () {
				this.publish("context_changed", this._contextNode);
			}).bind(this), 200);
			return;
		}
		var next = this.queue.shift();
		var observer = this.nextNodeReloader.bind(this);
		next.observeOnce("loaded", observer);
		next.observeOnce("error", observer);
		if (next === this._contextNode || next.isParentOf(this._contextNode)) {
			this.requireContextChange(next, true);
		} else {
			next.reload(this._iAjxpNodeProvider);
		}
	};

	/**
  * Insert a node somewhere in the datamodel
  * @param node AjxpNode
  * @param setSelectedAfterAdd bool
  */

	PydioDataModel.prototype.addNode = function addNode(node) {
		var setSelectedAfterAdd = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		// If it already exists, replace it
		var existing = node.findInArbo(this.getRootNode(), undefined);
		if (existing) {
			existing.replaceBy(node, "override");
			if (setSelectedAfterAdd && this.getContextNode() === existing.getParent()) {
				this.setSelectedNodes([existing], {});
			}
		}

		var parentFake = new _AjxpNode2['default'](_utilPathUtils2['default'].getDirname(node.getPath()));
		var parent = parentFake.findInArbo(this.getRootNode(), undefined);
		if (!parent && _utilPathUtils2['default'].getDirname(node.getPath()) === "") {
			parent = this.getRootNode();
		}
		if (parent) {
			var addedNode = parent.addChild(node);
			if (addedNode && setSelectedAfterAdd && this.getContextNode() === parent) {
				this.setSelectedNodes([addedNode], {});
			}
		}
	};

	/**
  * Remove a node by path somewhere
  * @param path string
  * @param imTime integer|null
  */

	PydioDataModel.prototype.removeNodeByPath = function removeNodeByPath(path) {
		var imTime = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

		var fake = new _AjxpNode2['default'](path);
		var n = fake.findInArbo(this.getRootNode(), undefined);
		if (n) {
			if (imTime && n.getMetadata() && n.getMetadata().get("ajxp_im_time") && parseInt(n.getMetadata().get("ajxp_im_time")) >= imTime) {
				return false;
			}
			n.getParent().removeChild(n);
			return true;
		}
		return false;
	};

	/**
  * Update a node somewhere in the datamodel
  * @param node AjxpNode
  * @param setSelectedAfterUpdate bool
  */

	PydioDataModel.prototype.updateNode = function updateNode(node) {
		var setSelectedAfterUpdate = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

		var original = node.getMetadata().get("original_path");
		var fake, n;
		if (original && original !== node.getPath() && _utilPathUtils2['default'].getDirname(original) !== _utilPathUtils2['default'].getDirname(node.getPath())) {
			// Node was really moved to another folder
			fake = new _AjxpNode2['default'](original);
			n = fake.findInArbo(this.getRootNode(), undefined);
			if (n) {
				n.getParent().removeChild(n);
			}
			var parentFake = new _AjxpNode2['default'](_utilPathUtils2['default'].getDirname(node.getPath()));
			var parent = parentFake.findInArbo(this.getRootNode(), undefined);
			if (!parent && _utilPathUtils2['default'].getDirname(node.getPath()) === "") parent = this.getRootNode();
			if (parent) {
				node.getMetadata().set("original_path", undefined);
				parent.addChild(node);
			}
		} else {
			if (node.getMetadata().get("original_path") === "/" && node.getPath() === "/") {
				n = this.getRootNode();
				n.replaceMetadata(node.getMetadata());
				if (setSelectedAfterUpdate && this.getContextNode() === n) {
					this.setSelectedNodes([n], {});
				}
				return;
			}
			fake = new _AjxpNode2['default'](original);
			n = fake.findInArbo(this.getRootNode(), undefined);
			if (n && !n.isMoreRecentThan(node)) {
				node._isLoaded = n._isLoaded;
				n.replaceBy(node, "override");
				if (setSelectedAfterUpdate && this.getContextNode() === n.getParent()) {
					this.setSelectedNodes([n], {});
				}
			}
		}
	};

	/**
  * Sets an array of nodes to be selected after the context is (re)loaded
  * @param selection AjxpNode[]
  */

	PydioDataModel.prototype.setPendingSelection = function setPendingSelection(selection) {
		this._pendingSelection = selection;
	};

	/**
  * Gets the array of nodes to be selected after the context is (re)loaded
  * @returns AjxpNode[]
  */

	PydioDataModel.prototype.getPendingSelection = function getPendingSelection() {
		return this._pendingSelection;
	};

	/**
  * Clears the nodes to be selected
  */

	PydioDataModel.prototype.clearPendingSelection = function clearPendingSelection() {
		this._pendingSelection = null;
	};

	/**
  * Set an array of nodes as the current selection
  * @param ajxpDataNodes AjxpNode[] The nodes to select
  * @param source String The source of this selection action
  */

	PydioDataModel.prototype.setSelectedNodes = function setSelectedNodes(ajxpDataNodes, source) {
		if (this._selectedNodes.length === ajxpDataNodes.length) {
			if (ajxpDataNodes.length === 0) {
				return;
			}
			var equal = true;
			for (var k = 0; k < ajxpDataNodes.length; k++) {
				equal = equal && ajxpDataNodes[k] === this._selectedNodes[k];
			}
			if (equal) {
				window.pydio.fire("selection_reloaded", this);
				return;
			}
		}
		if (!source) {
			this._selectionSource = {};
		} else {
			this._selectionSource = source;
		}
		this._selectedNodes = ajxpDataNodes;
		this._bEmpty = ajxpDataNodes && ajxpDataNodes.length ? false : true;
		this._bFile = this._bDir = this._isRecycle = false;
		if (!this._bEmpty) {
			for (var i = 0; i < ajxpDataNodes.length; i++) {
				var selectedNode = ajxpDataNodes[i];
				if (selectedNode.isLeaf()) this._bFile = true;else this._bDir = true;
				if (selectedNode.isRecycle()) this._isRecycle = true;
			}
		}
		this.publish("selection_changed", this);
	};

	/**
  * Gets the currently selected nodes
  * @returns AjxpNode[]
  */

	PydioDataModel.prototype.getSelectedNodes = function getSelectedNodes() {
		return this._selectedNodes;
	};

	/**
  * Gets the source of the last selection action
  * @returns String
  */

	PydioDataModel.prototype.getSelectionSource = function getSelectionSource() {
		return this._selectionSource;
	};

	/**
  * Manually sets the source of the selection
  * @param object
  */

	PydioDataModel.prototype.setSelectionSource = function setSelectionSource(object) {
		this._selectionSource = object;
	};

	/**
  * Select all the children of the current context node
  */

	PydioDataModel.prototype.selectAll = function selectAll() {
		var nodes = [];
		var childrenMap = this._contextNode.getChildren();
		childrenMap.forEach(function (child) {
			nodes.push(child);
		});
		this.setSelectedNodes(nodes, "dataModel");
	};

	/**
  * Whether the selection is empty
  * @returns Boolean
  */

	PydioDataModel.prototype.isEmpty = function isEmpty() {
		return this._selectedNodes ? this._selectedNodes.length === 0 : true;
	};

	PydioDataModel.prototype.hasReadOnly = function hasReadOnly() {
		var test = false;
		try {
			this._selectedNodes.forEach(function (node) {
				if (node.getMetadata().get("node_readonly") === "true") {
					test = true;
					throw $break;
				}
			});
		} catch (e) {}
		return test;
	};

	PydioDataModel.prototype.selectionHasRootNode = function selectionHasRootNode() {
		var found = false;
		try {
			this._selectedNodes.forEach(function (el) {
				if (el.isRoot()) {
					found = true;
					throw new Error();
				}
			});
		} catch (e) {}
		return found;
	};

	/**
  * Whether the selection is unique
  * @returns Boolean
  */

	PydioDataModel.prototype.isUnique = function isUnique() {
		return this._selectedNodes && this._selectedNodes.length === 1;
	};

	/**
  * Whether the selection has a file selected.
  * Should be hasLeaf
  * @returns Boolean
  */

	PydioDataModel.prototype.hasFile = function hasFile() {
		return this._bFile;
	};

	/**
  * Whether the selection has a dir selected
  * @returns Boolean
  */

	PydioDataModel.prototype.hasDir = function hasDir() {
		return this._bDir;
	};

	/**
  * Whether the current context is the recycle bin
  * @returns Boolean
  */

	PydioDataModel.prototype.isRecycle = function isRecycle() {
		return this._isRecycle;
	};

	/**
  * Whether the selection has more than one node selected
  * @returns Boolean
  */

	PydioDataModel.prototype.isMultiple = function isMultiple() {
		return this._selectedNodes && this._selectedNodes.length > 1;
	};

	/**
  * Whether the selection has a file with one of the mimes
  * @param mimeTypes Array Array of mime types
  * @returns Boolean
  */

	PydioDataModel.prototype.hasMime = function hasMime(mimeTypes) {
		if (mimeTypes.length === 1 && mimeTypes[0] === "*") return true;
		var has = false;
		mimeTypes.map((function (mime) {
			if (has) return;
			for (var i = 0; i < this._selectedNodes.length; i++) {
				if (_utilPathUtils2['default'].getAjxpMimeType(this._selectedNodes[i]) === mime) {
					has = true;
					break;
				}
			}
		}).bind(this));
		return has;
	};

	/**
  * Get all selected filenames as an array.
  * @param separator String Is a separator, will return a string joined
  * @returns Array|String|bool
  */

	PydioDataModel.prototype.getFileNames = function getFileNames(separator) {
		if (!this._selectedNodes.length) {
			alert('Please select a file!');
			return false;
		}
		var tmp = new Array(this._selectedNodes.length);
		for (var i = 0; i < this._selectedNodes.length; i++) {
			tmp[i] = this._selectedNodes[i].getPath();
		}
		if (separator) {
			return tmp.join(separator);
		} else {
			return tmp;
		}
	};

	/**
  * Get all the filenames of the current context node children
  * @param separator String If passed, will join the array as a string
  * @return Array|String|bool
  */

	PydioDataModel.prototype.getContextFileNames = function getContextFileNames(separator) {
		var allItems = this._contextNode.getChildren();
		if (!allItems.length) {
			return false;
		}
		var names = [];
		for (var i = 0; i < allItems.length; i++) {
			names.push(_utilPathUtils2['default'].getBasename(allItems[i].getPath()));
		}
		if (separator) {
			return names.join(separator);
		} else {
			return names;
		}
	};

	/**
  * Whether the context node has a child with this basename
  * @param newFileName String The name to check
  * @returns Boolean
  * @param local
  * @param contextNode
  */

	PydioDataModel.prototype.fileNameExists = function fileNameExists(newFileName, local, contextNode) {
		if (!contextNode) {
			contextNode = this._contextNode;
		}
		if (local) {
			var test = (contextNode.getPath() === "/" ? "" : contextNode.getPath()) + "/" + newFileName;
			var found = false;
			try {
				contextNode.getChildren().forEach(function (c) {
					if (c.getPath() === test) {
						found = true;
						throw new Error();
					}
				});
			} catch (e) {}
			return found;
		} else {
			var nodeExists = false;
			this.loadPathInfoSync(contextNode.getPath() + "/" + newFileName, function (foundNode) {
				nodeExists = true;
			});
			return nodeExists;
		}
	};

	/**
  * Gets the first name of the current selection
  * @returns String
  */

	PydioDataModel.prototype.getUniqueFileName = function getUniqueFileName() {
		if (this.getFileNames().length) {
			return this.getFileNames()[0];
		}
		return null;
	};

	/**
  * Gets the first node of the selection, or Null
  * @returns AjxpNode
  */

	PydioDataModel.prototype.getUniqueNode = function getUniqueNode() {
		if (this._selectedNodes.length) {
			return this._selectedNodes[0];
		}
		return null;
	};

	/**
  * Gets a node from the current selection
  * @param i Integer the node index
  * @returns AjxpNode
  */

	PydioDataModel.prototype.getNode = function getNode(i) {
		return this._selectedNodes[i];
	};

	/**
  * Will add the current selection nodes as serializable data to the element passed :
  * either as hidden input elements if it's a form, or as query parameters if it's an url
  * @param oFormElement HTMLForm The form
  * @param sUrl String An url to complete
  * @returns String
  */

	PydioDataModel.prototype.updateFormOrUrl = function updateFormOrUrl(oFormElement, sUrl) {
		// CLEAR FROM PREVIOUS ACTIONS!
		if (oFormElement) {
			$(oFormElement).select('input[type="hidden"]').map(function (element) {
				if (element.name === "nodes[]" || element.name === "file") {
					element.remove();
				}
			});
		}
		// UPDATE THE 'DIR' FIELDS
		if (oFormElement && oFormElement['rep']) {
			oFormElement['rep'].value = this._currentRep;
		}
		sUrl += '&dir=' + encodeURIComponent(this._currentRep);

		// UPDATE THE 'file' FIELDS
		if (this.isEmpty()) {
			return sUrl;
		}
		var fileNames = this.getFileNames();
		for (var i = 0; i < fileNames.length; i++) {
			sUrl += '&' + 'nodes[]=' + encodeURIComponent(fileNames[i]);
			if (oFormElement) {
				this._addHiddenField(oFormElement, 'nodes[]', fileNames[i]);
			}
		}
		if (fileNames.length === 1) {
			sUrl += '&' + 'file=' + encodeURIComponent(fileNames[0]);
			if (oFormElement) {
				this._addHiddenField(oFormElement, 'file', fileNames[0]);
			}
		}
		return sUrl;
	};

	PydioDataModel.prototype._addHiddenField = function _addHiddenField(oFormElement, sFieldName, sFieldValue) {
		oFormElement.insert(new Element('input', { type: 'hidden', name: sFieldName, value: sFieldValue }));
	};

	return PydioDataModel;
})(_langObservable2['default']);

exports['default'] = PydioDataModel;
module.exports = exports['default'];
