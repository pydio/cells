"use strict";

var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global) {

    var SharesList = React.createClass({
        displayName: "SharesList",

        render: function render() {
            // User Shares List
            var getMessage = (function (id) {
                return this.props.pydio.MessageHash[id];
            }).bind(this);

            return React.createElement(PydioComponents.NodeListCustomProvider, {
                nodeProviderProperties: {
                    get_action: "sharelist-load", user_context: "current"
                },
                tableKeys: {
                    shared_element_parent_repository_label: { label: getMessage('ws.39', 'ajxp_admin'), width: '20%' },
                    original_path: { label: getMessage('ws.41', 'ajxp_admin'), width: '80%' },
                    share_type_readable: { label: getMessage('ws.40', 'ajxp_admin'), width: '15%' }
                },
                actionBarGroups: ['share_list_toolbar-selection', 'share_list_toolbar'],
                groupByFields: ['share_type_readable', 'shared_element_parent_repository_label'],
                defaultGroupBy: "shared_element_parent_repository_label",
                elementHeight: PydioComponents.SimpleList.HEIGHT_ONE_LINE,
                style: { maxWidth: 720 }
            });
        }

    });

    var FakeDndBackend = function FakeDndBackend() {
        return {
            setup: function setup() {},
            teardown: function teardown() {},
            connectDragSource: function connectDragSource() {},
            connectDragPreview: function connectDragPreview() {},
            connectDropTarget: function connectDropTarget() {}
        };
    };

    var selectionStyle = {
        color: '#1E88E5'
    };
    var cardStyle = {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #f0f0f0',
        minWidth: 250,
        maxWidth: 320
    };
    var listStyle = {
        flex: 1,
        overflowY: 'auto'
    };
    var listItemStyle = {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };
    var selectorContainerStyle = {
        backgroundColor: '#eceff1',
        paddingLeft: 10
    };

    var ShareNode = (function () {
        function ShareNode(id, data) {
            var parentNode = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            _classCallCheck(this, ShareNode);

            this._id = id;
            this._label = data['label'];
            this._count = data['count'];
            this._child_parameters = data['child_parameters'];
            this._children = [];
            this._childrenCursor = {};
            if (parentNode) {
                this._parentNode = parentNode;
            }
        }

        _createClass(ShareNode, [{
            key: "load",
            value: function load() {
                var groupBy = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
                var reload = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

                return new Promise((function (resolve) {
                    var _this = this;

                    var user_context = undefined,
                        append = false;
                    if (ShareNode.CURRENT_USER_CONTEXT) {
                        user_context = 'current';
                    } else {
                        user_context = this._child_parameters['user_id'] || groupBy === 'user_id' ? 'user' : 'global';
                    }
                    var params = _extends({}, this._child_parameters, { get_action: 'sharelist-load', format: 'json', user_context: user_context });
                    if (groupBy) {
                        params[groupBy] = '__GROUP__';
                    }
                    if (!reload && this.hasMore()) {
                        params['page'] = Math.ceil((this._childrenCursor[0] + 1) / this._childrenCursor[1]) + 1;
                        append = true;
                    }
                    PydioApi.getClient().request(params, function (transp) {
                        var children = transp.responseJSON.data;
                        _this._childrenCursor = transp.responseJSON.cursor;
                        if (!append) {
                            _this._children = [];
                        }
                        Object.keys(children).map(function (k) {
                            if (children[k]['child_parameters']) {
                                _this._children.push(new ShareNode(k, children[k], _this));
                            } else {
                                _this._children.push(new ShareLeaf(k, children[k], _this));
                            }
                        });
                        resolve(_this);
                    });
                }).bind(this));
            }
        }, {
            key: "getChildren",
            value: function getChildren() {
                return this._children;
            }
        }, {
            key: "getId",
            value: function getId() {
                return this._id;
            }
        }, {
            key: "getLabel",
            value: function getLabel() {
                return this._label + ' (' + this._count + ')';
            }
        }, {
            key: "isLeaf",
            value: function isLeaf() {
                return false;
            }
        }, {
            key: "hasMore",
            value: function hasMore() {
                return this._childrenCursor && this._childrenCursor.total && this._childrenCursor.total > this._childrenCursor[0] + this._childrenCursor[1];
            }
        }]);

        return ShareNode;
    })();

    var ShareLeaf = (function (_ShareNode) {
        _inherits(ShareLeaf, _ShareNode);

        function ShareLeaf(id, data, parentNode) {
            _classCallCheck(this, ShareLeaf);

            _get(Object.getPrototypeOf(ShareLeaf.prototype), "constructor", this).call(this, id, data, parentNode);
            var metadata = data['metadata'];
            this._internalNode = new AjxpNode('/' + id, true, metadata['text']);
            var metaMap = new Map();
            Object.keys(metadata).forEach(function (k) {
                metaMap.set(k, metadata[k]);
            });
            this._internalNode.setMetadata(metaMap);
        }

        _createClass(ShareLeaf, [{
            key: "load",
            value: function load() {
                var _this2 = this;

                return new Promise(function (resolve) {
                    resolve(_this2);
                });
            }
        }, {
            key: "getLabel",
            value: function getLabel() {
                return this._internalNode.getLabel();
            }
        }, {
            key: "getInternalNode",
            value: function getInternalNode() {
                return this._internalNode;
            }
        }, {
            key: "isLeaf",
            value: function isLeaf() {
                return true;
            }
        }]);

        return ShareLeaf;
    })(ShareNode);

    var ShareCard = (function (_React$Component) {
        _inherits(ShareCard, _React$Component);

        function ShareCard() {
            _classCallCheck(this, ShareCard);

            _get(Object.getPrototypeOf(ShareCard.prototype), "constructor", this).apply(this, arguments);
        }

        _createClass(ShareCard, [{
            key: "componentDidMount",
            value: function componentDidMount() {
                if (this.props.scrollXMax) {
                    this.props.scrollXMax();
                }
            }
        }, {
            key: "placeButtons",
            value: function placeButtons(component) {
                var _this3 = this;

                var updater = function updater(buttons) {
                    _this3.setState({ buttons: buttons });
                };
                this.setState({ buttons: component.getButtons(updater) });
            }
        }, {
            key: "render",
            value: function render() {
                var _this4 = this;

                var selection = new PydioDataModel();
                var internalNode = this.props.node.getInternalNode();
                selection.setSelectedNodes([internalNode]);
                var label = internalNode.getLabel();
                var originalPath = internalNode.getMetadata().get('original_path');
                var owner = internalNode.getMetadata().get('owner');
                var crtUser = this.props.pydio.user && this.props.pydio.user.id;
                var goTo = undefined;
                if (crtUser === owner && internalNode.getMetadata().has('shared_element_parent_repository') && originalPath) {
                    (function () {
                        var parentRepoId = internalNode.getMetadata().get('shared_element_parent_repository');
                        var goToNode = new AjxpNode(originalPath);
                        goToNode.getMetadata().set('repository_id', parentRepoId);
                        goTo = React.createElement(MaterialUI.IconButton, { iconClassName: "mdi mdi-open-in-app", tooltip: _this4.props.pydio.MessageHash[411], onTouchTap: function () {
                                pydio.goTo(goToNode);_this4.props.onDismiss();
                            } });
                    })();
                }
                var style = _extends({}, cardStyle, { zIndex: 100 - this.props.nestedLevel - 1, maxWidth: 420, minWidth: 420, marginRight: 10, overflowY: 'scroll' });

                return React.createElement(
                    MaterialUI.Paper,
                    { zDepth: 1, style: style },
                    React.createElement(
                        "div",
                        { style: { padding: '22px 8px 22px 16px', height: 72, borderBottom: '1px solid #e0e0e0', backgroundColor: '#eceff1', display: 'flex' } },
                        React.createElement(
                            "div",
                            { style: { paddingTop: 14, flex: 1 } },
                            label
                        ),
                        React.createElement(
                            "div",
                            null,
                            goTo,
                            " ",
                            this.state && this.state.buttons
                        )
                    ),
                    React.createElement(PydioReactUI.AsyncComponent, {
                        namespace: "ShareDialog",
                        componentName: "MainPanel",
                        pydio: this.props.pydio,
                        selection: selection,
                        readonly: true,
                        noModal: true,
                        onLoad: this.placeButtons.bind(this),
                        onDismiss: this.props.close,
                        style: { flex: 1 }
                    })
                );
            }
        }]);

        return ShareCard;
    })(React.Component);

    var ShareView = (function (_React$Component2) {
        _inherits(ShareView, _React$Component2);

        function ShareView(props) {
            _classCallCheck(this, ShareView);

            _get(Object.getPrototypeOf(ShareView.prototype), "constructor", this).call(this, props);
            var node = props.node;
            var filters = props.filters;
            var currentUser = props.currentUser;

            if (!node) {
                ShareNode.CURRENT_USER_CONTEXT = currentUser || false;
                node = new ShareNode('root', { label: 'root', count: 0, child_parameters: {} });
            }
            if (!filters) {
                filters = { parent_repository_id: '250', share_type: 'share_center.238', user_id: '249' };
            }
            this.state = {
                node: node,
                children: node.getChildren(),
                filters: filters,
                filter: Object.keys(filters).shift(),
                selectedChild: null
            };
        }

        _createClass(ShareView, [{
            key: "load",
            value: function load() {
                var _this5 = this;

                var reload = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

                this.setState({ loading: true });
                this.state.node.load(this.state.filter, reload).then(function (node) {
                    _this5.setState({ children: node.getChildren(), selectedChild: null, loading: false });
                });
            }
        }, {
            key: "componentDidMount",
            value: function componentDidMount() {
                this.load();
                if (this.props.scrollXMax) {
                    this.props.scrollXMax();
                }
            }
        }, {
            key: "componentWillReceiveProps",
            value: function componentWillReceiveProps(nextProps) {
                var _this6 = this;

                if (nextProps.node && nextProps.node !== this.state.node) {
                    this.setState({ node: nextProps.node }, function () {
                        _this6.load();
                    });
                }
            }
        }, {
            key: "selectChild",
            value: function selectChild(node) {
                this.setState({ selectedChild: node });
            }
        }, {
            key: "selectorChange",
            value: function selectorChange(event, index, value) {
                var _this7 = this;

                this.setState({ filter: value }, function () {
                    _this7.load();
                });
            }
        }, {
            key: "renderSelector",
            value: function renderSelector() {
                var _this8 = this;

                var _state = this.state;
                var filters = _state.filters;
                var filter = _state.filter;
                var loading = _state.loading;
                var MessageHash = this.props.pydio.MessageHash;

                var buttonStyle = { marginTop: 22 };
                if (loading) buttonStyle['animation'] = 'spin 3.5s infinite linear';
                var reloadButton = React.createElement(MaterialUI.IconButton, { style: buttonStyle, iconStyle: { color: 'rgba(0,0,0,0.23)' }, iconClassName: "mdi mdi-reload", onTouchTap: function () {
                        _this8.load(true);
                    } });
                if (!Object.keys(filters).length) {
                    return React.createElement(
                        "div",
                        { style: { display: 'flex' } },
                        React.createElement(
                            "div",
                            { style: { flex: 1, color: 'rgba(0,0,0,0.93)', height: 72, lineHeight: '91px', fontSize: 16 } },
                            MessageHash['share_center.241']
                        ),
                        reloadButton
                    );
                }

                return React.createElement(
                    "div",
                    { style: { display: 'flex' } },
                    React.createElement(
                        MaterialUI.SelectField,
                        {
                            floatingLabelText: MessageHash['share_center.240'],
                            fullWidth: true,
                            value: filter,
                            onChange: this.selectorChange.bind(this),
                            underlineStyle: { display: 'none' }
                        },
                        Object.keys(filters).map(function (f) {
                            return React.createElement(MaterialUI.MenuItem, { key: f, value: f, primaryText: MessageHash[filters[f]] });
                        })
                    ),
                    reloadButton
                );
            }
        }, {
            key: "scrollXMax",
            value: function scrollXMax() {
                if (this.refs.root) {
                    this.refs.root.scrollLeft = 1000000;
                }
            }
        }, {
            key: "render",
            value: function render() {
                var _this9 = this;

                var nestedLevel = (this.props.nestedLevel || 0) + 1;
                var filters = _extends({}, this.state.filters);
                delete filters[this.state.filter];

                var selectedChild = this.state.selectedChild;

                return React.createElement(
                    "div",
                    { style: _extends({}, this.props.style, { display: 'flex', overflowX: nestedLevel === 1 ? 'scroll' : 'initial' }), ref: "root" },
                    React.createElement(
                        MaterialUI.Paper,
                        { zDepth: 1, style: _extends({}, cardStyle, { zIndex: 100 - nestedLevel }), rounded: false },
                        React.createElement(
                            "div",
                            { style: selectorContainerStyle },
                            this.renderSelector()
                        ),
                        React.createElement(MaterialUI.Divider, { style: { height: 1 } }),
                        React.createElement(
                            MaterialUI.List,
                            { style: listStyle },
                            this.state.children.map(function (c) {
                                var itemStyle = _extends({}, listItemStyle);
                                if (selectedChild === c) {
                                    itemStyle = _extends({}, itemStyle, selectionStyle);
                                }
                                return React.createElement(MaterialUI.ListItem, {
                                    style: itemStyle,
                                    primaryText: c.getLabel(),
                                    onTouchTap: function () {
                                        _this9.selectChild(c);
                                    }
                                });
                            }),
                            this.state.node.hasMore() && React.createElement(
                                "div",
                                { style: { textAlign: 'center' } },
                                React.createElement(MaterialUI.FlatButton, { primary: true, label: this.props.pydio.MessageHash['share_center.242'], onTouchTap: function () {
                                        _this9.load();
                                    } })
                            )
                        )
                    ),
                    this.state.selectedChild && !this.state.selectedChild.isLeaf() && React.createElement(ShareView, {
                        pydio: this.props.pydio,
                        filters: filters,
                        nestedLevel: nestedLevel,
                        node: this.state.selectedChild,
                        scrollXMax: this.props.scrollXMax || this.scrollXMax.bind(this),
                        onDismiss: this.props.onDismiss
                    }),
                    this.state.selectedChild && this.state.selectedChild.isLeaf() && React.createElement(ShareCard, {
                        pydio: this.props.pydio,
                        node: this.state.selectedChild,
                        nestedLevel: nestedLevel,
                        scrollXMax: this.props.scrollXMax || this.scrollXMax.bind(this),
                        close: function () {
                            _this9.setState({ selectedChild: null });
                        },
                        onDismiss: this.props.onDismiss
                    })
                );
            }
        }]);

        return ShareView;
    })(React.Component);

    var ShareViewModal = React.createClass({
        displayName: "ShareViewModal",

        mixins: [PydioReactUI.ActionDialogMixin],

        getDefaultProps: function getDefaultProps() {
            return {
                dialogTitle: '',
                dialogSize: 'xl',
                dialogPadding: false,
                dialogIsModal: false,
                dialogScrollBody: false
            };
        },

        submit: function submit() {
            this.dismiss();
        },

        render: function render() {
            var _this10 = this;

            return React.createElement(
                "div",
                { style: { width: '100%', display: 'flex', flexDirection: 'column' } },
                React.createElement(PydioComponents.ModalAppBar, {
                    title: this.props.pydio.MessageHash['share_center.98'],
                    showMenuIconButton: false,
                    iconClassNameRight: "mdi mdi-close",
                    onRightIconButtonTouchTap: function () {
                        _this10.dismiss();
                    }
                }),
                React.createElement(ShareView, _extends({}, this.props, { style: { width: '100%', flex: 1 } }))
            );
        }

    });

    global.UserShares = {
        ShareView: ShareView,
        ShareViewModal: ShareViewModal,
        SharesList: ReactDND.DragDropContext(FakeDndBackend)(SharesList)
    };
})(window);
