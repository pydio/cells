"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var PermissionMaskEditor = _react2["default"].createClass({
    displayName: "PermissionMaskEditor",

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        workspaceId: _react2["default"].PropTypes.string,

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions: _react2["default"].PropTypes.object,
        showGlobalPermissions: _react2["default"].PropTypes.bool,
        onGlobalPermissionsChange: _react2["default"].PropTypes.func,

        /* Folders mask and parentMask */
        nodes: _react2["default"].PropTypes.object,
        parentNodes: _react2["default"].PropTypes.object,
        onNodesChange: _react2["default"].PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal: _react2["default"].PropTypes.func,
        hideModal: _react2["default"].PropTypes.func
    },

    dmObserver: function dmObserver() {
        var dataModel = this.state.dataModel;
        var sel = dataModel.getSelectedNodes();
        if (!sel.length) {
            return;
        }
        var selNode = sel[0];
        if (selNode.isLoaded()) {
            this.forceUpdate();
        } else {
            selNode.observeOnce("loaded", (function () {
                this.forceUpdate();
            }).bind(this));
            selNode.load();
        }
    },

    componentDidMount: function componentDidMount() {
        this.state.dataModel.setSelectedNodes([this.state.node]);
    },

    componentWillReceiveProps: function componentWillReceiveProps(newProps) {
        if (newProps.nodes !== this.state.nodes || newProps.parentNodes !== this.state.parentNodes) {
            this.setState({
                nodes: newProps.nodes,
                parentNodes: newProps.parentNodes || {}
            });
        }
    },

    recursiveLoadNodesWithChildren: function recursiveLoadNodesWithChildren(node, crtMask) {
        var afterLoad = function afterLoad(loadedNode) {
            "use strict";
            loadedNode.getChildren().forEach(function (c) {
                if (crtMask[c.getMetadata().get('uuid')] && crtMask[c.getMetadata().get('uuid')]['children']) {
                    c.observeOnce('loaded', function () {
                        afterLoad(c);
                    });
                    c.load();
                }
            });
        };
        if (node.isLoaded()) {
            afterLoad(node);
        } else {
            node.observeOnce('loaded', function () {
                afterLoad(node);
            });
            node.load();
        }
    },

    recursiveClearNodeValues: function recursiveClearNodeValues(node, values) {
        "use strict";

        var _this = this;

        node.getChildren().forEach(function (c) {
            if (values[c.getMetadata().get('uuid')]) {
                _this.recursiveClearNodeValues(c, values);
                delete values[c.getMetadata().get('uuid')];
            }
        });
    },

    getInitialState: function getInitialState() {
        var nodeProviderProperties = {
            get_action: "ls",
            tmp_repository_id: this.props.workspaceId
        };
        var dataModel = new PydioDataModel(true);
        var rNodeProvider = new RemoteNodeProvider();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        rNodeProvider.initProvider(nodeProviderProperties);
        var rootNode = new AjxpNode("/", false, "Whole workspace", "folder.png", rNodeProvider);
        dataModel.setRootNode(rootNode);
        this.recursiveLoadNodesWithChildren(rootNode, this.props.nodes);
        dataModel.observe("selection_changed", this.dmObserver);

        return {
            node: rootNode,
            dataModel: dataModel,
            nodes: this.props.nodes,
            parentNodes: this.props.parentNodes,
            showResultingTree: false
        };
    },

    updateRow: function updateRow(currentValues, checkboxName, value) {
        if (checkboxName == "read" || checkboxName == "write" || checkboxName == "children") {
            if (value) currentValues[checkboxName] = value;else if (currentValues[checkboxName]) delete currentValues[checkboxName];

            if (value && (checkboxName == "read" || checkboxName == "write") && currentValues["deny"]) {
                delete currentValues["deny"];
            }
        } else if (checkboxName == "deny") {
            if (value) {
                currentValues[checkboxName] = value;
                if (currentValues["read"]) delete currentValues["read"];
                if (currentValues["write"]) delete currentValues["write"];
            } else {
                if (currentValues["deny"]) delete currentValues["deny"];
            }
        }
        if (!Object.keys(currentValues).length) {
            return "delete";
        } else {
            return "update";
        }
    },

    updateColumn: function updateColumn(values, node, checkboxName, value, copy) {
        // If we change the "children" status, remove children values
        if (checkboxName == "children") {
            if (copy) {
                (function () {
                    var currentValues = LangUtils.simpleCopy(values[node.getMetadata().get('uuid')]) || {};
                    currentValues["children"] = false;
                    node.getChildren().forEach(function (c) {
                        if (!c.isLeaf()) {
                            values[c.getMetadata().get("uuid")] = LangUtils.simpleCopy(currentValues);
                        }
                    });
                })();
            } else {
                this.recursiveClearNodeValues(node, values);
            }
        }
    },

    applyConfirm: function applyConfirm(value, event) {
        this.refs.dialog.dismiss();
        switch (value) {
            case "cancel":
                break;
            case "confirm-remove":
            case "confirm-set-clear":
                this.onCheckboxCheck.apply(this, _toConsumableArray(Object.values(this.state.confirmPending)).concat([true]));
                break;
            case "confirm-set-copy":
                this.onCheckboxCheck(this.state.confirmPending["node"], "children", "copy", true);
                break;
            default:
                break;
        }
        this.setState({ confirm: null, confirmPending: null });
    },

    onCheckboxCheck: function onCheckboxCheck(node, checkboxName, value, skipConfirm) {
        var _this2 = this;

        var values = this.state.nodes;
        var nodeUuid = node.getMetadata().get('uuid');
        var nodeValues = values[nodeUuid] || {};
        if (checkboxName == "children" && !skipConfirm) {
            if (value && !node.isLoaded()) {
                (function () {
                    var tree = _this2.refs.tree;
                    node.observeOnce("loaded", function () {
                        global.setTimeout(function () {
                            tree.forceUpdate();
                        }, 200);
                    });
                    node.load();
                })();
            }
            var confirmationText = undefined,
                buttons = undefined;
            if (value) {
                confirmationText = this.context.getMessage('react.8', 'ajxp_admin');
                buttons = [{ text: this.context.getMessage('react.10', 'ajxp_admin'), onClick: this.applyConfirm.bind(this, 'confirm-set-copy') }, { text: this.context.getMessage('react.11', 'ajxp_admin'), onClick: this.applyConfirm.bind(this, 'confirm-set-clear') }, { text: this.context.getMessage('54', ''), onClick: this.applyConfirm.bind(this, 'cancel') }];
            } else {
                confirmationText = this.context.getMessage('react.9', 'ajxp_admin');
                buttons = [{ text: this.context.getMessage('react.12', 'ajxp_admin'), onClick: this.applyConfirm.bind(this, 'confirm-remove') }, { text: this.context.getMessage('54', ''), onTouchTap: this.applyConfirm.bind(this, 'cancel') }];
            }
            this.setState({
                confirm: {
                    text: confirmationText,
                    buttons: buttons
                },
                confirmPending: {
                    node: node,
                    checkboxName: checkboxName,
                    value: value
                }
            }, (function () {
                this.refs.dialog.show();
            }).bind(this));
            return;
        }
        var copy = undefined;
        if (checkboxName == "children" && value == "copy") {
            copy = true;
            value = true;
            this.updateColumn(values, node, checkboxName, value, true);
        }
        var result = this.updateRow(nodeValues, checkboxName, value);
        if (!copy) {
            this.updateColumn(values, node, checkboxName, value);
        }

        if (result == "delete" && values[nodeUuid]) {
            delete values[nodeUuid];
        } else {
            nodeValues["uuid"] = nodeUuid;
            values[nodeUuid] = nodeValues;
        }
        if (this.props.onNodesChange) {
            this.props.onNodesChange(values);
        }
        this.setState({ nodes: values });
    },

    checkboxesComputeStatus: function checkboxesComputeStatus(node) {
        var useParentMask = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        var nodeUuid = node.getMetadata().get('uuid');
        var values = {},
            disabled = {};
        var inherited = false,
            foundParent = false,
            foundParentChecksChildren = false;
        var mask = this.state.nodes;
        if (useParentMask) {
            mask = this.state.parentNodes;
        }
        var firstParent = node.getParent();
        if (firstParent && firstParent.getPath() != '/' && mask[firstParent.getMetadata().get('uuid')] && mask[firstParent.getMetadata().get('uuid')]['children']) {
            foundParentChecksChildren = true;
        }
        if (mask[nodeUuid]) {
            values = mask[nodeUuid];
        } else {
            var bNode = node,
                _parent = undefined;
            // IF direct parent has not values at all, it will always be inherited
            if (firstParent && !mask[firstParent.getMetadata().get('uuid')]) {
                inherited = true;
            }
            while (_parent = bNode.getParent()) {
                if (mask[_parent.getMetadata().get('uuid')]) {
                    var parentValues = mask[_parent.getMetadata().get('uuid')];
                    foundParent = true;
                    if (!parentValues['children']) {
                        inherited = true;
                        values = LangUtils.deepCopy(parentValues);
                    }
                    break;
                }
                bNode = _parent;
            }
        }
        if (!Object.keys(values).length) {
            if (node.getPath() != '/' && !foundParent) {
                inherited = true;
            }
        }
        // Update disabled state
        if (inherited) {
            disabled = { read: true, write: true, deny: true, children: true };
        } else {
            if (values['children']) {
                disabled = { read: true, write: true, deny: true };
                values['write'] = false;
                values['deny'] = false;
                values['read'] = true;
            } else if (values['deny']) {
                disabled = { read: true, write: true };
            }
        }
        var additionalClass = undefined;
        if (!values['read'] && !values['write'] && !values['deny'] && Object.keys(this.state.parentNodes).length && !foundParentChecksChildren && !useParentMask) {
            // Still no values, compute from parent
            additionalClass = 'parent-inherited';
            var data = this.checkboxesComputeStatus(node, true);
            values = data.VALUES;
            disabled = { read: false, write: false, deny: false, children: false };
            inherited = data.INHERITED;
        }
        return {
            VALUES: values,
            INHERITED: inherited,
            DISABLED: disabled,
            CLASSNAME: additionalClass
        };
    },

    render: function render() {
        var mainClassNames = global.classNames("permission-mask-editor", { "tree-show-accessible-nodes": this.state && this.state.showResultingTree }, { "permission-mask-global-noread": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read }, { "permission-mask-global-nowrite": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write });
        return _react2["default"].createElement(
            "div",
            { className: mainClassNames },
            _react2["default"].createElement(
                ReactMUI.Dialog,
                {
                    ref: "dialog",
                    title: "Warning",
                    actions: this.state && this.state.confirm ? this.state.confirm.buttons : [],
                    contentClassName: "dialog-max-480"
                },
                this.state && this.state.confirm ? this.state.confirm.text : ''
            ),
            _react2["default"].createElement(
                "div",
                { style: { margin: '0 16px', position: 'relative' } },
                _react2["default"].createElement(
                    "div",
                    { style: { position: 'absolute' } },
                    _react2["default"].createElement(ReactMUI.IconButton, {
                        iconClassName: "icon-filter", className: "smaller-button",
                        tooltip: this.context.getMessage(this.state.showResultingTree ? 'react.13' : 'react.14', 'ajxp_admin'),
                        onClick: (function () {
                            this.setState({ showResultingTree: !this.state.showResultingTree });
                        }).bind(this)
                    })
                ),
                _react2["default"].createElement(
                    "div",
                    { className: "read-write-header" },
                    _react2["default"].createElement(
                        "span",
                        { className: "header-read" },
                        this.context.getMessage('react.5a', 'ajxp_admin')
                    ),
                    _react2["default"].createElement(
                        "span",
                        { className: "header-write" },
                        this.context.getMessage('react.5b', 'ajxp_admin')
                    ),
                    _react2["default"].createElement(
                        "span",
                        { className: "header-deny" },
                        this.context.getMessage('react.5', 'ajxp_admin')
                    ),
                    _react2["default"].createElement(
                        "span",
                        { className: "header-children" },
                        this.context.getMessage('react.6', 'ajxp_admin')
                    )
                ),
                _react2["default"].createElement("br", { style: { clear: 'both' } }),
                _react2["default"].createElement(PydioComponents.TreeView, {
                    ref: "tree",
                    dataModel: this.state.dataModel,
                    node: this.state.node,
                    showRoot: true,
                    checkboxes: ["read", "write", "deny", "children"],
                    checkboxesValues: this.state.mask,
                    checkboxesComputeStatus: this.checkboxesComputeStatus,
                    onCheckboxCheck: this.onCheckboxCheck,
                    forceExpand: true
                })
            )
        );
    }

});

exports["default"] = PermissionMaskEditor;
module.exports = exports["default"];
