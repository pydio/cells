import React from 'react'
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import Node from 'pydio/model/node'
import PathUtils from 'pydio/util/path'
import {ShareServiceApi, RestListSharedResourcesRequest, ListSharedResourcesRequestListShareType} from 'cells-sdk'
const {ActionDialogMixin, Loader} = Pydio.requireLib('boot');
const {ModalAppBar, EmptyStateView} = Pydio.requireLib('components');
const {ModernTextField} = Pydio.requireLib("hoc");
import {List, ListItem, FontIcon, Tabs, Tab} from 'material-ui';
const {muiThemeable} = require('material-ui/styles');

class Selector extends React.Component {
    render() {
        const {value, onChange, muiTheme, m} = this.props;
        const {palette} = muiTheme;
        const tabStyle={
            color: '#616161'
        }
        const activeStyle = {
            color: palette.accent1Color
        }
        const spanStyle={
            marginRight: 5
        }
        return (
            <Tabs style={{width: 360}} onChange={(v) => {onChange(null, 0, v)}} value={value} tabItemContainerStyle={{background:'transparent'}}>
                <Tab label={<span><span style={spanStyle} className={"mdi mdi-share-variant"}/>{m(243)}</span>} value={"LINKS"} buttonStyle={value==='LINKS'?activeStyle:tabStyle}/>
                <Tab label={<span><span style={spanStyle} className={"icomoon-cells"}/>{m(254)}</span>} value={"CELLS"} buttonStyle={value==='CELLS'?activeStyle:tabStyle}/>
            </Tabs>
        )
    }
}

Selector = muiThemeable()(Selector);

class ShareView extends React.Component {

    getChildContext() {
        const messages = this.props.pydio.MessageHash;
        return {
            messages: messages,
            getMessage: function(messageId, namespace='share_center'){
                try{
                    return messages[namespace + (namespace?".":"") + messageId] || messageId;
                }catch(e){
                    return messageId;
                }
            },
            isReadonly: function(){
                return false;
            }.bind(this)
        };
    }

    constructor(props){
        super(props);
        this.state = {
            resources: [],
            loading: false,
            selectedModel: null,
            shareType: props.defaultShareType || 'LINKS'
        };

    }

    componentDidMount(){
        this.load();
    }

    load(){

        this.setState({filter: ''});
        const api = new ShareServiceApi(PydioApi.getRestClient());
        const request = new RestListSharedResourcesRequest();
        request.ShareType = ListSharedResourcesRequestListShareType.constructFromObject(this.state.shareType);
        if (this.props.subject) {
            request.Subject = this.props.subject;
        } else {
            request.OwnedBySubject = true;
        }
        this.setState({loading: true});
        api.listSharedResources(request).then(res => {
            this.setState({resources: res.Resources || [], loading: false});
        }).catch(() => {
            this.setState({loading: false});
        });

    }

    getLongestPath(node){
        if (!node.AppearsIn) {
            return {path: node.Path, basename:node.Path};
        }
        let paths = {};
        node.AppearsIn.map(a => {
            paths[a.Path] = a;
        });
        let keys = Object.keys(paths);
        keys.sort();
        const longest = keys[keys.length - 1];
        let label = PathUtils.getBasename(longest);
        if (!label) {
            label = paths[longest].WsLabel;
        }
        return {path: longest, appearsIn: paths[longest], basename:label};
    }

    goTo(appearsIn){
        const {Path, WsLabel, WsUuid} = appearsIn;
        // Remove first segment (ws slug)
        let pathes = Path.split('/');
        pathes.shift();
        const pydioNode = new Node(pathes.join('/'));
        pydioNode.getMetadata().set('repository_id', WsUuid);
        pydioNode.getMetadata().set('repository_label', WsLabel);
        this.props.pydio.goTo(pydioNode);
        this.props.onRequestClose();
    }

    render(){

        const {loading, resources, filter=''} = this.state;
        const {pydio, style} = this.props;
        const m = id => pydio.MessageHash['share_center.' + id];
        resources.sort((a,b) => {
            const kA = a.Node.Path;
            const kB = b.Node.Path;
            return kA === kB ? 0 : kA > kB ? 1 : -1
        });
        const extensions = pydio.Registry.getFilesExtensions();
        return (
            <div style={{...style, display:'flex', flexDirection:'column', overflow:'hidden'}}>
                <div style={{backgroundColor: '#F5F5F5', borderBottom: '1px solid #EEEEEE', display:'flex', paddingRight: 16, paddingTop: 3}}>
                    <Selector
                        m={m}
                        value={this.state.shareType}
                        onChange={(e,i,v) => {this.setState({shareType: v}, ()=>{this.load()})}}
                    />
                    <span style={{flex: 1}}/>
                    <div style={{width: 150}}>
                        <ModernTextField hintText={m('sharelist.quick-filter')} value={filter} onChange={(e,v)=>{this.setState({filter: v})}} fullWidth={true}/>
                    </div>
                </div>
                {loading &&
                    <Loader style={{height: 400}}/>
                }
                {!loading && resources.length === 0 &&
                    <EmptyStateView
                        pydio={pydio}
                        iconClassName={"mdi mdi-share-variant"}
                        primaryTextId={m(131)}
                        style={{flex: 1, height: 400, padding:'90px 0', backgroundColor: 'transparent'}}
                    />
                }
                {!loading && resources.length > 0 &&
                    <List style={{flex: 1, minHeight: 400, maxHeight: 400, overflowY: 'auto', paddingTop: 0}}>
                        {resources.map(res => {
                            let {appearsIn, basename} = this.getLongestPath(res.Node);
                            let icon;
                            if(basename.indexOf('.') === -1 ){
                                icon = 'mdi mdi-folder'
                            } else {
                                const ext = PathUtils.getFileExtension(basename);
                                if(extensions.has(ext)) {
                                    const {fontIcon} = extensions.get(ext);
                                    icon = 'mdi mdi-' + fontIcon;
                                } else {
                                    icon = 'mdi mdi-file';
                                }
                            }
                            if(res.Link && res.Link.Label && res.Link.Label !== basename){
                                basename = res.Link.Label + ' (' + basename + ')'
                            }

                            return {
                                primaryText: basename,
                                secondaryText: res.Link ? m(251) + ': ' + res.Link.Description : m(284).replace('%s', res.Cells.length),
                                icon,
                                appearsIn
                            }
                        }).filter(props => {
                            return !filter || props.primaryText.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
                        }).map(props => {
                            const {appearsIn, icon} = props;
                            return <ListItem
                                primaryText={props.primaryText}
                                secondaryText={props.secondaryText}
                                onClick={()=>{appearsIn ? this.goTo(appearsIn) : null}}
                                disabled={!appearsIn}
                                leftIcon={<FontIcon className={icon}/>}
                            />
                        })}
                    </List>
                }
            </div>
        );
    }

}

ShareView.childContextTypes = {
    messages:PropTypes.object,
    getMessage:PropTypes.func,
    isReadonly:PropTypes.func
};

const ShareViewModal = createReactClass({
    displayName: 'ShareViewModal',
    mixins: [ActionDialogMixin],

    getDefaultProps: function(){
        return {
            dialogTitle: '',
            dialogSize: 'lg',
            dialogPadding: false,
            dialogIsModal: false,
            dialogScrollBody: false
        };
    },

    submit: function(){
        this.dismiss();
    },

    render: function(){

        return (
            <div style={{width:'100%', display:'flex', flexDirection:'column'}}>
                <ModalAppBar
                    title={this.props.pydio.MessageHash['share_center.98']}
                    showMenuIconButton={false}
                    iconClassNameRight="mdi mdi-close"
                    onRightIconButtonClick={()=>{this.dismiss()}}
                />
                <ShareView {...this.props} style={{width:'100%', flex: 1}} onRequestClose={()=>{this.dismiss()}}/>
            </div>
        );

    },
});

export {ShareView, ShareViewModal}