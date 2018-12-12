import React from 'react'
import {Dialog, FlatButton, TextField, SelectField, MenuItem, IconButton, Toggle} from 'material-ui'
import {IdmUserMetaNamespace, ServiceResourcePolicy, UserMetaServiceApi} from 'pydio/http/rest-api'
import LangUtils from 'pydio/util/lang'
import Metadata from '../model/Metadata'
import PydioApi from 'pydio/http/api'

class MetaNamespace extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            namespace: this.cloneNs(props.namespace),
            m : (id) => props.pydio.MessageHash['ajxp_admin.metadata.' + id],
            selectorNewKey:'',
            selectorNewValue:''
        };
    }

    cloneNs(ns){
        return IdmUserMetaNamespace.constructFromObject(JSON.parse(JSON.stringify(ns)));
    }

    componentWillReceiveProps(props){
        this.setState({namespace: this.cloneNs(props.namespace)});
    }

    updateType(value){
        const {namespace} = this.state;
        namespace.JsonDefinition = JSON.stringify({type: value});
        this.setState({namespace});
    }

    updateName(value){
        const {namespace} = this.state;
        let slug = LangUtils.computeStringSlug(value);
        if(slug.indexOf('usermeta-') !== 0){
            slug = 'usermeta-' + slug;
        }
        namespace.Namespace = slug;
        this.setState({namespace})
    }

    save(){
        const {namespace} = this.state;
        Metadata.putNS(namespace).then(()=>{
            this.props.onRequestClose();
            this.props.reloadList();
        })
    }

    getSelectionData(){
        const {namespace} = this.state;
        let data = {};
        try {
            const current = JSON.parse(namespace.JsonDefinition).data;
            if (current){
                current.split(',').map(line => {
                    const [key, value] = line.split('|');
                    data[key] = value;
                })
            }
        }catch(e){}
        return data;
    }

    setSelectionData(newData){
        const {namespace} = this.state;
        let def = JSON.parse(namespace.JsonDefinition);

        def.data = Object.keys(newData).map(k => {
            return  k + '|' + newData[k];
        }).join(',');
        namespace.JsonDefinition = JSON.stringify(def);
        this.setState({namespace});
    }

    addSelectionValue(){
        const data = this.getSelectionData();
        const {selectorNewKey, selectorNewValue} = this.state;
        const key = LangUtils.computeStringSlug(selectorNewKey);
        data[key] = selectorNewValue;
        this.setSelectionData(data);
        this.setState({selectorNewKey:'', selectorNewValue:''});
    }
    removeSelectionValue(key){
        let data = this.getSelectionData();
        delete data[key];
        this.setSelectionData(data);
    }

    renderSelectionBoard(){
        const data = this.getSelectionData();
        const {m, selectorNewKey, selectorNewValue} = this.state;
        return (
            <div style={{padding: 10, backgroundColor: '#f5f5f5', borderRadius: 2}}>
                <div style={{fontSize: 13}}>{m('editor.selection')}</div>
                <div>{Object.keys(data).map(k => {
                    return (
                        <div key={k} style={{display:'flex'}}>
                            <span><TextField value={k} disabled={true} fullWidth={true}/></span>
                            <span style={{marginLeft: 10}}><TextField value={data[k]} disabled={true} fullWidth={true}/></span>
                            <span><IconButton iconClassName={"mdi mdi-delete"} onTouchTap={()=>{this.removeSelectionValue(k)}}/></span>
                        </div>
                    )
                })}</div>
                <div style={{display:'flex'}} key={"new-selection-key"}>
                    <span><TextField value={selectorNewKey} onChange={(e,v)=>{this.setState({selectorNewKey:v})}} hintText={m('editor.selection.key')} fullWidth={true}/></span>
                    <span style={{marginLeft: 10}}><TextField value={selectorNewValue} onChange={(e,v)=>{this.setState({selectorNewValue:v})}} hintText={m('editor.selection.value')} fullWidth={true}/></span>
                    <span><IconButton iconClassName={"mdi mdi-plus"} onTouchTap={()=>{this.addSelectionValue()}} disabled={!selectorNewKey || !selectorNewValue}/></span>
                </div>
            </div>
        );
    }

    togglePolicies(right, value){
        const {namespace} = this.state;
        const pol = namespace.Policies || [];
        let newPols = pol.filter(p => {
            return p.Action !== right;
        });
        newPols.push(ServiceResourcePolicy.constructFromObject({Action:right, Effect:'allow',Subject:value?'profile:admin':'*'}));
        namespace.Policies = newPols;
        this.setState({namespace}, () => {
            if(right === 'READ' && value){
                this.togglePolicies('WRITE', true);
            }
        });
    }

    render(){
        const {create, namespaces, pydio} = this.props;
        const {namespace, m} = this.state;
        let title;
        if(namespace.Label){
            title = namespace.Label;
        } else {
            title = m('editor.title.create');
        }
        let type = 'string';
        if(namespace.JsonDefinition){
            type = JSON.parse(namespace.JsonDefinition).type;
        }

        let invalid = false, nameError, labelError;
        if(!namespace.Namespace){
            invalid = true;
            nameError = m('editor.ns.error')
        }
        if(!namespace.Label){
            invalid = true;
            labelError = m('editor.label.error')
        }
        if(create){
            if (namespaces.filter(n => n.Namespace === namespace.Namespace).length){
                invalid = true;
                nameError = m('editor.ns.exists');
            }
        }
        if (type === 'choice' && Object.keys(this.getSelectionData()).length === 0) {
            invalid = true;
        }

        let adminRead, adminWrite;
        if(namespace.Policies){
            namespace.Policies.map(p => {
                if(p.Subject === 'profile:admin' && p.Action === 'READ') {
                    adminRead = true;
                }
                if(p.Subject === 'profile:admin' && p.Action === 'WRITE') {
                    adminWrite = true;
                }
            });
        }

        const actions = [
            <FlatButton primary={true} label={pydio.MessageHash['54']} onTouchTap={this.props.onRequestClose}/>,
            <FlatButton primary={true} disabled={invalid} label={"Save"} onTouchTap={() => {this.save()}}/>,
        ];
        if(type === 'tags'){
            actions.unshift(<FlatButton primary={false} label={m('editor.tags.reset')} onTouchTap={()=>{
                const api = new UserMetaServiceApi(PydioApi.getRestClient());
                api.deleteUserMetaTags(namespace.Namespace, "*").then(() => {
                    pydio.UI.displayMessage('SUCCESS', m('editor.tags.cleared').replace('%s', namespace.Namespace));
                }).catch(e => {
                    pydio.UI.displayMessage('ERROR', e.message);
                });
            }}/>);
        }


        return (
            <Dialog
                title={title}
                actions={actions}
                modal={false}
                contentStyle={{width: 420}}
                open={this.props.open}
                onRequestClose={this.props.onRequestClose}
                autoScrollBodyContent={true}
            >
                <TextField
                    floatingLabelText={m('namespace')}
                    disabled={!create}
                    value={namespace.Namespace}
                    onChange={(e,v) => {this.updateName(v)}}
                    fullWidth={true}
                    errorText={nameError}
                />
                <TextField
                    floatingLabelText={m('label')}
                    value={namespace.Label}
                    onChange={(e,v) => {namespace.Label = v; this.setState({namespace})}}
                    fullWidth={true}
                    errorText={labelError}
                />
                <TextField
                    floatingLabelText={m('order')}
                    value={namespace.Order ? namespace.Order : '0'}
                    onChange={(e,v) => {namespace.Order = parseInt(v); this.setState({namespace})}}
                    fullWidth={true}
                    type={"number"}
                />
                <SelectField
                    floatingLabelText={m('type')}
                    value={type}
                    onChange={(e,i,v) => this.updateType(v)}
                    fullWidth={true}>
                    {Object.keys(Metadata.MetaTypes).map(k => {
                        return <MenuItem value={k} primaryText={Metadata.MetaTypes[k]}/>
                    })}
                </SelectField>
                {type === 'choice' && this.renderSelectionBoard()}
                <div style={{padding:'20px 0 10px'}}>
                    <Toggle label={m('toggle.index')} labelPosition={"left"} toggled={namespace.Indexable} onToggle={(e,v) => {namespace.Indexable = v; this.setState({namespace})}}/>
                </div>
                <div style={{padding:'20px 0 10px'}}>
                    <Toggle label={m('toggle.read')} labelPosition={"left"} toggled={adminRead} onToggle={(e,v) => {this.togglePolicies('READ', v)}}/>
                </div>
                <div style={{padding:'20px 0 10px'}}>
                    <Toggle label={m('toggle.write')} labelPosition={"left"} disabled={adminRead} toggled={adminWrite} onToggle={(e,v) => {this.togglePolicies('WRITE', v)}}/>
                </div>
            </Dialog>

        );
    }

}

MetaNamespace.PropTypes = {
    namespace: React.PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
    create:React.PropTypes.boolean,
    reloadList: React.PropTypes.func,
    onRequestClose: React.PropTypes.func,
};

export default MetaNamespace