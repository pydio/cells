(function(global){

    class Loader{

        static loadInfoPanel(container, node){
            let mainCont = container.querySelectorAll("#ajxp_shared_info_panel .infoPanelTable")[0];
            mainCont.destroy = function(){
                React.unmountComponentAtNode(mainCont);
            };
            mainCont.className += (mainCont.className ? ' ' : '') + 'infopanel-destroyable-pane';
            React.render(
                React.createElement(InfoPanel, {pydio:global.pydio, node:node}),
                mainCont
            );
        }
    }

    const InfoPanelInputRow = React.createClass({

        render: function(){
            return (
                <div className="infoPanelRow">
                    <div className="infoPanelLabel">{this.props.getMessage(this.props.inputTitle)}</div>
                    <PydioComponents.ClipboardTextField
                        {...this.props}
                        underlineShow={false}

                    />
                </div>
            );
        }

    });


    const TemplatePanel = React.createClass({

        propTypes: {
            node:React.PropTypes.instanceOf(AjxpNode),
            pydio:React.PropTypes.instanceOf(Pydio),
            getMessage:React.PropTypes.func,
            publicLink:React.PropTypes.string
        },

        getInitialState:function(){
            return {show: false};
        },

        generateTplHTML: function(){

            let editors = this.props.pydio.Registry.findEditorsForMime(this.props.node.getAjxpMime(), true);
            if(!editors.length){
                return null;
            }
            let newLink = ReactModel.Share.buildDirectDownloadUrl(this.props.node, this.props.publicLink, true);
            let editor = FuncUtils.getFunctionByName(editors[0].editorClass, global);
            if(editor && editor.getSharedPreviewTemplate){
                return {
                    messageKey:61,
                    templateString:editor.getSharedPreviewTemplate(this.props.node, newLink, {WIDTH:350, HEIGHT:350, DL_CT_LINK:newLink})
                };
            }else{
                return{
                    messageKey:60,
                    templateString:newLink
                }
            }

        },

        render : function(){
            let data = this.generateTplHTML();
            if(!data){
                return null;
            }
            return <InfoPanelInputRow
                inputTitle={data.messageKey}
                inputValue={data.templateString}
                inputClassName="share_info_panel_link"
                getMessage={this.props.getMessage}
                inputCopyMessage="229"
            />;
        }

    });

    const InfoPanel = React.createClass({

        propTypes: {
            node:React.PropTypes.instanceOf(AjxpNode),
            pydio:React.PropTypes.instanceOf(Pydio)
        },

        getInitialState: function(){
            return {
                status:'loading',
                model : new ReactModel.Share(this.props.pydio, this.props.node)
            };
        },

        componentWillReceiveProps: function(nextProps){
            if(nextProps.node && nextProps.node !== this.props.node){
                const model = new ReactModel.Share(this.props.pydio, nextProps.node);
                this.setState({
                    status:'loading',
                    model : model
                }, function(){
                    model.observe("status_changed", this.modelUpdated);
                    model.initLoad();
                }.bind(this))
            }
        },

        componentDidMount:function(){
            this.state.model.observe("status_changed", this.modelUpdated);
            this.state.model.initLoad();
        },

        modelUpdated: function(){
            if(this.isMounted()){
                this.setState({status:this.state.model.getStatus()});
            }
        },

        getMessage: function(id){
            try{
                return this.props.pydio.MessageHash['share_center.' + id];
            }catch(e){
                return id;
            }
        },

        render: function(){
            if(this.state.model.hasPublicLink()){
                var linkData = this.state.model.getPublicLinks()[0];
                var isExpired = linkData["is_expired"];

                // Main Link Field
                var linkField = (<InfoPanelInputRow
                    inputTitle="121"
                    inputValue={linkData['public_link']}
                    inputClassName={"share_info_panel_link" + (isExpired?" share_info_panel_link_expired":"")}
                    getMessage={this.getMessage}
                    inputCopyMessage="192"
                />);
                if(this.props.node.isLeaf() && this.props.pydio.getPluginConfigs("action.share").get("INFOPANEL_DISPLAY_DIRECT_DOWNLOAD")){
                    // Direct Download Field
                    var downloadField = <InfoPanelInputRow
                        inputTitle="60"
                        inputValue={ReactModel.Share.buildDirectDownloadUrl(this.props.node, linkData['public_link'])}
                        inputClassName="share_info_panel_link"
                        getMessage={this.getMessage}
                        inputCopyMessage="192"
                    />;
                }
                if(this.props.node.isLeaf() && this.props.pydio.getPluginConfigs("action.share").get("INFOPANEL_DISPLAY_HTML_EMBED")){
                    // HTML Code Snippet (may be empty)
                    var templateField = <TemplatePanel
                        {...this.props}
                        getMessage={this.getMessage}
                        publicLink={linkData.public_link}
                    />;
                }
            }
            const users = this.state.model.getSharedUsers();
            let sharedUsersEntries = [], remoteUsersEntries = [], sharedUsersBlock;
            const {pydio} = this.props;
            if(users.length){
                sharedUsersEntries = users.map(function(u){
                    let rights = [];
                    if(u.RIGHT.indexOf('read') !== -1) rights.push(global.MessageHash["share_center.31"]);
                    if(u.RIGHT.indexOf('write') !== -1) rights.push(global.MessageHash["share_center.181"]);
                    const userType = (u.TYPE === 'team' ? 'team' : (u.TYPE === 'group'  ? 'group' : 'user'))
                    return (
                        <div key={u.ID} className="uUserEntry" title={rights.join(' & ')} style={{padding:'10px 0'}}>
                            <PydioComponents.UserAvatar
                                useDefaultAvatar={true}
                                userId={u.ID}
                                userLabel={u.LABEL}
                                userType={userType}
                                pydio={pydio}
                                style={{flex:1, display:'flex', alignItems:'center'}}
                                labelStyle={{fontSize: 15, paddingLeft: 10}}
                                avatarSize={30}
                                richOnHover={true}
                            />
                        </div>
                    );
                });
            }
            const ocsLinks = this.state.model.getOcsLinks();
            if(ocsLinks.length){
                remoteUsersEntries = ocsLinks.map(function(link){
                    const i = link['invitation'];
                    let status;
                    if(!i){
                        status = '214';
                    }else {
                        if(i.STATUS == 1){
                            status = '211';
                        }else if(i.STATUS == 2){
                            status = '212';
                        }else if(i.STATUS == 4){
                            status = '213';
                        }
                    }
                    status = this.getMessage(status);

                    return (
                        <div key={"remote-"+link.hash} className="uUserEntry" style={{padding:'10px 0'}}>
                            <PydioComponents.UserAvatar
                                useDefaultAvatar={true}
                                userId={"remote-"+link.hash}
                                userLabel={i.USER + '@'+ i.HOST}
                                userType={'remote'}
                                pydio={pydio}
                                style={{flex:1, display:'flex', alignItems:'center'}}
                                labelStyle={{fontSize: 15, paddingLeft: 10}}
                                avatarSize={30}
                                richOnHover={true}
                            />
                        </div>
                    );
                }.bind(this));
            }
            if(sharedUsersEntries.length || remoteUsersEntries.length){
                sharedUsersBlock = (
                    <div className="infoPanelRow" style={{paddingTop:10}}>
                        <div className="infoPanelLabel">{this.getMessage('54')}</div>
                        <div className="infoPanelValue">
                            {sharedUsersEntries}
                            {remoteUsersEntries}
                        </div>
                    </div>
                );
            }
            if(this.state.model.getStatus() !== 'loading' && !sharedUsersEntries.length
                && !remoteUsersEntries.length && !this.state.model.hasPublicLink()){
                let func = function(){
                    this.state.model.stopSharing();
                }.bind(this);
                var noEntriesFoundBlock = (
                    <div className="infoPanelRow">
                        <div className="infoPanelValue">{this.getMessage(232)} <a style={{textDecoration:'underline',cursor:'pointer'}} onClick={func}>{this.getMessage(233)}</a></div>
                    </div>
                );
            }

            return (
                <div style={{padding: 0}}>
                    <div style={{padding: '0px 16px'}}>
                    {linkField}
                    {downloadField}
                    {templateField}
                    </div>
                    <div style={{padding: '0px 16px'}}>
                    {sharedUsersBlock}
                    {noEntriesFoundBlock}
                    </div>
                </div>
            );
        }

    });

    const ReactInfoPanel = React.createClass({

        render: function(){

            let actions = [
                <MaterialUI.FlatButton
                    key="edit-share"
                    label={this.props.pydio.MessageHash['share_center.125']}
                    primary={true}
                    onTouchTap={()=>{global.pydio.getController().fireAction("share-edit-shared");}}
                />
            ];

            return (
                <PydioWorkspaces.InfoPanelCard title={this.props.pydio.MessageHash['share_center.50']} actions={actions} icon="share-variant" iconColor="#009688" iconStyle={{fontSize:13, display:'inline-block', paddingTop:3}}>
                    <InfoPanel {...this.props}/>
                </PydioWorkspaces.InfoPanelCard>
            );

        }

    });

    global.ShareInfoPanel = {};
    global.ShareInfoPanel.loader = Loader.loadInfoPanel;
    global.ShareInfoPanel.InfoPanel = ReactInfoPanel;


})(window);
