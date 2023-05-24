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
import React from 'react'
const {Textfit} = require('react-textfit');
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class'
import Pydio from 'pydio'
const Color = require('color');
import {muiThemeable} from 'material-ui/styles';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Paper, IconButton} from 'material-ui'
import PathUtils from 'pydio/util/path'
import DOMUtils from 'pydio/util/dom'
import FuncUtils from 'pydio/util/func'

const { Breadcrumb, UnifiedSearchForm, MainFilesList, Editor, EditionPanel, FilePreview } = Pydio.requireLib('workspaces');
const { ContextMenu, IconButtonMenu, Toolbar, ListPaginator, ClipboardTextField } = Pydio.requireLib('components');
const { withProgressiveBg } = Pydio.requireLib('boot');
const { EditorActions, dropProvider, withSearch } = Pydio.requireLib('hoc');

const withUniqueNode = (attachListener) => (Component) => {
    return class WithUniqueNode extends React.PureComponent {

        componentDidMount() {
            this.detectFirstNode()
        }

        detectFirstNode() {
            const {pydio} = this.props;

            let dm = pydio.getContextHolder();

            if (dm.getSelectedNodes().length) {
                if (!this.state || !this.state.node) {
                    this.setState({node: dm.getSelectedNodes()[0]});
                }
            } else {
                let first = dm.getRootNode().getFirstChildIfExists();
                if (first) {
                    dm.setSelectedNodes([first], "dataModel");
                    this.setState({node: first});
                } else {
                    setTimeout(() => this.detectFirstNode(), 1000);
                }
            }
            if(attachListener){
                dm.observe("selection_changed", function(){
                    let selection = dm.getSelectedNodes();
                    this.setState({node: selection.length ? selection[0] : null});
                }.bind(this));
            }
        }

        render() {
            return (
                <Component {...this.props} {...this.state} />
            )
        }
    }
};

const withRepositoriesListener = () => (Component) => {

    return class WithRepositoriesListener extends React.PureComponent {

        constructor(props){
            super(props);
            const {pydio} = props;
            this.state = {emptyUser: !pydio.user};
        }

        componentDidMount(){
            const {pydio} = this.props;
            this._obs = () => this.setState({emptyUser:!pydio.user});
            pydio.observe('repository_list_refreshed', this._obs)
        }

        componentWillUnmount(){
            const {pydio} = this.props;
            pydio.stopObserving('repository_list_refreshed', this._obs);
        }

        render(){
            return (
                <Component {...this.props} {...this.state}/>
            )
        }

    }

};

const withSearchFormEnabled = () => (Component) => {
    if (!Pydio.getInstance().getPluginConfigs('action.share').get('SHARED_FOLDER_SHOW_SEARCH')) {
        return Component
    }
    return class WithSearchFormEnabled extends React.PureComponent {
        constructor(props) {
            super(props);
            const {pydio} = props;
            const dm = pydio.getContextHolder()
            this.state = {searchView: false}
            dm.observe('context_changed', () => {
                this.setState({searchView: dm.getContextNode() === dm.getSearchNode()})
            })
        }
        render() {
            const onUpdateSearchView = (s) => this.setState({searchView: s})
            return (
                <Component {...this.props} {...this.state} showSearchForm={true} onUpdateSearchView={onUpdateSearchView}/>
            )
        }
    }
}

class ConfigLogo extends React.Component{

    render(){
        const pluginName = 'action.advanced_settings';
        const pluginParameter = 'CUSTOM_MINISITE_LOGO';
        const {pydio} = this.props;

        let logo = pydio.Registry.getPluginConfigs(pluginName).get(pluginParameter);
        let url;
        if(!logo){
            logo = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images/PydioLogoSquare.png';
        }
        if(logo){
            if(logo.indexOf('plug/') === 0){
                url = logo;
            }else{
                url = pydio.Parameters.get('ENDPOINT_REST_API') + "/frontend/binaries/GLOBAL/" + logo;
            }
        }
        return <img src={url} style={this.props.style} alt={"Application Logo"}/>
    }
}

class Copyright extends React.Component {
    render(){
        const {mode, style, aboutString} = this.props;
        if (aboutString === "false") {
            return null;
        }
        let s;
        if(mode === "insert"){
            s = {
                textAlign: 'right',
                padding: '6px 16px',
                backgroundColor: 'var(--md-sys-color-surface-variant)',
                color: 'var(--md-sys-color-on-surface-variant)'
            };
        } else if(mode === "overlay") {
            s = {
                position:'absolute',
                bottom: 0,
                right: 0,
                color: 'rgba(255,255,255,0.8)',
                padding: '6px 16px',
            }
        } else if(mode === "block") {
            s = {
                textAlign: 'center',
                padding: '6px 16px',
                color: 'rgba(255,255,255)'
            }
        }
        return (
            <div style={{...s,...style}}>
                <a href={"https://pydio.com"} style={{fontWeight: 500, color:s.color}}>Pydio Cells</a> - secure file sharing
            </div>);
    }
}

let StandardLayout = createReactClass({

    childContextTypes: {
        messages:PropTypes.object,
        getMessage:PropTypes.func,
        showSearchForm: PropTypes.bool
    },

    getChildContext() {
        const messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage(messageId){
                try{
                    return messages[messageId] || messageId;
                }catch(e){
                    return messageId;
                }
            }
        };
    },

    getDefaultProps(){
        return {minisiteMode: 'embed', uniqueNode:true};
    },

    render(){

        const {showSearchForm, searchView, onUpdateSearchView, uniqueNode, skipDisplayToolbar, bgStyle, emptyUser, pydio, muiTheme} = this.props;

        const styles = {
            appBarStyle : {
                zIndex: 1,
                backgroundColor: Color(muiTheme.palette.primary1Color).alpha(0.5).toString(),
                display:'flex',
                alignItems:'center',
                height: 64,
                padding: '0 10px'
            },
            buttonsStyle : {
                color: Color(muiTheme.appBar.textColor).alpha(0.9).toString()
            }
        };


        if(emptyUser){
            return <div className="vertical_fit vertical_layout" style={bgStyle}/>;
        }
        let toolbars = [];
        if(uniqueNode){
            toolbars.push("minisite_toolbar");
        } else {
            toolbars.push("info_panel");
            if(!skipDisplayToolbar){
                toolbars.push("minisite_display_toolbar", "display_toolbar");
            }
        }
        const dm = pydio.getContextHolder()
        const onRequestClose = ()=>{
            onUpdateSearchView(false)
            dm.setContextNode(dm.getRootNode())
        }
        const onRequestOpen = () => {
            onUpdateSearchView(true)
            dm.setContextNode(dm.getSearchNode());
        }

        return (
            <div className="vertical_fit vertical_layout" style={bgStyle}>
                <Paper zDepth={1} rounded={false} style={styles.appBarStyle}>
                    <ConfigLogo pydio={this.props.pydio} style={{height:40}}/>
                    <div id="workspace_toolbar" style={{display:'flex', flex: 1, overflow:'hidden'}}>
                        <Breadcrumb {...this.props} rootStyle={{padding: '0 14px', height: 36, lineHeight: '36px', maxWidth:null}}/>
                    </div>
                    <div style={{position:'relative'}}>
                        <div id="main_toolbar" style={{display:'flex', padding: '0 8px'}}>
                            {!uniqueNode &&
                                <IconButtonMenu
                                    {...this.props}
                                    id="create-button-menu"
                                    toolbars={["upload", "create"]}
                                    buttonTitle={this.props.pydio.MessageHash['198']}
                                    buttonClassName={"mdi mdi-folder-plus"}
                                    buttonStyle={{color:'white'}}
                                    controller={this.props.pydio.Controller}
                                />
                            }
                            <div style={{flex:1}}></div>
                            <ListPaginator id="paginator-toolbar" dataModel={this.props.pydio.getContextHolder()} toolbarDisplay={true} toolbarColor={'white'} menuStyle={{backgroundColor:'white'}}/>
                            <Toolbar {...this.props} id="main-toolbar" toolbars={toolbars} groupOtherList={uniqueNode ? [] : ["change_main", "more", "change", "remote"]} renderingType="icon-font" buttonStyle={styles.buttonsStyle}/>
                        </div>
                    </div>
                    {showSearchForm && pydio.user &&
                        <UnifiedSearchForm
                            {...this.props}
                            active={searchView}
                            formStyles={{
                                mainStyle:{borderRadius: 20},
                                textField:{color:'white'},
                                magnifierStyle:{color:'white'},
                            }}
                            onRequestOpen={onRequestOpen}
                            onRequestClose={onRequestClose}
                            closeButton={<IconButton onClick={onRequestClose} iconClassName={"mdi mdi-close"} iconStyle={{color:'white'}}/>}
                            uniqueSearchScope={pydio.user.getActiveRepositoryObject().getSlug()}
                            style={{marginTop: 2, marginRight: 3}}
                        />
                    }
                </Paper>
                {this.props.children}
                <span className="context-menu"><ContextMenu pydio={this.props.pydio}/></span>
            </div>
        );

    }

});

StandardLayout = withSearch(StandardLayout);
StandardLayout = withProgressiveBg(StandardLayout);
StandardLayout = dropProvider(StandardLayout);

class DLTemplate extends React.Component{

    triggerDL(){

        this.setState({downloadStarted: true});
        setTimeout(function(){
            this.props.pydio.Controller.fireAction("download");
            setTimeout(function(){
                this.setState({downloadStarted: false});
            }.bind(this), 3500);
        }.bind(this), 100);

    }

    componentDidMount(){
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
                    const repoObject = repositoryList.get(repositoryId);
                    this.setState({repoObject: repoObject});
                }
            }.bind(this));
        }
    }

    renderMui3() {
        const {bgStyle, node, emptyUser, muiTheme, pydio} = this.props;
        const {mui3} = muiTheme.palette;

        const styles = {
            main: {...bgStyle,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
            },
            block: {
                cursor: 'pointer',
                maxWidth: 420,
                minWidth: 320,
                margin: '0 auto',
                background: mui3['surface'],
                borderRadius: muiTheme.borderRadius,
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
            },
            cardImage:{
                margin:'0 auto',
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                background: mui3['surface-2'],
                borderRadius: muiTheme.borderRadius,
                padding: '60px 80px',
            },
            logo: {
                width:160,
                margin:'-50px auto 0'
            },
            filename: {
                fontSize: 20,
                wordBreak: 'break-all',
                fontWeight: 500
            },
            fileIcon: {
                fontSize:80,
                color: mui3['primary']
            },
            dlIcon: {
                position:'absolute',
                top:40,
                left:25,
                fontSize:30,
                color:mui3['inverse-primary'],
                transition:DOMUtils.getBeziersTransition()
            }
        };

        if(emptyUser){
            return <div className="vertical_fit" style={{...styles.main, width:'100%'}}></div>;
        }
        let fileName;
        let classNames = ['download-block'];
        if(this.state && this.state.repoObject){
            fileName = this.state.repoObject.getLabel();
        }
        let click = null;
        let fileDetails = pydio.MessageHash[466] ;
        if(node){
            click = this.triggerDL.bind(this);
            const roundSize = PathUtils.roundFileSize(node.getMetadata().get('bytesize'));
            fileDetails = `${MessageHash['share_center.231']} (${pydio.MessageHash[503]}: ${roundSize}).`;
        }
        let downloadStarted
        if(this.state && this.state.downloadStarted){
            downloadStarted = true
        }
        return (
            <div style={styles.main} id={"main-background"}>
                <ConfigLogo pydio={pydio} style={styles.logo}/>
                <div className={classNames.join(' ')} onClick={click} style={styles.block}>
                    <div style={styles.cardImage}>
                        <div style={{position:'relative'}}>
                            <span style={styles.fileIcon} className={"mdi mdi-file"}/>
                            <span style={styles.dlIcon} className="mdi mdi-download"/>
                        </div>
                    </div>
                    <div style={{padding: 16, color:mui3['on-surface']}}>
                        <span style={styles.filename}><Textfit min={14} max={16} perfectFit={false} mode="single">{fileName}</Textfit></span>
                        <div style={{fontSize:13, paddingTop: 8, color:mui3['outline']}}>{fileDetails}</div>
                    </div>
                    <div style={{display:'flex', justifyContent:'flex-start', padding: 16, opacity:((!node||downloadStarted)?0.5:1)}}>
                        <div style={{color:mui3['on-primary'], backgroundColor:mui3['primary'], borderRadius: 20, padding: '8px 16px', fontWeight: 500}}>Start Download</div>
                    </div>
                </div>
                <Copyright mode={"block"} {...this.props}/>
            </div>
        );

    }

    render(){

        const {bgStyle, node, emptyUser, muiTheme} = this.props;

        if(muiTheme.userTheme === 'mui3') {
            return this.renderMui3()
        }


        const styles = {
            main: {...bgStyle,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%'
            },
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
                width:230,
                margin:'-50px auto 0'
            },
            filename: {
                fontSize: 22,
                lineHeight: '22px',
                wordBreak: 'break-all'
            },
            fileIcon: {
                fontSize:180,
                color:this.props.muiTheme.palette.primary1Color
            },
            dlIcon: {
                position:'absolute',
                top:90,
                left:80,
                fontSize:60,
                color:'#f4f4f4',
                transition:DOMUtils.getBeziersTransition()
            }
        };

        if(emptyUser){
            return <div className="vertical_fit" style={{...styles.main, width:'100%'}}></div>;
        }
        let fileName;
        let classNames = ['download-block'];
        if(this.state && this.state.repoObject){
            fileName = this.state.repoObject.getLabel();
        }
        let click = null;
        let fileDetails = <div style={{fontSize:13,lineHeight:'18px'}}>{this.props.pydio.MessageHash[466]}</div> ;
        if(node){
            click = this.triggerDL.bind(this);
            const bytesize = node.getMetadata().get('bytesize');
            const txtColor = 'rgba(0,0,0,.43)';
            fileDetails = (
                <div style={{fontSize:13,lineHeight:'18px', color:txtColor}}>
                    <div style={{display:'flex'}}>
                        <div style={{flex:1,textAlign:'right',paddingRight:6,fontWeight: 500}}>{this.props.pydio.MessageHash[503]}</div>
                        <div style={{flex:1,textAlign:'left', color:'rgba(0,0,0,.73)'}}>{PathUtils.roundFileSize(bytesize)}</div>
                    </div>
                    <div style={{fontSize:12,marginTop:10}}>{this.props.pydio.MessageHash['share_center.231']}</div>
                </div>
            );
        }
        if(this.state && this.state.downloadStarted){
            styles.dlIcon.opacity = 0.3;
        }
        let sharePageAction = this.props.pydio.Controller.getActionByName('share_current_page');
        let shareButton;
        if(sharePageAction && !sharePageAction.deny){
            shareButton = (
                <a
                    style={{display:'block',textAlign:'center', padding: 12, cursor: 'pointer'}}
                    onClick={() => {this.setState({displayShareLink: true})}}>{sharePageAction.options.text}</a>
            );
        }
        return (
            <div style={styles.main}>
                <ConfigLogo pydio={this.props.pydio} style={styles.logo}/>
                <div className={classNames.join(' ')} onClick={click} style={styles.block}>
                    <span style={styles.filename}><Textfit min={12} max={25} perfectFit={false} mode="single">{fileName}</Textfit></span>
                    <div style={{width:220,margin:'0 auto', position:'relative'}}>
                        <span style={styles.fileIcon} className={"mdi mdi-file"}/>
                        <span style={styles.dlIcon} className="mdi mdi-download"/>
                    </div>
                    {fileDetails}
                </div>
                {this.state && this.state.displayShareLink &&
                <div style={{width: 267, margin: '10px auto', backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '0px 10px', borderRadius: 2}}>
                    <ClipboardTextField floatingLabelText={sharePageAction.options.text} inputValue={document.location.href} getMessage={(id)=>this.props.pydio.MessageHash[id]} buttonStyle={{right:-8, bottom:9}} />
                </div>
                }
                <Copyright mode={"block"} {...this.props}/>
                {!(this.state && this.state.displayShareLink) &&
                shareButton
                }
            </div>
        );

    }

}

class FolderMinisite extends React.Component{

    render(){
        const {pydio, searchView} = this.props;

        return (
            <StandardLayout {...this.props} uniqueNode={false}>
                <div style={{backgroundColor:'var(--md-sys-color-surface)', paddingTop:8}} className="layout-fill vertical-layout">
                    <MainFilesList searchResults={searchView} ref="list" {...this.props} dataModel={pydio.getContextHolder()}/>
                    <Copyright mode={"insert"} {...this.props}/>
                </div>
                <EditionPanel {...this.props}/>
            </StandardLayout>
        );

    }

}

class FileMinisite extends React.Component{

    componentWillReceiveProps(nextProps) {

        const {pydio, node, dispatch} = nextProps;

        if (!node) {
            return;
        }

        pydio.UI.registerEditorOpener(this);

        const selectedMime = PathUtils.getAjxpMimeType(node);
        const editors = pydio.Registry.findEditorsForMime(selectedMime, false);
        if (editors.length && editors[0].openable) {

            const editorData = editors[0];
            const {resourcesManager, editorClass} = editorData;

            pydio.Registry.loadEditorResources(
                resourcesManager,
                () => {
                    const EditorClass = FuncUtils.getFunctionByName(editorClass, window);
                    if (!EditorClass) {
                        this.setState({
                            error: "Cannot find editor component (" + editorClass + ")!"
                        });
                        return
                    }

                    let tabId = dispatch(EditorActions.tabCreate({
                        id: node.getLabel(),
                        title: node.getLabel(),
                        url: node.getPath(),
                        icon: FilePreview,
                        Editor: EditorClass.Editor,
                        Controls: EditorClass.Controls,
                        metadata: node.getMetadata(),
                        readonly: node.getMetadata().get("node_readonly") === "true",
                        pydio,
                        node,
                        editorData,
                        registry: pydio.Registry
                    })).id;

                    dispatch(EditorActions.editorSetActiveTab(tabId))
                }
            )
        }
    }

    openEditorForNode(node, editorData) {
        const {dispatch} = this.props

        pydio.Registry.loadEditorResources(
            editorData.resourcesManager,
            () => {
                const EditorClass = FuncUtils.getFunctionByName(editorData.editorClass, window)
                if (!EditorClass) {
                    this.setState({
                        error: "Cannot find editor component (" + editorData.editorClass + ")!"
                    });
                    return
                }
                dispatch(EditorActions.tabModify({
                    id: node.getLabel(),
                    title: node.getLabel(),
                    url: node.getPath(),
                    icon: FilePreview,
                    Editor: EditorClass.Editor,
                    Controls: EditorClass.Controls,
                    metadata: node.getMetadata(),
                    readonly: node.getMetadata().get("node_readonly") === "true",
                    pydio,
                    node,
                    editorData,
                    registry: pydio.Registry
                }))
            }
        )
    }

    componentWillUnmount() {
        pydio.UI.unregisterEditorOpener(this);
    }

    render(){

        return (
            <StandardLayout {...this.props} uniqueNode={true} skipDisplayToolbar={true}>
                <div className="editor_container vertical_layout vertical_fit" style={{backgroundColor:'#424242'}}>
                    <Editor displayToolbar={false} style={{display: "flex", flex: 1}}/>
                    <Copyright mode={"overlay"} {...this.props}/>
                </div>
            </StandardLayout>
        );


    }

}

class DropZoneMinisite extends React.Component{

    render(){
        const {pydio} = this.props;
        return (
            <StandardLayout {...this.props} uniqueNode={false}>
                <div className="vertical_fit vertical_layout" style={{backgroundColor:'var(--md-sys-color-surface)'}}>
                    <div className="vertical_fit vertical_layout" style={{margin: 8, padding:'8px 0', marginBottom: 2,border: '2px dashed #CFD8DC',borderRadius: 12}}>
                        <MainFilesList ref="list"  dataModel={pydio.getContextHolder()} {...this.props}/>
                    </div>
                    <Copyright mode={"insert"} style={{backgroundColor:'var(--md-sys-color-surface-variant)'}} {...this.props}/>
                </div>
                <EditionPanel {...this.props}/>
            </StandardLayout>
        );
    }

}

class FilmStripMinisite extends React.Component {

    render(){
        const {pydio, searchView} = this.props
        return (
            <StandardLayout {...this.props} uniqueNode={false}>
                <div style={{backgroundColor:'var(--md-sys-color-surface)', paddingTop: 8}} className="layout-fill vertical-layout">
                    <MainFilesList ref="list" {...this.props} searchResults={searchView} dataModel={pydio.getContextHolder()} displayMode={"masonry"}/>
                    <Copyright mode={"insert"} {...this.props}/>
                </div>
                <EditionPanel {...this.props}/>
            </StandardLayout>
        );

    }

}

FolderMinisite      = compose(
        muiThemeable(),
        withRepositoriesListener(),
        withSearchFormEnabled()
    )(FolderMinisite)

FileMinisite= compose(
        withRepositoriesListener(),
        withUniqueNode(false),
        muiThemeable(),
        connect()
    )(FileMinisite)

DLTemplate= compose(
        muiThemeable(),
        withUniqueNode(false),
        withRepositoriesListener()
    )(withProgressiveBg(DLTemplate))

DropZoneMinisite= compose(
        muiThemeable(),
        withRepositoriesListener()
    )(DropZoneMinisite)

FilmStripMinisite= compose(
        withRepositoriesListener(),
        withUniqueNode(true),
        withSearchFormEnabled(),
        muiThemeable(),
        connect()
    )(FilmStripMinisite)

export {FolderMinisite, FileMinisite, DLTemplate, DropZoneMinisite, FilmStripMinisite}