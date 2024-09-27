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

import React from "react";
import ResourcesManager from 'pydio/http/resources-manager'
import {Paper} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import {TreeVersioningPolicy,TreeVersioningKeepPeriod} from 'cells-sdk'
import PydioApi from 'pydio/http/api'
import XMLUtils from 'pydio/util/xml'
import Pydio from 'pydio'
import VersionPolicyPeriods from './VersionPolicyPeriods'
const {Manager, FormPanel} = Pydio.requireLib('form');
const {PaperEditorLayout, AdminStyles} = AdminComponents;

const cssFormSimple = `
.react-mui-context .pydio-form-panel.form-panel-odd > .pydio-form-group {
    margin: 2px 10px 0px;
}
.react-mui-context .pydio-form-panel.form-panel-odd >.pydio-form-group > h1 {
    background-color: transparent;
    color:#607D8B;
    border-bottom: 1px solid #eceff1;
    font-size: 13px;
    font-weight: 500;
    margin: 0px -16px;
    letter-spacing: initial;
    padding: 12px 20px;
}
`;


class VersionPolicyEditor extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            dirty:false,
            policy: props.versionPolicy,
            loaded :true,
            valid: true,
            parameters: null,
            m: id => props.pydio.MessageHash['ajxp_admin.versions.editor.' + id] || id
        };
    }

    componentWillReceiveProps(newProps){
        if(this.state.policy !== newProps.versionPolicy){
            this.setState({policy: newProps.versionPolicy});
        }
    }

    componentDidMount(){
        PydioApi.getRestClient().callApi(
            '/config/discovery/forms/{ServiceName}', 'GET',
            {ServiceName:'pydio.grpc.versions'}, {}, {}, {}, null,
            [], ['application/json'], ['application/json'], "String"
        ).then((responseAndData) => {
            const xmlString = responseAndData.data;
            const domNode = XMLUtils.parseXml(xmlString);
            this.setState({
                parameters: Manager.parseParameters(domNode, "//param"),
                loaded: true,
            });
        });
    }

    resetForm(){
        this.setState({valid: true, dirty: false, saveValue: null});
    }

    static valuesToTreeVersioningPolicy(values){
        const periods = [];
        const baseName = "IntervalStart";
        const baseNameMax = "MaxNumber";
        let nextName = baseName;
        let nextMax = baseNameMax;
        let index = 0;
        while(values[nextName] !== undefined && values[nextMax] !== undefined){
            let period = new TreeVersioningKeepPeriod();
            period.IntervalStart = values[nextName];
            period.MaxNumber = values[nextMax];
            periods.push(period);
            delete values[nextMax];
            delete values[nextName];
            index++;
            nextName = baseName + "_" + index;
            nextMax = baseNameMax + "_" + index;
        }
        values.KeepPeriods = periods;
        return TreeVersioningPolicy.constructFromObject(values);
    }

    static TreeVersioningPolicyToValues(policy){
        let values = {...policy};
        if (values.KeepPeriods) {
            let i = 0;
            values.KeepPeriods.map((p) => {
                if(i>0){
                    values['IntervalStart_' + i] = p.IntervalStart || 0;
                    values['MaxNumber_' + i] = p.MaxNumber || 0;
                } else {
                    values['IntervalStart'] = p.IntervalStart || 0;
                    values['MaxNumber'] = p.MaxNumber || 0;
                }
                i++;
            });
        }
        // Default Enum Value
        if(!values.NodeDeletedStrategy) {
            values.NodeDeletedStrategy = 'KeepAll';
        }
        return values;
    }

    deleteSource(){
        const {m, policy} = this.state;
        const {pydio} = this.props;
        pydio.UI.openConfirmDialog({
            message:m('delete.confirm'),
            destructive:[policy.Label],
            validCallback:() => {
                ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                    const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
                    api.deleteVersioningPolicy(policy.Uuid).then((r) =>{
                        this.props.closeEditor();
                    });
                });
            }
        });
    }

    saveSource(){
        if(this.state.saveValue){
            const {saveValue} = this.state;
            ResourcesManager.loadClass('EnterpriseSDK').then(sdk => {
                const api = new sdk.EnterpriseConfigServiceApi(PydioApi.getRestClient());
                api.putVersioningPolicy(saveValue.Uuid, saveValue).then(() => {
                    this.props.reloadList();
                    this.setState({
                        dirty: false,
                        policy: saveValue,
                        saveValue: null
                    })
                });
            });
        }
    }

    onFormChange(values){
        const {m} = this.state;
        let newPolicy = VersionPolicyEditor.valuesToTreeVersioningPolicy(values);
        // Check periods
        const periods = newPolicy.KeepPeriods || [];
        const deleteAll = periods.findIndex((p) => p.MaxNumber === 0);
        if(deleteAll > -1 && deleteAll < periods.length - 1){
            pydio.UI.displayMessage('ERROR', m('error.lastdelete'));
            let i = periods.length - 1 - deleteAll;
            while(i>0){periods.pop(); i--;}
        }
        newPolicy.KeepPeriods = periods;
        this.setState({
            saveValue: newPolicy,
            dirty: true
        });
    }

    updateValidStatus(valid){
        //this.setState({valid: valid});
    }

    render(){
        const {create, readonly, pydio, muiTheme, internalSources} = this.props;
        const {loaded, policy, saveValue, m} = this.state;
        let {parameters} =  this.state;
        const palette = muiTheme.palette;
        const adminStyles = AdminStyles(palette);
        let form;
        if(parameters && loaded){
            if(internalSources) {
                parameters = parameters.map(p => {
                    if(p.name === 'VersionsDataSourceName') {
                        // Update choices list with detected internal datasources
                        p.choices += ',' + internalSources.map(s => s+'|DataSource '+s).join(',');
                    }
                    return p;
                })
            }
            let values = VersionPolicyEditor.TreeVersioningPolicyToValues(policy);
            if (saveValue){
                values = VersionPolicyEditor.TreeVersioningPolicyToValues(saveValue);
            }
            form = (
                <FormPanel
                    parameters={parameters}
                    values={values}
                    className="full-width"
                    onChange={this.onFormChange.bind(this)}
                    onValidStatusChange={this.updateValidStatus.bind(this)}
                    disabled={readonly}
                    depth={-2}
                    variant={'v2'}
                />
            );
        }

        let titleActionBarButtons = [];
        if(!readonly){
            if(!create){
                titleActionBarButtons.push(PaperEditorLayout.actionButton(m('delete'), 'mdi mdi-delete', ()=>{this.deleteSource()}));
                titleActionBarButtons.push(PaperEditorLayout.actionButton(pydio.MessageHash['ajxp_admin.plugins.6'], 'mdi mdi-undo', ()=>{this.resetForm()}, !this.state.dirty));
            }
            titleActionBarButtons.push(PaperEditorLayout.actionButton(pydio.MessageHash['53'], 'mdi mdi-content-save', ()=>{this.saveSource()}, !this.state.valid || !this.state.dirty));
        }

        let policyName = saveValue ? saveValue.Name : policy.Name;
        if(!policyName) {
            policyName = '';
        }

        return (
            <PaperEditorLayout
                title={loaded && parameters ? m('title').replace('%s', policyName) : pydio.MessageHash['ajxp_admin.loading']}
                titleLeftIcon={"mdi mdi-clock-start"}
                titleActionBar={titleActionBarButtons}
                closeAction={this.props.closeEditor}
                className="workspace-editor"
                contentFill={true}
            >
                <Paper zDepth={0} style={{backgroundColor:adminStyles.body.block.header.backgroundColor, padding: '0px 20px', height: 64, display: 'flex', alignItems: 'center'}}>
                    <div style={{overflowX: 'auto', width: '100%'}}>
                        <VersionPolicyPeriods pydio={pydio} policy={saveValue?saveValue:policy}/>
                    </div>
                </Paper>
                {form}
                <style type={"text/css"} dangerouslySetInnerHTML={{__html:cssFormSimple}}/>
            </PaperEditorLayout>
        );
    }
}

VersionPolicyEditor = muiThemeable()(VersionPolicyEditor)

export {VersionPolicyEditor as default};