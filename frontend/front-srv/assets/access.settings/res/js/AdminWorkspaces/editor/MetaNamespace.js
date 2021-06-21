/*
 * Copyright 2007-2019 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from 'react';

import PropTypes from 'prop-types';

import Pydio from 'pydio'
import {Dialog, FlatButton, MenuItem, IconButton, Toggle} from 'material-ui'
import {IdmUserMetaNamespace, ServiceResourcePolicy, UserMetaServiceApi} from 'cells-sdk'
import LangUtils from 'pydio/util/lang'
import Metadata from '../model/Metadata'
import PydioApi from 'pydio/http/api'
const {ModernSelectField, ModernTextField, ModernStyles} = Pydio.requireLib('hoc');

import FuncUtils from 'pydio/util/func'
import ResourcesManager from 'pydio/http/resources-manager'

function loadEditorClass(className = '', defaultComponent) {
    if (!className) {
        return Promise.resolve(defaultComponent);
    }
    const parts = className.split(".");
    const ns = parts.shift();
    const rest = parts.join('.');
    return ResourcesManager.loadClass(ns).then(c => {
        const comp = FuncUtils.getFunctionByName(rest, c);
        if (!comp) {
            if(typeof c === 'object' && c[ns]) {
                const c2 = FuncUtils.getFunctionByName(rest, c[ns])
                if (c2) {
                    return c2
                }
            }
            if(defaultComponent) {
                console.error('Cannot find editor component, using default instead', className, defaultComponent);
                return defaultComponent;
            } else {
                throw new Error("cannot find editor component")
            }
        }
        return comp;
    }).catch(e => {
        if(defaultComponent) {
            console.error('Cannot find editor component, using default instead', className, defaultComponent);
            return defaultComponent;
        } else {
            throw e
        }
    })
}


class SelectionBoard extends React.Component{

    constructor(props) {
        super(props);
        this.state = {};
    }

    addSelectionValue(){
        const {selectorNewKey, selectorNewValue, selectorNewColor} = this.state;
        const {data, setAdditionalDataKey} = this.props;
        const {items = []} = data;
        items.push({key:selectorNewKey, value:selectorNewValue, color: selectorNewColor});
        setAdditionalDataKey('items', items);
        this.setState({selectorNewKey:'', selectorNewValue: '', selectorNewColor:''});
    }

    removeSelectionValue(k) {
        const {data, setAdditionalDataKey} = this.props;
        const {items = []} = data;
        setAdditionalDataKey('items', items.filter(i => i.key !== k));
    }

    renderColor(color = '', disabled=false) {
        const cc = [
            '#9c27b0',
            '#607d8b',
            '#66c',
            '#69c',
            '#6c6',
            '#696',
            '#c96',
            '#ff9800',
            '#c66',
            '#fff',
            '#ccc',
            '#999',
            '#000',
        ];
        if(disabled) {
            return <span className={'mdi mdi-label' + (color?'':'-outline')} style={{color:color||'#ccc', marginRight: 5}}/>
        }
        return (
            <span style={{width: 60, marginRight: 6}}>
                <ModernSelectField disabled={disabled} fullWidth={true} value={color} onChange={(e,i,v) => {this.setState({selectorNewColor:v})}}>
                    <MenuItem value={''} primaryText={<span className={'mdi mdi-label-outline'} style={{color:'#ccc'}}/>}/>
                    {cc.map(c => <MenuItem value={c} primaryText={<span className={'mdi mdi-label'} style={{color:c}}/>}/>)}
                </ModernSelectField>
            </span>
        )
    }

    render() {
        const {data, m, setAdditionalDataKey} = this.props;
        const {selectorNewKey, selectorNewValue, selectorNewColor} = this.state;
        const {items = []} = data;
        return(
            <Fragment>
            <div style={{padding: 10, paddingRight: 0, backgroundColor: '#f5f5f5', borderRadius: 3}}>
                <div style={{fontSize: 13}}>{m('editor.selection')}</div>
                <div>{items.map(i => {
                    const {key, value, color} = i;
                    return (
                        <div key={key} style={{display:'flex', alignItems:'center'}}>
                            {this.renderColor(color, true)}
                            <span style={{marginRight: 6, width: 80}}><ModernTextField value={key} disabled={true} fullWidth={true}/></span>
                            <span style={{flex: 1}}><ModernTextField value={value} disabled={true} fullWidth={true}/></span>
                            <span><IconButton iconClassName={"mdi mdi-delete"} iconStyle={{color:'rgba(0,0,0,.3)'}} onClick={()=>{this.removeSelectionValue(key)}}/></span>
                        </div>
                    )
                })}</div>
                <div style={{display:'flex'}} key={"new-selection-key"}>
                    {this.renderColor(selectorNewColor)}
                    <span style={{width: 80, marginRight: 6}}>
                        <ModernTextField value={selectorNewKey} onChange={(e,v)=>{this.setState({selectorNewKey:v})}} hintText={m('editor.selection.key')} fullWidth={true}/>
                    </span>
                    <span style={{flex: 1}}>
                        <ModernTextField value={selectorNewValue} onChange={(e,v)=>{this.setState({selectorNewValue:v})}} hintText={m('editor.selection.value')} fullWidth={true}/></span>
                    <span><IconButton iconClassName={"mdi mdi-plus"} onClick={()=>{this.addSelectionValue()}} disabled={!selectorNewKey || !selectorNewValue}/></span>
                </div>
            </div>
            <div>
                <Toggle label={m('editor.selection.steps')} labelPosition={"left"} toggled={data.steps} onToggle={(e,v) => setAdditionalDataKey('steps', v)} {...ModernStyles.toggleFieldV2}/>
            </div>
            </Fragment>
        );

    }
}

class MetaPoliciesBuilder extends React.Component {

    constructor(props) {
        super(props);
    }

    togglePolicies(right, value){
        const {policies = [], onChangePolicies} = this.props;
        let newPols = policies.filter(p => p.Action !== right);
        newPols.push(ServiceResourcePolicy.constructFromObject({Action:right, Effect:'allow',Subject:value?'profile:admin':'*'}));
        if(right === 'READ' && value){
            // if read - set write as well
            newPols = newPols.filter(p => p.Action !== 'WRITE')
            newPols.push(ServiceResourcePolicy.constructFromObject({Action:'WRITE', Effect:'allow',Subject:'profile:admin'}));
        }
        onChangePolicies(newPols);
    }

    render() {
        const {readonly, policies, pydio} = this.props;
        const m  = (id) => pydio.MessageHash['ajxp_admin.metadata.' + id] || id;

        let adminRead, adminWrite;
        if(policies){
            policies.map(p => {
                if(p.Subject === 'profile:admin' && p.Action === 'READ') {
                    adminRead = true;
                }
                if(p.Subject === 'profile:admin' && p.Action === 'WRITE') {
                    adminWrite = true;
                }
            });
        }

        return (
            <Fragment>
                <div>
                    <Toggle label={m('toggle.read')} disabled={readonly} labelPosition={"left"} toggled={adminRead} onToggle={(e,v) => {this.togglePolicies('READ', v)}} {...ModernStyles.toggleFieldV2}/>
                </div>
                <div>
                    <Toggle label={m('toggle.write')} labelPosition={"left"} disabled={adminRead || readonly} toggled={adminWrite} onToggle={(e,v) => {this.togglePolicies('WRITE', v)}} {...ModernStyles.toggleFieldV2}/>
                </div>
            </Fragment>
        )

    }


}

class MetaNamespace extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
            namespace: this.cloneNs(props.namespace),
            m : (id) => props.pydio.MessageHash['ajxp_admin.metadata.' + id] || id,
            selectorNewKey:'',
            selectorNewValue:'',
            PoliciesBuilder: MetaPoliciesBuilder
        };
        const {policiesBuilder} = this.props;
        if(policiesBuilder) {
            loadEditorClass(policiesBuilder, MetaPoliciesBuilder).then(c => this.setState({PoliciesBuilder: c}));
        }
    }

    cloneNs(ns){
        return IdmUserMetaNamespace.constructFromObject(JSON.parse(JSON.stringify(ns)));
    }

    componentWillReceiveProps(props){
        if(props.open === this.props.open) {
            return;
        }
        const {create, namespaces} = props;
        const newNS = this.cloneNs(props.namespace);
        if(create && namespaces.length){
            newNS.Order = namespaces.map(ns => ns.Order || 0).reduce((a,c) => Math.max(a,c), 0) + 1;
        }
        this.setState({namespace: newNS});
    }

    updateType(value){
        const {namespace} = this.state;
        const newType = {type:value};
        if(newType === 'date') {
            newType.data = {format: 'date', display:'normal'};
        }
        namespace.JsonDefinition = JSON.stringify(newType);
        this.setState({namespace});
    }

    updateLabel(value) {
        const {create} = this.props;
        const {namespace} = this.state;
        if(create && (!namespace.Namespace || namespace.Namespace === 'usermeta-' + LangUtils.computeStringSlug(namespace.Label))){
            this.updateName(value);
        }
        namespace.Label = value;
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

    getHideValue(){
        const {namespace} = this.state;
        try {
            return JSON.parse(namespace.JsonDefinition).hide
        } catch(e) {
            return false
        }
    }

    setHideValue(v) {
        const {namespace} = this.state;
        const def = JSON.parse(namespace.JsonDefinition);
        namespace.JsonDefinition = JSON.stringify({...def, hide: v})
        this.setState({namespace});
    }

    getAdditionalData(defaultValue = {}){
        const {namespace} = this.state;
        try {
            const add = JSON.parse(namespace.JsonDefinition).data || defaultValue;
            if(defaultValue.items && add.split) {
                // Convert to new format
                const items = add.split(',').map(i => {
                    const [key, value] = i.split('|')
                    return {key, value};
                });
                return {items};
            }
            return add;
        }catch(e){}
        return defaultValue;
    }

    // Append data key
    setAdditionalDataKey(key, value) {
        const {namespace} = this.state;
        let def = JSON.parse(namespace.JsonDefinition);
        const add = {[key]: value}
        def.data = {...def.data, ...add};
        namespace.JsonDefinition = JSON.stringify(def);
        this.setState({namespace});

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
        const {create, namespaces, pydio, readonly} = this.props;
        const {namespace, m, PoliciesBuilder} = this.state;
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
        if(!namespace.Label){
            invalid = true;
            labelError = m('editor.label.error')
        } else if(!namespace.Namespace || namespace.Namespace === 'usermeta-'){
            invalid = true;
            nameError = m('editor.ns.error')
        }
        if(create && namespaces.filter(n => n.Namespace === namespace.Namespace).length){
            invalid = true;
            nameError = m('editor.ns.exists');
        }
        if (type === 'choice') {
            const choiceItems = this.getAdditionalData({items:[]}).items;
            if(!choiceItems || !choiceItems.length) {
                invalid = true;
            }
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
            <FlatButton primary={true} label={pydio.MessageHash['54']} onClick={this.props.onRequestClose}/>,
            <FlatButton primary={true} disabled={invalid || readonly} label={pydio.MessageHash['53']} onClick={() => {this.save()}}/>,
        ];
        if(type === 'tags' && !readonly){
            actions.unshift(<FlatButton primary={false} label={m('editor.tags.reset')} onClick={()=>{
                const api = new UserMetaServiceApi(PydioApi.getRestClient());
                api.deleteUserMetaTags(namespace.Namespace, "*").then(() => {
                    pydio.UI.displayMessage('SUCCESS', m('editor.tags.cleared').replace('%s', namespace.Namespace));
                }).catch(e => {
                    pydio.UI.displayMessage('ERROR', e.message);
                });
            }}/>);
        }
        const styles = {
            section: {marginTop: 10, fontWeight: 500, fontSize: 12}
        };

        return (
            <Dialog
                title={title}
                actions={actions}
                modal={false}
                contentStyle={{width: 520}}
                open={this.props.open}
                onRequestClose={this.props.onRequestClose}
                autoScrollBodyContent={true}
                bodyStyle={{padding: 20}}
            >
                <ModernTextField
                    floatingLabelText={m('label')}
                    value={namespace.Label}
                    onChange={(e,v) => {this.updateLabel(v)}}
                    fullWidth={true}
                    errorText={labelError}
                    disabled={readonly}
                    variant={"v2"}
                />
                <ModernTextField
                    floatingLabelText={m('namespace')}
                    disabled={!create}
                    value={namespace.Namespace}
                    onChange={(e,v) => {this.updateName(v)}}
                    fullWidth={true}
                    errorText={nameError}
                    variant={"v2"}
                />
                <div style={styles.section}>{m('type')}</div>
                <ModernSelectField
                    hintText={m('type')}
                    value={type}
                    onChange={(e,i,v) => this.updateType(v)}
                    disabled={readonly}
                    fullWidth={true}
                    variant={"v2"}
                >
                    {Object.keys(Metadata.MetaTypes).map(k => {
                        return <MenuItem value={k} primaryText={m('type.'+k) || Metadata.MetaTypes[k]}/>
                    })}
                </ModernSelectField>
                {type === 'choice' &&
                    <SelectionBoard
                        data={this.getAdditionalData({items:[], steps:false})}
                        setAdditionalDataKey={this.setAdditionalDataKey.bind(this)}
                        m={m}
                    />
                }
                {type === 'date' &&
                    <Fragment>
                        <ModernSelectField
                            hintText={m('type.date.format')}
                            value={this.getAdditionalData({format:'date', display:'normal'}).format}
                            onChange={(e,i,v) => this.setAdditionalDataKey('format', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'date'} primaryText={m('type.date.format.date')}/>
                            <MenuItem value={'date-time'} primaryText={m('type.date.format.date-time')}/>
                            <MenuItem value={'time'} primaryText={m('type.date.format.time')}/>
                        </ModernSelectField>
                        <ModernSelectField
                            hintText={m('type.date.display')}
                            value={this.getAdditionalData({format:'date', display:'normal'}).display}
                            onChange={(e,i,v) => this.setAdditionalDataKey('display', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'normal'} primaryText={m('type.date.display.normal')}/>
                            <MenuItem value={'relative'} primaryText={m('type.date.display.relative')}/>
                        </ModernSelectField>
                    </Fragment>
                }
                {type === 'integer' &&
                    <Fragment>
                        <ModernSelectField
                            hintText={m('type.integer.format')}
                            value={this.getAdditionalData({format:'general'}).format || 'general'}
                            onChange={(e,i,v) => this.setAdditionalDataKey('format', v)}
                            disabled={readonly}
                            fullWidth={true}
                            variant={"v2"}
                        >
                            <MenuItem value={'general'} primaryText={m('type.integer.format.general')}/>
                            <MenuItem value={'bytesize'} primaryText={m('type.integer.format.bytesize')}/>
                            <MenuItem value={'percentage'} primaryText={m('type.integer.format.percentage')}/>
                            <MenuItem value={'progress'} primaryText={m('type.integer.format.progress')}/>
                        </ModernSelectField>
                    </Fragment>
                }

                <div style={styles.section}>{Pydio.getInstance().MessageHash[310]}</div>
                <Toggle
                    label={m('toggle.list-visibility')}
                    disabled={readonly}
                    labelPosition={"left"}
                    toggled={!this.getHideValue()}
                    onToggle={(e,v) => {this.setHideValue(!v)}}
                    {...ModernStyles.toggleFieldV2}
                />
                <Toggle
                    label={m('toggle.index')}
                    disabled={readonly}
                    labelPosition={"left"}
                    toggled={namespace.Indexable}
                    onToggle={(e,v) => {namespace.Indexable = v; this.setState({namespace})}}
                    {...ModernStyles.toggleFieldV2}
                />
                {PoliciesBuilder &&
                    <PoliciesBuilder
                        policies={namespace.Policies}
                        readonly={readonly}
                        onChangePolicies={(pols => this.setState({namespace:{...namespace, Policies:pols}}) )}
                        pydio={pydio}
                    />
                }
                <div style={styles.section}>{m('order')}</div>
                <ModernTextField
                    floatingLabelText={m('order')}
                    value={namespace.Order ? namespace.Order : '0'}
                    onChange={(e,v) => {namespace.Order = parseInt(v); this.setState({namespace})}}
                    fullWidth={true}
                    type={"number"}
                    readOnly={readonly}
                    variant={"v2"}
                />
            </Dialog>

        );
    }

}

MetaNamespace.PropTypes = {
    namespace: PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
    namespaces: PropTypes.arrayOf(IdmUserMetaNamespace),
    create:PropTypes.bool,
    reloadList: PropTypes.func,
    onRequestClose: PropTypes.func,
};

export default MetaNamespace