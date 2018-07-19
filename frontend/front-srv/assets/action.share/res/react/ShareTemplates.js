const {Textfit} = require('react-textfit');
import Pydio from 'pydio'
const Color = require('color');
import {muiThemeable} from 'material-ui/styles';
import {connect} from 'react-redux';
import {compose} from 'redux';

const { Breadcrumb, SearchForm, MainFilesList, Editor, EditionPanel } = Pydio.requireLib('workspaces');
const { ContextMenu, ButtonMenu, Toolbar, ListPaginator, ClipboardTextField } = Pydio.requireLib('components');
const { BackgroundImage } = Pydio.requireLib('boot');
const { EditorActions, dropProvider } = Pydio.requireLib('hoc');

const withUniqueNode = (attachListener) => (Component) => {
    return class WithUniqueNode extends React.PureComponent {

        componentDidMount() {
            this.detectFirstNode()
        }

        detectFirstNode() {
            let dm = this.props.pydio.getContextHolder();

            if (!dm.getSelectedNodes().length) {
                let first = dm.getRootNode().getFirstChildIfExists();
                if (first) {
                    dm.setSelectedNodes([first], "dataModel");
                    this.setState({node: first});
                } else {
                    setTimeout(() => this.detectFirstNode(), 1000);
                }
            } else {
                if (!this.state || !this.state.node) {
                    this.setState({node: dm.getSelectedNodes()[0]});
                }
            }
            if(attachListener){
                dm.observe("selection_changed", function(){
                    let selection = dm.getSelectedNodes();
                    if(selection.length) this.setState({node: selection[0]});
                    else this.setState({node: null});
                }.bind(this));
            }
        }

        render() {
            return (
                <Component {...this.props} node={this.state && this.state.node}  />
            )
        }
    }
}

const UniqueNodeTemplateMixin = {

    detectFirstNode: function(attachListener = false){
        let dm = this.props.pydio.getContextHolder();
        if(!dm.getSelectedNodes().length) {
            let first = dm.getRootNode().getFirstChildIfExists();
            if (first) {
                dm.setSelectedNodes([first], "dataModel");
                this.setState({node: first});
            }else{
                setTimeout(this.detectFirstNode.bind(this), 1000);
            }
        }else{
            if(!this.state || !this.state.node){
                this.setState({node: dm.getSelectedNodes()[0]});
            }
        }
        if(attachListener){
            dm.observe("selection_changed", function(){
                let selection = dm.getSelectedNodes();
                if(selection.length) this.setState({node: selection[0]});
                else this.setState({node: null});
            }.bind(this));
        }
    }

}

const DLTemplate = React.createClass({

    mixins:[UniqueNodeTemplateMixin],

    triggerDL: function(){

        this.setState({downloadStarted: true});
        setTimeout(function(){
            this.props.pydio.Controller.fireAction("download");
                setTimeout(function(){
                    this.setState({downloadStarted: false});
                }.bind(this), 1500);
        }.bind(this), 100);

    },

    componentDidMount: function(){
        this.detectFirstNode();
        let pydio = this.props.pydio;
        if(pydio.user && pydio.user.activeRepository){
            this.setState({
                repoObject:pydio.user.repositories.get(pydio.user.activeRepository)
            });
        }else{
            pydio.observe("repository_list_refreshed", function(e){
                let repositoryList = e.list;
                let repositoryId = e.active;
                if(repositoryList && repositoryList.has(repositoryId)){
                    var repoObject = repositoryList.get(repositoryId);
                    this.setState({repoObject: repoObject});
                }
            }.bind(this));
        }
    },

    render: function(){

        let style = {};
        if(this.props.imageBackgroundFromConfigs){
            if(PydioReactUI.BackgroundImage.SESSION_IMAGE){
                style = PydioReactUI.BackgroundImage.SESSION_IMAGE;
            }else{
                style = PydioReactUI.BackgroundImage.getImageBackgroundFromConfig(this.props.imageBackgroundFromConfigs);
                PydioReactUI.BackgroundImage.SESSION_IMAGE = style;
            }
        }
        style = {...style,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%'
        };

        if(!this.props.pydio.user){
            return <div className="vertical_fit" style={{...style, width:'100%'}}></div>;
        }
        let name1, name2, name3, owner;
        let classNames = ['download-block'];
        if(this.state && this.state.repoObject){
            owner = this.state.repoObject.getOwner();
            name1 = '%1 shared'.replace('%1', owner);
            name2 = this.state.repoObject.getLabel();
            name3 = 'with you';
        }
        let click = null;
        let fileDetails = <div className="dl-details">{this.props.pydio.MessageHash[466]}</div> ;
        if(this.state && this.state.node){
            click = this.triggerDL.bind(this);
            fileDetails = (
                <div className="dl-details">
                    <div className="row">
                        <span className="label">{this.props.pydio.MessageHash[503]}</span>
                        <span className="value">{this.state.node.getMetadata().get('filesize')}</span>
                    </div>
                    <div className="click-legend">{this.props.pydio.MessageHash['share_center.231']}</div>
                </div>
            );
        }else{
            classNames.push('not-ready');
        }
        if(this.state && this.state.downloadStarted){
            classNames.push('dl-started');
        }
        let sharePageAction = this.props.pydio.Controller.getActionByName('share_current_page');
        let shareButton;
        if(sharePageAction && !sharePageAction.deny){
            shareButton = (
                <a
                    style={{display:'block',textAlign:'center', padding: 12, cursor: 'pointer'}}
                    onTouchTap={() => {this.setState({displayShareLink: true})}}>{sharePageAction.options.text}</a>
            );
        }
        return (
            <div style={style}>
                <ConfigLogo pydio={this.props.pydio} style={{width:230, margin:'-50px auto 0'}}/>
                <div className={classNames.join(' ')} onClick={click}>
                    <span className="dl-filename"><Textfit min={12} max={25} perfectFit={false} mode="single">{name2}</Textfit></span>
                    <div className="dl-icon">
                        <span className="mdi mdi-file"/>
                        <span className="mdi mdi-download"/>
                    </div>
                    {fileDetails}
                </div>
                {this.state && this.state.displayShareLink &&
                    <div style={{width: 267, margin: '10px auto', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '0px 10px', borderRadius: 2}}>
                        <ClipboardTextField floatingLabelText={sharePageAction.options.text} inputValue={document.location.href} getMessage={(id)=>this.props.pydio.MessageHash[id]} buttonStyle={{right:-8, bottom:9}} />
                    </div>
                }
                {!(this.state && this.state.displayShareLink) &&
                    shareButton
                }
            </div>
        );

    }

});


class ConfigLogo extends React.Component{

    render(){
        const pluginName = 'action.advanced_settings';
        const pluginParameter = 'CUSTOM_MINISITE_LOGO';
        const {pydio} = this.props;

        let logo = pydio.Registry.getPluginConfigs(pluginName).get(pluginParameter);
        let url;
        if(!logo){
            logo = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images/PydioLogo250.png';
        }
        if(logo){
            if(logo.indexOf('plug/') === 0){
                url = logo;
            }else{
                url = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + logo;
            }
        }
        return <img src={url} style={this.props.style}/>
    }
}

let StandardLayout = React.createClass({

    childContextTypes: {
        messages:React.PropTypes.object,
        getMessage:React.PropTypes.func,
        showSearchForm: React.PropTypes.bool
    },

    getChildContext: function() {
        const messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function(messageId){
                try{
                    return messages[messageId] || messageId;
                }catch(e){
                    return messageId;
                }
            }
        };
    },

    getDefaultProps: function(){
        return {minisiteMode: 'standard', uniqueNode:true};
    },

    render: function(){

        const styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: this.props.muiTheme.palette.primary1Color,
                display:'flex'
            },
            buttonsStyle : {
                color: this.props.muiTheme.appBar.textColor
            },
            iconButtonsStyle :{
                color: Color(this.props.muiTheme.palette.primary1Color).darken(0.4).toString()
            },
            raisedButtonStyle : {
                height: 30
            },
            raisedButtonLabelStyle : {
                height: 30,
                lineHeight: '30px'
            }
        }

        let style = {};
        if(this.props.imageBackgroundFromConfigs){
            if(BackgroundImage.SESSION_IMAGE){
                style = BackgroundImage.SESSION_IMAGE;
            }else{
                style = BackgroundImage.getImageBackgroundFromConfig(this.props.imageBackgroundFromConfigs);
                BackgroundImage.SESSION_IMAGE = style;
            }
        }

        const {minisiteMode, showSearchForm, uniqueNode, skipDisplayToolbar} = this.props;

        if(!this.props.pydio.user){
            return <div className="vertical_fit vertical_layout" style={style}/>;
        }

        return (
            <div className="vertical_fit vertical_layout" style={style}>
                <MaterialUI.Paper zDepth={1} rounded={false} style={styles.appBarStyle}>
                    {minisiteMode === 'embed' &&
                        <ConfigLogo pydio={this.props.pydio} style={{height:50}}/>
                    }
                    <div style={{flex:1, position:'relative'}}>
                        {minisiteMode !== 'embed' &&
                            <div id="workspace_toolbar" style={{display:'flex'}}>
                                <Breadcrumb {...this.props} rootStyle={{padding: 14, maxWidth:null}}/>
                                {showSearchForm && <SearchForm {...this.props} uniqueSearchScope="ws" style={{marginTop: 5}}/>}
                            </div>
                        }
                        <div id="main_toolbar" style={{display:'flex', padding: '0 8px'}}>
                            {!uniqueNode &&
                                <span style={{marginTop:7}}>
                                    <ButtonMenu {...this.props} id="create-button-menu" toolbars={["upload", "create"]} buttonTitle={this.props.pydio.MessageHash['198']} raised={true} secondary={true} controller={this.props.pydio.Controller}/>
                                </span>
                            }
                            <Toolbar {...this.props} id="main-toolbar" toolbars={uniqueNode ? ["minisite_toolbar"] : ["info_panel"]} groupOtherList={uniqueNode ? [] : ["change_main", "more", "change", "remote"]} renderingType="button" buttonStyle={styles.buttonsStyle}/>
                            <div style={{flex:1}}></div>
                            <ListPaginator id="paginator-toolbar" dataModel={this.props.pydio.getContextHolder()} toolbarDisplay={true}/>
                            {!skipDisplayToolbar && !uniqueNode &&
                                <Toolbar {...this.props} id="display-toolbar" toolbars={["display_toolbar"]} renderingType="icon-font" buttonStyle={styles.iconButtonsStyle}/>
                            }
                        </div>
                    </div>
                    {minisiteMode !== 'embed' &&
                        <ConfigLogo pydio={this.props.pydio} style={{height:90}}/>
                    }
                </MaterialUI.Paper>
                {this.props.children}
                <span className="context-menu"><ContextMenu pydio={this.props.pydio}/></span>
            </div>
        );

    }

});

StandardLayout = dropProvider(StandardLayout);

const FolderMinisite = React.createClass({

    render: function(){

        return (
            <StandardLayout {...this.props} uniqueNode={false} showSearchForm={this.props.pydio.getPluginConfigs('action.share').get('SHARED_FOLDER_SHOW_SEARCH')}>
                <div style={{backgroundColor:'white'}} className="layout-fill vertical-layout">
                    <MainFilesList ref="list" {...this.props}/>
                </div>
                <EditionPanel {...this.props}/>
            </StandardLayout>
        );

    }

});

const FileMinisite = React.createClass({

    componentWillReceiveProps(nextProps) {

        const {pydio, node, dispatch} = nextProps

        if (!node) return

        pydio.UI.registerEditorOpener(this);

        const selectedMime = PathUtils.getAjxpMimeType(node);
        const editors = pydio.Registry.findEditorsForMime(selectedMime, false);
        if (editors.length && editors[0].openable) {

            const editorData = editors[0]

            pydio.Registry.loadEditorResources(
                editorData.resourcesManager,
                () => {
                    let EditorClass = null

                    if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                        this.setState({
                            error: "Cannot find editor component (" + editorData.editorClass + ")!"
                        })
                        return
                    }

                    let tabId = dispatch(EditorActions.tabCreate({
                        id: node.getLabel(),
                        title: node.getLabel(),
                        url: node.getPath(),
                        icon: PydioWorkspaces.FilePreview,
                        Editor: EditorClass.Editor,
                        Controls: EditorClass.Controls,
                        pydio,
                        node,
                        editorData,
                        registry: pydio.Registry
                    })).id

                    dispatch(EditorActions.editorSetActiveTab(tabId))
                }
            )
        }
    },

    openEditorForNode(node, editorData) {
        const {dispatch} = this.props

        pydio.Registry.loadEditorResources(
            editorData.resourcesManager,
            () => {
                let EditorClass = null

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    this.setState({
                        error: "Cannot find editor component (" + editorData.editorClass + ")!"
                    })
                    return
                }

                dispatch(EditorActions.tabModify({
                    id: node.getLabel(),
                    title: node.getLabel(),
                    url: node.getPath(),
                    icon: PydioWorkspaces.FilePreview,
                    Editor: EditorClass.Editor,
                    Controls: EditorClass.Controls,
                    pydio,
                    node,
                    editorData,
                    registry: pydio.Registry
                }))
            }
        )
    },

    componentWillUnmount() {
        pydio.UI.unregisterEditorOpener(this);
    },

    render: function(){

        return (
            <StandardLayout {...this.props} uniqueNode={true} skipDisplayToolbar={true}>
                <div className="editor_container vertical_layout vertical_fit" style={{backgroundColor:'white'}}>
                    <Editor displayToolbar={false} style={{display: "flex", flex: 1}}/>
                </div>
            </StandardLayout>
        );


    }

});

const DropZoneMinisite = React.createClass({

    render: function(){

        return (
            <StandardLayout {...this.props}>
                <div className="vertical_fit vertical_layout" style={{backgroundColor:'white'}}>
                    <div className="minisite-dropzone vertical_fit vertical_layout">
                        <MainFilesList ref="list" {...this.props}/>
                    </div>
                </div>
                <EditionPanel {...this.props}/>
            </StandardLayout>
        );

    }

});

class FilmStripMinisite extends React.Component{

    componentDidMount(){
        pydio.UI.registerEditorOpener(this);
    }

    componentWillUnmount() {
        pydio.UI.unregisterEditorOpener(this);
    }

    componentWillReceiveProps(nextProps) {

        const {pydio, node, dispatch} = nextProps

        if(this.props.node){
            dispatch(EditorActions.tabDelete(this.props.node.getLabel()));
        }

        if (!node || !node.isLeaf()) return

        const selectedMime = PathUtils.getAjxpMimeType(node);
        const editors = pydio.Registry.findEditorsForMime(selectedMime, false);
        if (editors.length && editors[0].openable) {

            const editorData = editors[0]

            pydio.Registry.loadEditorResources(
                editorData.resourcesManager,
                () => {
                    let EditorClass = null

                    if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                        this.setState({
                            error: "Cannot find editor component (" + editorData.editorClass + ")!"
                        })
                        return
                    }

                    let tabId = dispatch(EditorActions.tabCreate({
                        id: node.getLabel(),
                        title: node.getLabel(),
                        url: node.getPath(),
                        icon: PydioWorkspaces.FilePreview,
                        Editor: EditorClass.Editor,
                        Controls: EditorClass.Controls,
                        pydio,
                        node,
                        editorData,
                        registry: pydio.Registry
                    })).id

                    dispatch(EditorActions.editorSetActiveTab(tabId))
                }
            )
        }
    }

    openEditorForNode(node, editorData) {
        const {dispatch} = this.props
        if(!node.isLeaf()) return;
        pydio.Registry.loadEditorResources(
            editorData.resourcesManager,
            () => {
                let EditorClass = null

                if (!(EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window))) {
                    this.setState({
                        error: "Cannot find editor component (" + editorData.editorClass + ")!"
                    })
                    return
                }

                dispatch(EditorActions.tabModify({
                    id: node.getLabel(),
                    title: node.getLabel(),
                    url: node.getPath(),
                    icon: PydioWorkspaces.FilePreview,
                    Editor: EditorClass.Editor,
                    Controls: EditorClass.Controls,
                    pydio,
                    node,
                    editorData,
                    registry: pydio.Registry
                }))
            }
        )
    }


    render(){


        let node = this.props && this.props.node ?  this.props.node : null;

        let editor;
        if(node && node.isLeaf()) {
            editor = (
                <Editor displayToolbar={false} style={{display: "flex", flex: 1}}/>
            );
        }

        return (
            <StandardLayout {...this.props} skipDisplayToolbar={true}>
                <div className="vertical_layout" style={{flex:1, backgroundColor:'#424242', position:'relative'}}>
                    {editor}
                </div>
                <MaterialUI.Paper zDepth={2} className="vertical_layout" style={{height: 160, backgroundColor:this.props.muiTheme.appBar.color, zIndex:1}}>
                    <MainFilesList ref="list" {...this.props} horizontalRibbon={true} displayMode={"grid-160"}/>
                </MaterialUI.Paper>
            </StandardLayout>
        );
    }

};

window.ShareTemplates = {
    FolderMinisite      : muiThemeable()(FolderMinisite),
    FileMinisite        : compose(
        withUniqueNode(false),
        muiThemeable(),
        connect()
    )(FileMinisite),
    DLTemplate          : muiThemeable()(DLTemplate),
    DropZoneMinisite    : muiThemeable()(DropZoneMinisite),
    FilmStripMinisite   : compose(
        withUniqueNode(true),
        muiThemeable(),
        connect()
    )(FilmStripMinisite)
};
