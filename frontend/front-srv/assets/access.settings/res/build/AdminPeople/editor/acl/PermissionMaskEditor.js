'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modelRole = require("../model/Role");

var _modelRole2 = _interopRequireDefault(_modelRole);

var _pydioModelNode = require('pydio/model/node');

var _pydioModelNode2 = _interopRequireDefault(_pydioModelNode);

var _pydioHttpRestApi = require('pydio/http/rest-api');

var _classNames = require('classNames');

var _classNames2 = _interopRequireDefault(_classNames);

var _materialUi = require('material-ui');

var _pydioModelDataModel = require('pydio/model/data-model');

var _pydioModelDataModel2 = _interopRequireDefault(_pydioModelDataModel);

var _MaskNodesProvider = require('./MaskNodesProvider');

var _MaskNodesProvider2 = _interopRequireDefault(_MaskNodesProvider);

var PermissionMaskEditor = _react2['default'].createClass({
    displayName: 'PermissionMaskEditor',

    mixins: [AdminComponents.MessagesConsumerMixin],

    propTypes: {
        role: _react2['default'].PropTypes.instanceOf(_modelRole2['default']),
        workspace: _react2['default'].PropTypes.instanceOf(_pydioHttpRestApi.IdmWorkspace),

        /* Global permissions may override the folders rights */
        globalWorkspacePermissions: _react2['default'].PropTypes.object,
        showGlobalPermissions: _react2['default'].PropTypes.bool,
        onGlobalPermissionsChange: _react2['default'].PropTypes.func,

        /* Folders mask and parentMask */
        onNodesChange: _react2['default'].PropTypes.func,

        /* Maybe used to alert about inconsistencies */
        showModal: _react2['default'].PropTypes.func,
        hideModal: _react2['default'].PropTypes.func
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
        var dataModel = new _pydioModelDataModel2['default'](true);
        var rNodeProvider = new _MaskNodesProvider2['default']();
        dataModel.setAjxpNodeProvider(rNodeProvider);
        // Todo:  multiple roots
        var rootNodes = this.props.workspace.RootNodes;
        var firstNode = rootNodes[Object.keys(rootNodes).shift()];
        var rootNode = new _pydioModelNode2['default']("/" + firstNode.Path, false, this.context.getMessage('acls.rights.advanced.root'), "folder.png", rNodeProvider);
        rootNode.getMetadata().set("uuid", firstNode.Uuid);

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

    onCheckboxCheck: function onCheckboxCheck(node, checkboxName, value) {

        //console.log(node, checkboxName, value);
        var role = this.props.role;

        var nodeUuid = node.getMetadata().get('uuid');

        var _role$getAclString = role.getAclString(null, nodeUuid);

        var aclString = _role$getAclString.aclString;
        var inherited = _role$getAclString.inherited;

        // Rebuild new value
        var acls = [];
        if (checkboxName === 'deny' && value) {
            acls = [checkboxName];
        } else if (aclString) {
            acls = aclString.split(',');
            if (acls.indexOf(checkboxName) > -1) {
                acls = acls.filter(function (a) {
                    return a !== checkboxName;
                });
            } else {
                acls.push(checkboxName);
            }
        } else if (value) {
            acls.push(checkboxName);
        }
        this.props.onNodesChange(nodeUuid, acls.join(','));
    },

    roleAclObject: function roleAclObject(node) {
        var role = this.props.role;

        var _role$getAclString2 = role.getAclString(null, node.getMetadata().get("uuid"));

        var aclString = _role$getAclString2.aclString;
        var inherited = _role$getAclString2.inherited;

        var read = aclString.indexOf("read") > -1,
            write = aclString.indexOf("write") > -1,
            deny = aclString.indexOf("deny") > -1;
        return {
            VALUES: { read: read, write: write, deny: deny },
            INHERITED: false,
            DISABLED: {},
            CLASSNAME: inherited ? "parent-inherited" : "",
            EMPTY: !read && !write && !deny
        };
    },

    checkboxesComputeStatus: function checkboxesComputeStatus(node) {

        var data = this.roleAclObject(node);
        var bNode = node,
            parent = undefined;
        var parentData = undefined;
        while (parent = bNode.getParent()) {
            parentData = this.roleAclObject(parent);
            if (!parentData.EMPTY) {
                break;
            }
            bNode = parent;
        }
        if (data.EMPTY && parentData) {
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        } else if (parentData && parentData.VALUES.deny) {
            data.VALUES = parentData.VALUES;
            data.INHERITED = true;
        }
        if (data.VALUES.deny) {
            data.DISABLED = { read: true, write: true };
        }

        return data;
    },

    render: function render() {
        var mainClassNames = (0, _classNames2['default'])("permission-mask-editor", { "tree-show-accessible-nodes": this.state && this.state.showResultingTree }, { "permission-mask-global-noread": this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.read });

        //            {"permission-mask-global-nowrite":(this.props.globalWorkspacePermissions && !this.props.globalWorkspacePermissions.write)}
        return _react2['default'].createElement(
            'div',
            { className: mainClassNames },
            _react2['default'].createElement(
                'div',
                { style: { margin: '0 16px', position: 'relative' } },
                _react2['default'].createElement(
                    'div',
                    { style: { position: 'absolute' } },
                    _react2['default'].createElement(_materialUi.IconButton, {
                        iconClassName: 'icon-filter', className: 'smaller-button',
                        tooltip: this.context.getMessage(this.state.showResultingTree ? 'react.13' : 'react.14', 'ajxp_admin'),
                        onClick: (function () {
                            this.setState({ showResultingTree: !this.state.showResultingTree });
                        }).bind(this)
                    })
                ),
                _react2['default'].createElement(
                    'div',
                    { className: 'read-write-header' },
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-read' },
                        this.context.getMessage('react.5a', 'ajxp_admin')
                    ),
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-write' },
                        this.context.getMessage('react.5b', 'ajxp_admin')
                    ),
                    _react2['default'].createElement(
                        'span',
                        { className: 'header-deny' },
                        this.context.getMessage('react.5', 'ajxp_admin')
                    )
                ),
                _react2['default'].createElement(
                    'div',
                    { style: { clear: 'both', marginRight: -34 } },
                    _react2['default'].createElement(PydioComponents.TreeView, {
                        ref: 'tree',
                        dataModel: this.state.dataModel,
                        node: this.state.node,
                        showRoot: true,
                        checkboxes: ["read", "write", "deny"],
                        checkboxesValues: this.state.mask,
                        checkboxesComputeStatus: this.checkboxesComputeStatus,
                        onCheckboxCheck: this.onCheckboxCheck,
                        forceExpand: true
                    })
                )
            )
        );
    }

});

exports['default'] = PermissionMaskEditor;
module.exports = exports['default'];
