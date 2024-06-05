import React from "react"
import {Paper, List, ListItem, FontIcon, Subheader, RaisedButton} from 'material-ui'
import Loader from './Loader'
import Connect from './Connect'
import LangUtils from 'pydio/util/lang'
import Pydio from 'pydio'
const {ModernTextField} = Pydio.requireLib('hoc');
import {UserMetaServiceApi, IdmUserMetaNamespace, ServiceResourcePolicy, IdmUpdateUserMetaNamespaceRequest, UpdateUserMetaNamespaceRequestUserMetaNsOp} from 'cells-sdk'

class MetadataMapper extends React.Component {

    constructor(props){
        super(props);
        this.state = {};
    }

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    renderFontIcon(meta) {
        let icon;
        switch(meta.type){
            case "string":
            case "text":
            case "longtext":
                icon = "pencil";
                break;
            case "stars_rate":
                icon = "star";
                break;
            case "css_label":
                icon = "label-outline";
                break;
            case "choice":
                icon = "format-list-bulleted";
                break;
            case "tags":
                icon = "cloud-outline";
                break;
            default:
                icon = "file";
                break;
        }
        return <FontIcon className={"mdi mdi-" + icon}/>
    }

    exportMapping(){
        const {metas, factorized, links} = this.state;
        if(!metas || !metas.length){
            return ;
        }
        const data = {
            mapping:{},
            create:this.buildNamespaces()
        };
        metas.forEach((m, i) => {
            const rightIndex = links.filter(l => l.left === i)[0].right;
            data.mapping[m.name] = factorized[rightIndex].namespace;
        });
        this.props.onMapped(data);
    }

    componentDidMount(){
        if(this.props.workspaces && this.props.workspaces.length){
            const {metas, factorized, links} = Loader.parseUserMetaDefinitions(this.props.workspaces.filter((ws) => !ws.isTemplate));
            this.setState({metas, factorized, links}, () => {this.exportMapping()});
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.workspaces && nextProps.workspaces.length && (nextProps.workspaces !== this.props.workspaces || !this.props.workspaces || !this.props.workspaces.length)) {
            const {metas, factorized, links} = Loader.parseUserMetaDefinitions(nextProps.workspaces.filter((ws) => !ws.isTemplate));
            this.setState({metas, factorized, links}, () => {this.exportMapping()});
        }
    }

    toggle(index){
        const {factorized} = this.state;
        factorized[index].edit = !factorized[index].edit;
        this.setState({factorized});
    }

    updateLabel(index, value){
        const {factorized} = this.state;
        factorized[index].label = value;
        factorized[index].namespace = 'usermeta-' + LangUtils.computeStringSlug(value);
        this.setState({factorized}, () => {this.exportMapping()});
    }

    buildNamespaces(){
        const {factorized} = this.state;
        return factorized.map((meta,i) => {
            const ns = new IdmUserMetaNamespace();
            ns.Namespace = meta.namespace;
            ns.Label = meta.label;
            const json = {type:meta.type};
            if(meta.type === 'choice'){
                json['data'] = meta.additional;
            }
            ns.JsonDefinition = JSON.stringify(json);
            ns.Order = i;
            ns.Indexable = true;
            ns.Policies = [
                ServiceResourcePolicy.constructFromObject({Action:'READ', Subject:'*', Effect:'allow'}),
                ServiceResourcePolicy.constructFromObject({Action:'WRITE', Subject:'*', Effect:'allow'})
            ];
            return ns;
        });
    }

    render(){
        const {metas, factorized, links} = this.state;
        if (!metas) {
            return null;
        }
        const linkColor = '#2196f3';
        return (
            <div style={{margin:16, display:'flex'}}>
                <Paper zDepth={1} style={{width: 350}}>
                    <List>
                        <Subheader>{this.T('step.meta.from')}</Subheader>
                        {metas.map(m => {
                            return (
                                <ListItem
                                    primaryText={m.label}
                                    secondaryText={this.T('step.meta.map.ws').replace('%s', m.ws.display)}
                                    leftIcon={this.renderFontIcon(m)}
                                    disabled={true}
                                />);
                        })}
                    </List>
                </Paper>
                <Connect
                    leftNumber={metas.length}
                    rightNumber={factorized.length}
                    leftGridHeight={72}
                    rightGridHeight={72}
                    links={links.map(m => {return {...m, color:linkColor}})}
                    style={{marginLeft: -9, marginRight:-5}}
                />
                <Paper zDepth={1} style={{width: 350}}>
                    <List>
                        <Subheader>{this.T('step.meta.to')}</Subheader>
                        {factorized.map((m, i) => {
                            if(!m.edit){
                                return (
                                    <ListItem
                                        primaryText={m.label}
                                        secondaryText={m.namespace + (m.additional? this.T('step.meta.map.values').replace('%s', m.additional): '')}
                                        leftIcon={this.renderFontIcon(m)}
                                        onClick={()=>{this.toggle(i)}}
                                    />);
                            } else {
                                return (
                                    <ListItem
                                        style={{backgroundColor:'rgba(255, 215, 0, 0.2)'}}
                                        primaryText={<ModernTextField style={{height: 40}} value={m.label} onChange={(e,v) => {this.updateLabel(i, v)}}/>}
                                        leftIcon={<FontIcon style={{margin:'24px 12px', cursor:'pointer'}} className={"mdi mdi-check"} onClick={()=>{this.toggle(i)}}/>}
                                        disabled={true}
                                    />);
                            }
                        })}
                    </List>
                </Paper>
            </div>
        );

    }

}

export {MetadataMapper as default}