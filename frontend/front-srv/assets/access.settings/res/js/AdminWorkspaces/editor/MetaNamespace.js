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
import {Dialog, FlatButton, Toggle} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import {IdmUserMetaNamespace, ServiceResourcePolicy, UserMetaServiceApi} from 'cells-sdk'
import Metadata from '../model/Metadata'
import PydioApi from 'pydio/http/api'
const {ModernTextField, ModernAutoComplete, ThemedModernStyles} = Pydio.requireLib('hoc');
import FuncUtils from 'pydio/util/func'
import ResourcesManager from 'pydio/http/resources-manager'

function getGroupValue(namespace) {
    try {
        return JSON.parse(namespace.JsonDefinition).groupName || ""
    } catch(e) {
        return ""
    }
}

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
        const {readonly, policies, pydio, muiTheme} = this.props;
        const m  = (id) => pydio.MessageHash['ajxp_admin.metadata.' + id] || id;
        const ModernStyles = ThemedModernStyles(muiTheme)

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

MetaPoliciesBuilder = muiThemeable()(MetaPoliciesBuilder)

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
        ResourcesManager.loadClass('ReactMeta').then(c => {
            this.setState({metaModule: c});
            const {policiesBuilder} = this.props;
            if(policiesBuilder) {
                loadEditorClass(policiesBuilder, MetaPoliciesBuilder).then(c => this.setState({PoliciesBuilder: c}));
            }
        })
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

    setGroupValue(v) {
        const {namespace} = this.state;
        const def = JSON.parse(namespace.JsonDefinition);
        namespace.JsonDefinition = JSON.stringify({...def, groupName: v})
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
        const {create, namespaces, pydio, readonly, muiTheme} = this.props;
        const {namespace, m, PoliciesBuilder, metaModule} = this.state;
        const ModernStyles = ThemedModernStyles(muiTheme)

        if(!metaModule){
            return null;
        }
        const {TypeEditor} = metaModule;
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

        const knownGroups = [... new Set(namespaces.map(n => getGroupValue(n)).filter(g => g))];

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
                <TypeEditor
                    m={m}
                    pydio={pydio}
                    namespace={namespace}
                    forcePrefix={'usermeta-'}
                    onChange={(ns) => this.setState({namespace: ns})}
                    readonly={readonly}
                    create={create}
                    labelError={labelError}
                    nameError={nameError}
                    styles={styles}
                />
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
                <ModernAutoComplete
                    floatingLabelFixed={true}
                    fullWidth={true}
                    floatingLabelText={m('groupName')}
                    filter={(searchText, key) => (!searchText.indexOf || key.toLowerCase().indexOf(searchText.toLowerCase()) === 0)}
                    openOnFocus={true}
                    dataSource={knownGroups}
                    searchText={getGroupValue(namespace) || ''}
                    onNewRequest={(s,i) => {this.setGroupValue(s)}}
                    onUpdateInput={(v) => {this.setGroupValue(v)}}
                    menuProps={{maxHeight:300,overflowY: 'auto'}}
                />
            </Dialog>

        );
    }

}

MetaNamespace = muiThemeable()(MetaNamespace)

MetaNamespace.PropTypes = {
    namespace: PropTypes.instanceOf(IdmUserMetaNamespace).isRequired,
    namespaces: PropTypes.arrayOf(IdmUserMetaNamespace),
    create:PropTypes.bool,
    reloadList: PropTypes.func,
    onRequestClose: PropTypes.func,
};

export default MetaNamespace
export {loadEditorClass, getGroupValue}