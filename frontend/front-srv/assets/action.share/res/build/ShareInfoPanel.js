'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

(function (global) {
    var Loader = (function () {
        function Loader() {
            _classCallCheck(this, Loader);
        }

        _createClass(Loader, null, [{
            key: 'loadInfoPanel',
            value: function loadInfoPanel(container, node) {
                var mainCont = container.querySelectorAll("#ajxp_shared_info_panel .infoPanelTable")[0];
                mainCont.destroy = function () {
                    React.unmountComponentAtNode(mainCont);
                };
                mainCont.className += (mainCont.className ? ' ' : '') + 'infopanel-destroyable-pane';
                React.render(React.createElement(InfoPanel, { pydio: global.pydio, node: node }), mainCont);
            }
        }]);

        return Loader;
    })();

    var InfoPanelInputRow = React.createClass({
        displayName: 'InfoPanelInputRow',

        render: function render() {
            return React.createElement(
                'div',
                { className: 'infoPanelRow' },
                React.createElement(
                    'div',
                    { className: 'infoPanelLabel' },
                    this.props.getMessage(this.props.inputTitle)
                ),
                React.createElement(PydioComponents.ClipboardTextField, _extends({}, this.props, {
                    underlineShow: false

                }))
            );
        }

    });

    var TemplatePanel = React.createClass({
        displayName: 'TemplatePanel',

        propTypes: {
            node: React.PropTypes.instanceOf(AjxpNode),
            pydio: React.PropTypes.instanceOf(Pydio),
            getMessage: React.PropTypes.func,
            publicLink: React.PropTypes.string
        },

        getInitialState: function getInitialState() {
            return { show: false };
        },

        generateTplHTML: function generateTplHTML() {

            var editors = this.props.pydio.Registry.findEditorsForMime(this.props.node.getAjxpMime(), true);
            if (!editors.length) {
                return null;
            }
            var newLink = ReactModel.Share.buildDirectDownloadUrl(this.props.node, this.props.publicLink, true);
            var editor = FuncUtils.getFunctionByName(editors[0].editorClass, global);
            if (editor && editor.getSharedPreviewTemplate) {
                return {
                    messageKey: 61,
                    templateString: editor.getSharedPreviewTemplate(this.props.node, newLink, { WIDTH: 350, HEIGHT: 350, DL_CT_LINK: newLink })
                };
            } else {
                return {
                    messageKey: 60,
                    templateString: newLink
                };
            }
        },

        render: function render() {
            var data = this.generateTplHTML();
            if (!data) {
                return null;
            }
            return React.createElement(InfoPanelInputRow, {
                inputTitle: data.messageKey,
                inputValue: data.templateString,
                inputClassName: 'share_info_panel_link',
                getMessage: this.props.getMessage,
                inputCopyMessage: '229'
            });
        }

    });

    var InfoPanel = React.createClass({
        displayName: 'InfoPanel',

        propTypes: {
            node: React.PropTypes.instanceOf(AjxpNode),
            pydio: React.PropTypes.instanceOf(Pydio)
        },

        getInitialState: function getInitialState() {
            return {
                status: 'loading',
                model: new ReactModel.Share(this.props.pydio, this.props.node)
            };
        },

        componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
            var _this = this;

            if (nextProps.node && nextProps.node !== this.props.node) {
                (function () {
                    var model = new ReactModel.Share(_this.props.pydio, nextProps.node);
                    _this.setState({
                        status: 'loading',
                        model: model
                    }, (function () {
                        model.observe("status_changed", this.modelUpdated);
                        model.initLoad();
                    }).bind(_this));
                })();
            }
        },

        componentDidMount: function componentDidMount() {
            this.state.model.observe("status_changed", this.modelUpdated);
            this.state.model.initLoad();
        },

        modelUpdated: function modelUpdated() {
            if (this.isMounted()) {
                this.setState({ status: this.state.model.getStatus() });
            }
        },

        getMessage: function getMessage(id) {
            try {
                return this.props.pydio.MessageHash['share_center.' + id];
            } catch (e) {
                return id;
            }
        },

        render: function render() {
            if (this.state.model.hasPublicLink()) {
                var linkData = this.state.model.getPublicLinks()[0];
                var isExpired = linkData["is_expired"];

                // Main Link Field
                var linkField = React.createElement(InfoPanelInputRow, {
                    inputTitle: '121',
                    inputValue: linkData['public_link'],
                    inputClassName: "share_info_panel_link" + (isExpired ? " share_info_panel_link_expired" : ""),
                    getMessage: this.getMessage,
                    inputCopyMessage: '192'
                });
                if (this.props.node.isLeaf() && this.props.pydio.getPluginConfigs("action.share").get("INFOPANEL_DISPLAY_DIRECT_DOWNLOAD")) {
                    // Direct Download Field
                    var downloadField = React.createElement(InfoPanelInputRow, {
                        inputTitle: '60',
                        inputValue: ReactModel.Share.buildDirectDownloadUrl(this.props.node, linkData['public_link']),
                        inputClassName: 'share_info_panel_link',
                        getMessage: this.getMessage,
                        inputCopyMessage: '192'
                    });
                }
                if (this.props.node.isLeaf() && this.props.pydio.getPluginConfigs("action.share").get("INFOPANEL_DISPLAY_HTML_EMBED")) {
                    // HTML Code Snippet (may be empty)
                    var templateField = React.createElement(TemplatePanel, _extends({}, this.props, {
                        getMessage: this.getMessage,
                        publicLink: linkData.public_link
                    }));
                }
            }
            var users = this.state.model.getSharedUsers();
            var sharedUsersEntries = [],
                remoteUsersEntries = [],
                sharedUsersBlock = undefined;
            var pydio = this.props.pydio;

            if (users.length) {
                sharedUsersEntries = users.map(function (u) {
                    var rights = [];
                    if (u.RIGHT.indexOf('read') !== -1) rights.push(global.MessageHash["share_center.31"]);
                    if (u.RIGHT.indexOf('write') !== -1) rights.push(global.MessageHash["share_center.181"]);
                    var userType = u.TYPE === 'team' ? 'team' : u.TYPE === 'group' ? 'group' : 'user';
                    return React.createElement(
                        'div',
                        { key: u.ID, className: 'uUserEntry', title: rights.join(' & '), style: { padding: '10px 0' } },
                        React.createElement(PydioComponents.UserAvatar, {
                            useDefaultAvatar: true,
                            userId: u.ID,
                            userLabel: u.LABEL,
                            userType: userType,
                            pydio: pydio,
                            style: { flex: 1, display: 'flex', alignItems: 'center' },
                            labelStyle: { fontSize: 15, paddingLeft: 10 },
                            avatarSize: 30,
                            richOnHover: true
                        })
                    );
                });
            }
            var ocsLinks = this.state.model.getOcsLinks();
            if (ocsLinks.length) {
                remoteUsersEntries = ocsLinks.map((function (link) {
                    var i = link['invitation'];
                    var status = undefined;
                    if (!i) {
                        status = '214';
                    } else {
                        if (i.STATUS == 1) {
                            status = '211';
                        } else if (i.STATUS == 2) {
                            status = '212';
                        } else if (i.STATUS == 4) {
                            status = '213';
                        }
                    }
                    status = this.getMessage(status);

                    return React.createElement(
                        'div',
                        { key: "remote-" + link.hash, className: 'uUserEntry', style: { padding: '10px 0' } },
                        React.createElement(PydioComponents.UserAvatar, {
                            useDefaultAvatar: true,
                            userId: "remote-" + link.hash,
                            userLabel: i.USER + '@' + i.HOST,
                            userType: 'remote',
                            pydio: pydio,
                            style: { flex: 1, display: 'flex', alignItems: 'center' },
                            labelStyle: { fontSize: 15, paddingLeft: 10 },
                            avatarSize: 30,
                            richOnHover: true
                        })
                    );
                }).bind(this));
            }
            if (sharedUsersEntries.length || remoteUsersEntries.length) {
                sharedUsersBlock = React.createElement(
                    'div',
                    { className: 'infoPanelRow', style: { paddingTop: 10 } },
                    React.createElement(
                        'div',
                        { className: 'infoPanelLabel' },
                        this.getMessage('54')
                    ),
                    React.createElement(
                        'div',
                        { className: 'infoPanelValue' },
                        sharedUsersEntries,
                        remoteUsersEntries
                    )
                );
            }
            if (this.state.model.getStatus() !== 'loading' && !sharedUsersEntries.length && !remoteUsersEntries.length && !this.state.model.hasPublicLink()) {
                var func = (function () {
                    this.state.model.stopSharing();
                }).bind(this);
                var noEntriesFoundBlock = React.createElement(
                    'div',
                    { className: 'infoPanelRow' },
                    React.createElement(
                        'div',
                        { className: 'infoPanelValue' },
                        this.getMessage(232),
                        ' ',
                        React.createElement(
                            'a',
                            { style: { textDecoration: 'underline', cursor: 'pointer' }, onClick: func },
                            this.getMessage(233)
                        )
                    )
                );
            }

            return React.createElement(
                'div',
                { style: { padding: 0 } },
                React.createElement(
                    'div',
                    { style: { padding: '0px 16px' } },
                    linkField,
                    downloadField,
                    templateField
                ),
                React.createElement(
                    'div',
                    { style: { padding: '0px 16px' } },
                    sharedUsersBlock,
                    noEntriesFoundBlock
                )
            );
        }

    });

    var ReactInfoPanel = React.createClass({
        displayName: 'ReactInfoPanel',

        render: function render() {

            var actions = [React.createElement(MaterialUI.FlatButton, {
                key: 'edit-share',
                label: this.props.pydio.MessageHash['share_center.125'],
                primary: true,
                onTouchTap: function () {
                    global.pydio.getController().fireAction("share-edit-shared");
                }
            })];

            return React.createElement(
                PydioWorkspaces.InfoPanelCard,
                { title: this.props.pydio.MessageHash['share_center.50'], actions: actions, icon: 'share-variant', iconColor: '#009688', iconStyle: { fontSize: 13, display: 'inline-block', paddingTop: 3 } },
                React.createElement(InfoPanel, this.props)
            );
        }

    });

    global.ShareInfoPanel = {};
    global.ShareInfoPanel.loader = Loader.loadInfoPanel;
    global.ShareInfoPanel.InfoPanel = ReactInfoPanel;
})(window);
