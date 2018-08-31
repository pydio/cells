'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _require = require('react-textfit');

var Textfit = _require.Textfit;

var Color = require('color');

var _Pydio$requireLib = _pydio2['default'].requireLib('workspaces');

var Breadcrumb = _Pydio$requireLib.Breadcrumb;
var SearchForm = _Pydio$requireLib.SearchForm;
var MainFilesList = _Pydio$requireLib.MainFilesList;
var Editor = _Pydio$requireLib.Editor;
var EditionPanel = _Pydio$requireLib.EditionPanel;

var _Pydio$requireLib2 = _pydio2['default'].requireLib('components');

var ContextMenu = _Pydio$requireLib2.ContextMenu;
var ButtonMenu = _Pydio$requireLib2.ButtonMenu;
var Toolbar = _Pydio$requireLib2.Toolbar;
var ListPaginator = _Pydio$requireLib2.ListPaginator;
var ClipboardTextField = _Pydio$requireLib2.ClipboardTextField;

var _Pydio$requireLib3 = _pydio2['default'].requireLib('boot');

var withProgressiveBg = _Pydio$requireLib3.withProgressiveBg;

var _Pydio$requireLib4 = _pydio2['default'].requireLib('hoc');

var EditorActions = _Pydio$requireLib4.EditorActions;
var dropProvider = _Pydio$requireLib4.dropProvider;

var withUniqueNode = function withUniqueNode(attachListener) {
    return function (Component) {
        return (function (_React$PureComponent) {
            _inherits(WithUniqueNode, _React$PureComponent);

            function WithUniqueNode() {
                _classCallCheck(this, WithUniqueNode);

                _get(Object.getPrototypeOf(WithUniqueNode.prototype), 'constructor', this).apply(this, arguments);
            }

            _createClass(WithUniqueNode, [{
                key: 'componentDidMount',
                value: function componentDidMount() {
                    this.detectFirstNode();
                }
            }, {
                key: 'detectFirstNode',
                value: function detectFirstNode() {
                    var _this = this;

                    var dm = this.props.pydio.getContextHolder();

                    if (!dm.getSelectedNodes().length) {
                        var first = dm.getRootNode().getFirstChildIfExists();
                        if (first) {
                            dm.setSelectedNodes([first], "dataModel");
                            this.setState({ node: first });
                        } else {
                            setTimeout(function () {
                                return _this.detectFirstNode();
                            }, 1000);
                        }
                    } else {
                        if (!this.state || !this.state.node) {
                            this.setState({ node: dm.getSelectedNodes()[0] });
                        }
                    }
                    if (attachListener) {
                        dm.observe("selection_changed", (function () {
                            var selection = dm.getSelectedNodes();
                            if (selection.length) this.setState({ node: selection[0] });else this.setState({ node: null });
                        }).bind(this));
                    }
                }
            }, {
                key: 'render',
                value: function render() {
                    return React.createElement(Component, _extends({}, this.props, { node: this.state && this.state.node }));
                }
            }]);

            return WithUniqueNode;
        })(React.PureComponent);
    };
};

var UniqueNodeTemplateMixin = {

    detectFirstNode: function detectFirstNode() {
        var attachListener = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        var dm = this.props.pydio.getContextHolder();
        if (!dm.getSelectedNodes().length) {
            var first = dm.getRootNode().getFirstChildIfExists();
            if (first) {
                dm.setSelectedNodes([first], "dataModel");
                this.setState({ node: first });
            } else {
                setTimeout(this.detectFirstNode.bind(this), 1000);
            }
        } else {
            if (!this.state || !this.state.node) {
                this.setState({ node: dm.getSelectedNodes()[0] });
            }
        }
        if (attachListener) {
            dm.observe("selection_changed", (function () {
                var selection = dm.getSelectedNodes();
                if (selection.length) this.setState({ node: selection[0] });else this.setState({ node: null });
            }).bind(this));
        }
    }

};

var DLTemplate = React.createClass({
    displayName: 'DLTemplate',

    mixins: [UniqueNodeTemplateMixin],

    triggerDL: function triggerDL() {

        this.setState({ downloadStarted: true });
        setTimeout((function () {
            this.props.pydio.Controller.fireAction("download");
            setTimeout((function () {
                this.setState({ downloadStarted: false });
            }).bind(this), 1500);
        }).bind(this), 100);
    },

    componentDidMount: function componentDidMount() {
        this.detectFirstNode();
        var pydio = this.props.pydio;
        if (pydio.user && pydio.user.activeRepository) {
            this.setState({
                repoObject: pydio.user.repositories.get(pydio.user.activeRepository)
            });
        } else {
            pydio.observe("repository_list_refreshed", (function (e) {
                var repositoryList = e.list;
                var repositoryId = e.active;
                if (repositoryList && repositoryList.has(repositoryId)) {
                    var repoObject = repositoryList.get(repositoryId);
                    this.setState({ repoObject: repoObject });
                }
            }).bind(this));
        }
    },

    render: function render() {
        var _this2 = this;

        var bgStyle = this.props.bgStyle;

        var style = _extends({}, bgStyle, {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%'
        });

        if (!this.props.pydio.user) {
            return React.createElement('div', { className: 'vertical_fit', style: _extends({}, style, { width: '100%' }) });
        }
        var name1 = undefined,
            name2 = undefined,
            name3 = undefined,
            owner = undefined;
        var classNames = ['download-block'];
        if (this.state && this.state.repoObject) {
            owner = this.state.repoObject.getOwner();
            name1 = '%1 shared'.replace('%1', owner);
            name2 = this.state.repoObject.getLabel();
            name3 = 'with you';
        }
        var click = null;
        var fileDetails = React.createElement(
            'div',
            { className: 'dl-details' },
            this.props.pydio.MessageHash[466]
        );
        if (this.state && this.state.node) {
            click = this.triggerDL.bind(this);
            fileDetails = React.createElement(
                'div',
                { className: 'dl-details' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'span',
                        { className: 'label' },
                        this.props.pydio.MessageHash[503]
                    ),
                    React.createElement(
                        'span',
                        { className: 'value' },
                        this.state.node.getMetadata().get('filesize')
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'click-legend' },
                    this.props.pydio.MessageHash['share_center.231']
                )
            );
        } else {
            classNames.push('not-ready');
        }
        if (this.state && this.state.downloadStarted) {
            classNames.push('dl-started');
        }
        var sharePageAction = this.props.pydio.Controller.getActionByName('share_current_page');
        var shareButton = undefined;
        if (sharePageAction && !sharePageAction.deny) {
            shareButton = React.createElement(
                'a',
                {
                    style: { display: 'block', textAlign: 'center', padding: 12, cursor: 'pointer' },
                    onTouchTap: function () {
                        _this2.setState({ displayShareLink: true });
                    } },
                sharePageAction.options.text
            );
        }
        return React.createElement(
            'div',
            { style: style },
            React.createElement(ConfigLogo, { pydio: this.props.pydio, style: { width: 230, margin: '-50px auto 0' } }),
            React.createElement(
                'div',
                { className: classNames.join(' '), onClick: click },
                React.createElement(
                    'span',
                    { className: 'dl-filename' },
                    React.createElement(
                        Textfit,
                        { min: 12, max: 25, perfectFit: false, mode: 'single' },
                        name2
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'dl-icon' },
                    React.createElement('span', { className: 'mdi mdi-file' }),
                    React.createElement('span', { className: 'mdi mdi-download' })
                ),
                fileDetails
            ),
            this.state && this.state.displayShareLink && React.createElement(
                'div',
                { style: { width: 267, margin: '10px auto', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '0px 10px', borderRadius: 2 } },
                React.createElement(ClipboardTextField, { floatingLabelText: sharePageAction.options.text, inputValue: document.location.href, getMessage: function (id) {
                        return _this2.props.pydio.MessageHash[id];
                    }, buttonStyle: { right: -8, bottom: 9 } })
            ),
            !(this.state && this.state.displayShareLink) && shareButton
        );
    }

});

DLTemplate = withProgressiveBg(DLTemplate);

var ConfigLogo = (function (_React$Component) {
    _inherits(ConfigLogo, _React$Component);

    function ConfigLogo() {
        _classCallCheck(this, ConfigLogo);

        _get(Object.getPrototypeOf(ConfigLogo.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ConfigLogo, [{
        key: 'render',
        value: function render() {
            var pluginName = 'action.advanced_settings';
            var pluginParameter = 'CUSTOM_MINISITE_LOGO';
            var pydio = this.props.pydio;

            var logo = pydio.Registry.getPluginConfigs(pluginName).get(pluginParameter);
            var url = undefined;
            if (!logo) {
                logo = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images/PydioLogo250.png';
            }
            if (logo) {
                if (logo.indexOf('plug/') === 0) {
                    url = logo;
                } else {
                    url = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + logo;
                }
            }
            return React.createElement('img', { src: url, style: this.props.style });
        }
    }]);

    return ConfigLogo;
})(React.Component);

var StandardLayout = React.createClass({
    displayName: 'StandardLayout',

    childContextTypes: {
        messages: React.PropTypes.object,
        getMessage: React.PropTypes.func,
        showSearchForm: React.PropTypes.bool
    },

    getChildContext: function getChildContext() {
        var messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function getMessage(messageId) {
                try {
                    return messages[messageId] || messageId;
                } catch (e) {
                    return messageId;
                }
            }
        };
    },

    getDefaultProps: function getDefaultProps() {
        return { minisiteMode: 'standard', uniqueNode: true };
    },

    render: function render() {

        var styles = {
            appBarStyle: {
                zIndex: 1,
                backgroundColor: this.props.muiTheme.palette.primary1Color,
                display: 'flex'
            },
            buttonsStyle: {
                color: this.props.muiTheme.appBar.textColor
            },
            iconButtonsStyle: {
                color: Color(this.props.muiTheme.palette.primary1Color).darken(0.4).toString()
            },
            raisedButtonStyle: {
                height: 30
            },
            raisedButtonLabelStyle: {
                height: 30,
                lineHeight: '30px'
            }
        };

        var _props = this.props;
        var minisiteMode = _props.minisiteMode;
        var showSearchForm = _props.showSearchForm;
        var uniqueNode = _props.uniqueNode;
        var skipDisplayToolbar = _props.skipDisplayToolbar;
        var bgStyle = _props.bgStyle;

        if (!this.props.pydio.user) {
            return React.createElement('div', { className: 'vertical_fit vertical_layout', style: bgStyle });
        }

        return React.createElement(
            'div',
            { className: 'vertical_fit vertical_layout', style: style },
            React.createElement(
                MaterialUI.Paper,
                { zDepth: 1, rounded: false, style: styles.appBarStyle },
                minisiteMode === 'embed' && React.createElement(ConfigLogo, { pydio: this.props.pydio, style: { height: 50 } }),
                React.createElement(
                    'div',
                    { style: { flex: 1, position: 'relative' } },
                    minisiteMode !== 'embed' && React.createElement(
                        'div',
                        { id: 'workspace_toolbar', style: { display: 'flex' } },
                        React.createElement(Breadcrumb, _extends({}, this.props, { rootStyle: { padding: 14, maxWidth: null } })),
                        showSearchForm && React.createElement(SearchForm, _extends({}, this.props, { uniqueSearchScope: 'ws', style: { marginTop: 5 } }))
                    ),
                    React.createElement(
                        'div',
                        { id: 'main_toolbar', style: { display: 'flex', padding: '0 8px' } },
                        !uniqueNode && React.createElement(
                            'span',
                            { style: { marginTop: 7 } },
                            React.createElement(ButtonMenu, _extends({}, this.props, { id: 'create-button-menu', toolbars: ["upload", "create"], buttonTitle: this.props.pydio.MessageHash['198'], raised: true, secondary: true, controller: this.props.pydio.Controller }))
                        ),
                        React.createElement(Toolbar, _extends({}, this.props, { id: 'main-toolbar', toolbars: uniqueNode ? ["minisite_toolbar"] : ["info_panel"], groupOtherList: uniqueNode ? [] : ["change_main", "more", "change", "remote"], renderingType: 'button', buttonStyle: styles.buttonsStyle })),
                        React.createElement('div', { style: { flex: 1 } }),
                        React.createElement(ListPaginator, { id: 'paginator-toolbar', dataModel: this.props.pydio.getContextHolder(), toolbarDisplay: true }),
                        !skipDisplayToolbar && !uniqueNode && React.createElement(Toolbar, _extends({}, this.props, { id: 'display-toolbar', toolbars: ["display_toolbar"], renderingType: 'icon-font', buttonStyle: styles.iconButtonsStyle }))
                    )
                ),
                minisiteMode !== 'embed' && React.createElement(ConfigLogo, { pydio: this.props.pydio, style: { height: 90 } })
            ),
            this.props.children,
            React.createElement(
                'span',
                { className: 'context-menu' },
                React.createElement(ContextMenu, { pydio: this.props.pydio })
            )
        );
    }

});

StandardLayout = withProgressiveBg(StandardLayout);
StandardLayout = dropProvider(StandardLayout);

var FolderMinisite = React.createClass({
    displayName: 'FolderMinisite',

    render: function render() {

        return React.createElement(
            StandardLayout,
            _extends({}, this.props, { uniqueNode: false, showSearchForm: this.props.pydio.getPluginConfigs('action.share').get('SHARED_FOLDER_SHOW_SEARCH') }),
            React.createElement(
                'div',
                { style: { backgroundColor: 'white' }, className: 'layout-fill vertical-layout' },
                React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props))
            ),
            React.createElement(EditionPanel, this.props)
        );
    }

});

var FileMinisite = React.createClass({
    displayName: 'FileMinisite',

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var _this3 = this;

        var pydio = nextProps.pydio;
        var node = nextProps.node;
        var dispatch = nextProps.dispatch;

        if (!node) {
            return;
        }

        pydio.UI.registerEditorOpener(this);

        var selectedMime = PathUtils.getAjxpMimeType(node);
        var editors = pydio.Registry.findEditorsForMime(selectedMime, false);
        if (editors.length && editors[0].openable) {
            (function () {

                var editorData = editors[0];

                pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                    var EditorClass = null;

                    if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                        _this3.setState({
                            error: "Cannot find editor component (" + editorData.editorClass + ")!"
                        });
                        return;
                    }

                    var tabId = dispatch(EditorActions.tabCreate({
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
                    })).id;

                    dispatch(EditorActions.editorSetActiveTab(tabId));
                });
            })();
        }
    },

    openEditorForNode: function openEditorForNode(node, editorData) {
        var _this4 = this;

        var dispatch = this.props.dispatch;

        pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
            var EditorClass = null;

            if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                _this4.setState({
                    error: "Cannot find editor component (" + editorData.editorClass + ")!"
                });
                return;
            }

            dispatch(EditorActions.tabModify({
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
            }));
        });
    },

    componentWillUnmount: function componentWillUnmount() {
        pydio.UI.unregisterEditorOpener(this);
    },

    render: function render() {

        return React.createElement(
            StandardLayout,
            _extends({}, this.props, { uniqueNode: true, skipDisplayToolbar: true }),
            React.createElement(
                'div',
                { className: 'editor_container vertical_layout vertical_fit', style: { backgroundColor: 'white' } },
                React.createElement(Editor, { displayToolbar: false, style: { display: "flex", flex: 1 } })
            )
        );
    }

});

var DropZoneMinisite = React.createClass({
    displayName: 'DropZoneMinisite',

    render: function render() {

        return React.createElement(
            StandardLayout,
            this.props,
            React.createElement(
                'div',
                { className: 'vertical_fit vertical_layout', style: { backgroundColor: 'white' } },
                React.createElement(
                    'div',
                    { className: 'minisite-dropzone vertical_fit vertical_layout' },
                    React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props))
                )
            ),
            React.createElement(EditionPanel, this.props)
        );
    }

});

var FilmStripMinisite = (function (_React$Component2) {
    _inherits(FilmStripMinisite, _React$Component2);

    function FilmStripMinisite() {
        _classCallCheck(this, FilmStripMinisite);

        _get(Object.getPrototypeOf(FilmStripMinisite.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(FilmStripMinisite, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            pydio.UI.registerEditorOpener(this);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            pydio.UI.unregisterEditorOpener(this);
        }
    }, {
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this5 = this;

            var pydio = nextProps.pydio;
            var node = nextProps.node;
            var dispatch = nextProps.dispatch;

            if (this.props.node) {
                dispatch(EditorActions.tabDelete(this.props.node.getLabel()));
            }

            if (!node || !node.isLeaf()) return;

            var selectedMime = PathUtils.getAjxpMimeType(node);
            var editors = pydio.Registry.findEditorsForMime(selectedMime, false);
            if (editors.length && editors[0].openable) {
                (function () {

                    var editorData = editors[0];

                    pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                        var EditorClass = null;

                        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                            _this5.setState({
                                error: "Cannot find editor component (" + editorData.editorClass + ")!"
                            });
                            return;
                        }

                        var tabId = dispatch(EditorActions.tabCreate({
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
                        })).id;

                        dispatch(EditorActions.editorSetActiveTab(tabId));
                    });
                })();
            }
        }
    }, {
        key: 'openEditorForNode',
        value: function openEditorForNode(node, editorData) {
            var _this6 = this;

            var dispatch = this.props.dispatch;

            if (!node.isLeaf()) return;
            pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                var EditorClass = null;

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    _this6.setState({
                        error: "Cannot find editor component (" + editorData.editorClass + ")!"
                    });
                    return;
                }

                dispatch(EditorActions.tabModify({
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
                }));
            });
        }
    }, {
        key: 'render',
        value: function render() {

            var node = this.props && this.props.node ? this.props.node : null;

            var editor = undefined;
            if (node && node.isLeaf()) {
                editor = React.createElement(Editor, { displayToolbar: false, style: { display: "flex", flex: 1 } });
            }

            return React.createElement(
                StandardLayout,
                _extends({}, this.props, { skipDisplayToolbar: true }),
                React.createElement(
                    'div',
                    { className: 'vertical_layout', style: { flex: 1, backgroundColor: '#424242', position: 'relative' } },
                    editor
                ),
                React.createElement(
                    MaterialUI.Paper,
                    { zDepth: 2, className: 'vertical_layout', style: { height: 160, backgroundColor: this.props.muiTheme.appBar.color, zIndex: 1 } },
                    React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props, { horizontalRibbon: true, displayMode: "grid-160" }))
                )
            );
        }
    }]);

    return FilmStripMinisite;
})(React.Component);

;

window.ShareTemplates = {
    FolderMinisite: (0, _materialUiStyles.muiThemeable)()(FolderMinisite),
    FileMinisite: (0, _redux.compose)(withUniqueNode(false), (0, _materialUiStyles.muiThemeable)(), (0, _reactRedux.connect)())(FileMinisite),
    DLTemplate: (0, _materialUiStyles.muiThemeable)()(DLTemplate),
    DropZoneMinisite: (0, _materialUiStyles.muiThemeable)()(DropZoneMinisite),
    FilmStripMinisite: (0, _redux.compose)(withUniqueNode(true), (0, _materialUiStyles.muiThemeable)(), (0, _reactRedux.connect)())(FilmStripMinisite)
};
