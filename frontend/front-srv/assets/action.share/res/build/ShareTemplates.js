'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _pydio = require('pydio');

var _pydio2 = _interopRequireDefault(_pydio);

var _materialUiStyles = require('material-ui/styles');

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _pydioUtilPath = require('pydio/util/path');

var _pydioUtilPath2 = _interopRequireDefault(_pydioUtilPath);

var _pydioUtilDom = require('pydio/util/dom');

var _pydioUtilDom2 = _interopRequireDefault(_pydioUtilDom);

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
var IconButtonMenu = _Pydio$requireLib2.IconButtonMenu;
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
                    return React.createElement(Component, _extends({}, this.props, this.state));
                }
            }]);

            return WithUniqueNode;
        })(React.PureComponent);
    };
};

var withRepositoriesListener = function withRepositoriesListener() {
    return function (Component) {

        return (function (_React$PureComponent2) {
            _inherits(WithRepositoriesListener, _React$PureComponent2);

            function WithRepositoriesListener(props) {
                _classCallCheck(this, WithRepositoriesListener);

                _get(Object.getPrototypeOf(WithRepositoriesListener.prototype), 'constructor', this).call(this, props);
                var pydio = props.pydio;

                this.state = { emptyUser: !pydio.user };
            }

            _createClass(WithRepositoriesListener, [{
                key: 'componentDidMount',
                value: function componentDidMount() {
                    var _this2 = this;

                    var pydio = this.props.pydio;

                    this._obs = function () {
                        return _this2.setState({ emptyUser: !pydio.user });
                    };
                    pydio.observe('repository_list_refreshed', this._obs);
                }
            }, {
                key: 'componentWillUnmount',
                value: function componentWillUnmount() {
                    var pydio = this.props.pydio;

                    pydio.stopObserving('repository_list_refreshed', this._obs);
                }
            }, {
                key: 'render',
                value: function render() {
                    return React.createElement(Component, _extends({}, this.props, this.state));
                }
            }]);

            return WithRepositoriesListener;
        })(React.PureComponent);
    };
};

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
                logo = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images/PydioLogoSquare.png';
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

var Copyright = (function (_React$Component2) {
    _inherits(Copyright, _React$Component2);

    function Copyright() {
        _classCallCheck(this, Copyright);

        _get(Object.getPrototypeOf(Copyright.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(Copyright, [{
        key: 'render',
        value: function render() {
            var _props = this.props;
            var mode = _props.mode;
            var style = _props.style;
            var aboutString = _props.aboutString;

            if (aboutString === "false") {
                return null;
            }
            var s = undefined;
            if (mode === "insert") {
                s = {
                    textAlign: 'right',
                    padding: '6px 16px',
                    backgroundColor: '#f7f7f7',
                    color: 'black'
                };
            } else if (mode === "overlay") {
                s = {
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    color: 'rgba(255,255,255,0.8)',
                    padding: '6px 16px'
                };
            } else if (mode === "block") {
                s = {
                    textAlign: 'center',
                    padding: '6px 16px',
                    color: 'rgba(255,255,255)'
                };
            }
            return React.createElement(
                'div',
                { style: _extends({}, s, style) },
                React.createElement(
                    'a',
                    { href: "https://pydio.com", style: { fontWeight: 500, color: s.color } },
                    'Pydio Cells'
                ),
                ' - secure file sharing'
            );
        }
    }]);

    return Copyright;
})(React.Component);

var StandardLayout = (0, _createReactClass2['default'])({

    childContextTypes: {
        messages: _propTypes2['default'].object,
        getMessage: _propTypes2['default'].func,
        showSearchForm: _propTypes2['default'].bool
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
        return { minisiteMode: 'embed', uniqueNode: true };
    },

    render: function render() {

        var styles = {
            appBarStyle: {
                zIndex: 1,
                backgroundColor: this.props.muiTheme.palette.primary1Color,
                display: 'flex',
                alignItems: 'center'
            },
            buttonsStyle: {
                color: Color(this.props.muiTheme.appBar.textColor).alpha(0.8).toString()
            }
        };

        var _props2 = this.props;
        var showSearchForm = _props2.showSearchForm;
        var uniqueNode = _props2.uniqueNode;
        var skipDisplayToolbar = _props2.skipDisplayToolbar;
        var bgStyle = _props2.bgStyle;
        var emptyUser = _props2.emptyUser;

        if (emptyUser) {
            return React.createElement('div', { className: 'vertical_fit vertical_layout', style: bgStyle });
        }
        var toolbars = [];
        if (uniqueNode) {
            toolbars.push("minisite_toolbar");
        } else {
            toolbars.push("info_panel");
            if (!skipDisplayToolbar) {
                toolbars.push("display_toolbar");
            }
        }

        return React.createElement(
            'div',
            { className: 'vertical_fit vertical_layout', style: bgStyle },
            React.createElement(
                MaterialUI.Paper,
                { zDepth: 1, rounded: false, style: styles.appBarStyle },
                React.createElement(ConfigLogo, { pydio: this.props.pydio, style: { height: 50 } }),
                React.createElement(
                    'div',
                    { id: 'workspace_toolbar', style: { display: 'flex', flex: 1, overflow: 'hidden' } },
                    React.createElement(Breadcrumb, _extends({}, this.props, { rootStyle: { padding: '0 14px', height: 36, lineHeight: '36px', maxWidth: null } })),
                    showSearchForm && React.createElement(SearchForm, _extends({}, this.props, { uniqueSearchScope: 'ws', style: { marginTop: 5 } }))
                ),
                React.createElement(
                    'div',
                    { style: { position: 'relative' } },
                    React.createElement(
                        'div',
                        { id: 'main_toolbar', style: { display: 'flex', padding: '0 8px' } },
                        !uniqueNode && React.createElement(IconButtonMenu, _extends({}, this.props, {
                            id: 'create-button-menu',
                            toolbars: ["upload", "create"],
                            buttonTitle: this.props.pydio.MessageHash['198'],
                            buttonClassName: "mdi mdi-folder-plus",
                            buttonStyle: { color: 'white' },
                            controller: this.props.pydio.Controller
                        })),
                        React.createElement('div', { style: { flex: 1 } }),
                        React.createElement(ListPaginator, { id: 'paginator-toolbar', dataModel: this.props.pydio.getContextHolder(), toolbarDisplay: true }),
                        React.createElement(Toolbar, _extends({}, this.props, { id: 'main-toolbar', toolbars: toolbars, groupOtherList: uniqueNode ? [] : ["change_main", "more", "change", "remote"], renderingType: 'icon-font', buttonStyle: styles.buttonsStyle }))
                    )
                )
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

var DLTemplate = (function (_React$Component3) {
    _inherits(DLTemplate, _React$Component3);

    function DLTemplate() {
        _classCallCheck(this, DLTemplate);

        _get(Object.getPrototypeOf(DLTemplate.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DLTemplate, [{
        key: 'triggerDL',
        value: function triggerDL() {

            this.setState({ downloadStarted: true });
            setTimeout((function () {
                this.props.pydio.Controller.fireAction("download");
                setTimeout((function () {
                    this.setState({ downloadStarted: false });
                }).bind(this), 1500);
            }).bind(this), 100);
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
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
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props3 = this.props;
            var bgStyle = _props3.bgStyle;
            var node = _props3.node;
            var emptyUser = _props3.emptyUser;

            var styles = {
                main: _extends({}, bgStyle, {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%'
                }),
                block: {
                    cursor: 'pointer',
                    width: 300,
                    margin: '0 auto',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.91)',
                    padding: 20,
                    borderRadius: 4,
                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
                },
                logo: {
                    width: 230,
                    margin: '-50px auto 0'
                },
                filename: {
                    fontSize: 22,
                    lineHeight: '22px',
                    wordBreak: 'break-all'
                },
                fileIcon: {
                    fontSize: 180,
                    color: this.props.muiTheme.palette.primary1Color
                },
                dlIcon: {
                    position: 'absolute',
                    top: 90,
                    left: 80,
                    fontSize: 60,
                    color: '#f4f4f4',
                    transition: _pydioUtilDom2['default'].getBeziersTransition()
                }
            };

            if (emptyUser) {
                return React.createElement('div', { className: 'vertical_fit', style: _extends({}, styles.main, { width: '100%' }) });
            }
            var fileName = undefined;
            var classNames = ['download-block'];
            if (this.state && this.state.repoObject) {
                fileName = this.state.repoObject.getLabel();
            }
            var click = null;
            var fileDetails = React.createElement(
                'div',
                { style: { fontSize: 13, lineHeight: '18px' } },
                this.props.pydio.MessageHash[466]
            );
            if (node) {
                click = this.triggerDL.bind(this);
                var bytesize = node.getMetadata().get('bytesize');
                var txtColor = 'rgba(0,0,0,.43)';
                fileDetails = React.createElement(
                    'div',
                    { style: { fontSize: 13, lineHeight: '18px', color: txtColor } },
                    React.createElement(
                        'div',
                        { style: { display: 'flex' } },
                        React.createElement(
                            'div',
                            { style: { flex: 1, textAlign: 'right', paddingRight: 6, fontWeight: 500 } },
                            this.props.pydio.MessageHash[503]
                        ),
                        React.createElement(
                            'div',
                            { style: { flex: 1, textAlign: 'left', color: 'rgba(0,0,0,.73)' } },
                            _pydioUtilPath2['default'].roundFileSize(bytesize)
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { fontSize: 12, marginTop: 10 } },
                        this.props.pydio.MessageHash['share_center.231']
                    )
                );
            }
            if (this.state && this.state.downloadStarted) {
                styles.dlIcon.opacity = .3;
            }
            var sharePageAction = this.props.pydio.Controller.getActionByName('share_current_page');
            var shareButton = undefined;
            if (sharePageAction && !sharePageAction.deny) {
                shareButton = React.createElement(
                    'a',
                    {
                        style: { display: 'block', textAlign: 'center', padding: 12, cursor: 'pointer' },
                        onClick: function () {
                            _this3.setState({ displayShareLink: true });
                        } },
                    sharePageAction.options.text
                );
            }
            return React.createElement(
                'div',
                { style: styles.main },
                React.createElement(ConfigLogo, { pydio: this.props.pydio, style: styles.logo }),
                React.createElement(
                    'div',
                    { className: classNames.join(' '), onClick: click, style: styles.block },
                    React.createElement(
                        'span',
                        { style: styles.filename },
                        React.createElement(
                            Textfit,
                            { min: 12, max: 25, perfectFit: false, mode: 'single' },
                            fileName
                        )
                    ),
                    React.createElement(
                        'div',
                        { style: { width: 220, margin: '0 auto', position: 'relative' } },
                        React.createElement('span', { style: styles.fileIcon, className: "mdi mdi-file" }),
                        React.createElement('span', { style: styles.dlIcon, className: 'mdi mdi-download' })
                    ),
                    fileDetails
                ),
                this.state && this.state.displayShareLink && React.createElement(
                    'div',
                    { style: { width: 267, margin: '10px auto', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '0px 10px', borderRadius: 2 } },
                    React.createElement(ClipboardTextField, { floatingLabelText: sharePageAction.options.text, inputValue: document.location.href, getMessage: function (id) {
                            return _this3.props.pydio.MessageHash[id];
                        }, buttonStyle: { right: -8, bottom: 9 } })
                ),
                React.createElement(Copyright, _extends({ mode: "block" }, this.props)),
                !(this.state && this.state.displayShareLink) && shareButton
            );
        }
    }]);

    return DLTemplate;
})(React.Component);

var FolderMinisite = (function (_React$Component4) {
    _inherits(FolderMinisite, _React$Component4);

    function FolderMinisite() {
        _classCallCheck(this, FolderMinisite);

        _get(Object.getPrototypeOf(FolderMinisite.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(FolderMinisite, [{
        key: 'render',
        value: function render() {

            return React.createElement(
                StandardLayout,
                _extends({}, this.props, { uniqueNode: false, showSearchForm: this.props.pydio.getPluginConfigs('action.share').get('SHARED_FOLDER_SHOW_SEARCH') }),
                React.createElement(
                    'div',
                    { style: { backgroundColor: 'white' }, className: 'layout-fill vertical-layout' },
                    React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props)),
                    React.createElement(Copyright, _extends({ mode: "insert" }, this.props))
                ),
                React.createElement(EditionPanel, this.props)
            );
        }
    }]);

    return FolderMinisite;
})(React.Component);

var FileMinisite = (function (_React$Component5) {
    _inherits(FileMinisite, _React$Component5);

    function FileMinisite() {
        _classCallCheck(this, FileMinisite);

        _get(Object.getPrototypeOf(FileMinisite.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(FileMinisite, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var _this4 = this;

            var pydio = nextProps.pydio;
            var node = nextProps.node;
            var dispatch = nextProps.dispatch;

            if (!node) {
                return;
            }

            pydio.UI.registerEditorOpener(this);

            var selectedMime = _pydioUtilPath2['default'].getAjxpMimeType(node);
            var editors = pydio.Registry.findEditorsForMime(selectedMime, false);
            if (editors.length && editors[0].openable) {
                (function () {

                    var editorData = editors[0];

                    pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                        var EditorClass = null;

                        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                            _this4.setState({
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
            var _this5 = this;

            var dispatch = this.props.dispatch;

            pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                var EditorClass = null;

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    _this5.setState({
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
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            pydio.UI.unregisterEditorOpener(this);
        }
    }, {
        key: 'render',
        value: function render() {

            return React.createElement(
                StandardLayout,
                _extends({}, this.props, { uniqueNode: true, skipDisplayToolbar: true }),
                React.createElement(
                    'div',
                    { className: 'editor_container vertical_layout vertical_fit', style: { backgroundColor: '#424242' } },
                    React.createElement(Editor, { displayToolbar: false, style: { display: "flex", flex: 1 } }),
                    React.createElement(Copyright, _extends({ mode: "overlay" }, this.props))
                )
            );
        }
    }]);

    return FileMinisite;
})(React.Component);

var DropZoneMinisite = (function (_React$Component6) {
    _inherits(DropZoneMinisite, _React$Component6);

    function DropZoneMinisite() {
        _classCallCheck(this, DropZoneMinisite);

        _get(Object.getPrototypeOf(DropZoneMinisite.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(DropZoneMinisite, [{
        key: 'render',
        value: function render() {

            return React.createElement(
                StandardLayout,
                this.props,
                React.createElement(
                    'div',
                    { className: 'vertical_fit vertical_layout', style: { backgroundColor: 'white' } },
                    React.createElement(
                        'div',
                        { className: 'vertical_fit vertical_layout', style: { margin: 16, marginBottom: 2, border: '2px dashed #CFD8DC', borderRadius: 4 } },
                        React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props))
                    ),
                    React.createElement(Copyright, _extends({ mode: "insert", style: { backgroundColor: 'white' } }, this.props))
                ),
                React.createElement(EditionPanel, this.props)
            );
        }
    }]);

    return DropZoneMinisite;
})(React.Component);

var FilmStripMinisite = (function (_React$Component7) {
    _inherits(FilmStripMinisite, _React$Component7);

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
            var _this6 = this;

            var pydio = nextProps.pydio;
            var node = nextProps.node;
            var dispatch = nextProps.dispatch;

            if (this.props.node) {
                dispatch(EditorActions.tabDelete(this.props.node.getLabel()));
            }

            if (!node || !node.isLeaf()) return;

            var selectedMime = _pydioUtilPath2['default'].getAjxpMimeType(node);
            var editors = pydio.Registry.findEditorsForMime(selectedMime, false);
            if (editors.length && editors[0].openable) {
                (function () {

                    var editorData = editors[0];

                    pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                        var EditorClass = null;

                        if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                            _this6.setState({
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
            var _this7 = this;

            var dispatch = this.props.dispatch;

            if (!node.isLeaf()) return;
            pydio.Registry.loadEditorResources(editorData.resourcesManager, function () {
                var EditorClass = null;

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    _this7.setState({
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
                React.createElement('div', { style: { height: 10, background: '#424242', zIndex: 1 } }),
                React.createElement(
                    'div',
                    { className: 'vertical_layout', style: { height: 176, backgroundColor: '#424242', zIndex: 1 } },
                    React.createElement(MainFilesList, _extends({ ref: 'list' }, this.props, { horizontalRibbon: true, displayMode: "grid-160" })),
                    React.createElement(Copyright, _extends({ mode: "insert" }, this.props))
                )
            );
        }
    }]);

    return FilmStripMinisite;
})(React.Component);

window.ShareTemplates = {
    FolderMinisite: (0, _redux.compose)((0, _materialUiStyles.muiThemeable)(), withRepositoriesListener())(FolderMinisite),
    FileMinisite: (0, _redux.compose)(withRepositoriesListener(), withUniqueNode(false), (0, _materialUiStyles.muiThemeable)(), (0, _reactRedux.connect)())(FileMinisite),
    DLTemplate: (0, _redux.compose)((0, _materialUiStyles.muiThemeable)(), withUniqueNode(false), withRepositoriesListener())(withProgressiveBg(DLTemplate)),
    DropZoneMinisite: (0, _redux.compose)((0, _materialUiStyles.muiThemeable)(), withRepositoriesListener())(DropZoneMinisite),
    FilmStripMinisite: (0, _redux.compose)(withRepositoriesListener(), withUniqueNode(true), (0, _materialUiStyles.muiThemeable)(), (0, _reactRedux.connect)())(FilmStripMinisite)
};
