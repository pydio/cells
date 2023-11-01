/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React, {Fragment} from "react";
import createReactClass from 'create-react-class';
import GroupSwitchPanel from './GroupSwitchPanel'
import ReplicationPanel from './ReplicationPanel'
import FormManager from '../manager/Manager'
import PropTypes from 'prop-types';
import Pydio from 'pydio';
import LangUtils from "pydio/util/lang";
import {Paper, Tab, Tabs} from "material-ui";
import Tooltip from './Tooltip'
import deepEqual from 'deep-equal'

/**
 * Form Panel is a ready to use form builder inherited for Pydio's legacy parameters formats ('standard form').
 * It is very versatile and can basically take a set of parameters defined in the XML manifests (or defined manually
 * in JS) and display them as a user form.
 * It is a controlled component: it takes a {values} object and triggers back an onChange() function.
 *
 * See also Manager class to get some utilitary functions to parse parameters and extract values for the form.
 */
export default createReactClass({
    displayName: 'FormPanel',
    _internalParameters:null,
    _hiddenValues:{},
    _internalValid:null,
    _parametersMetadata:null,

    propTypes:{
        /**
         * Array of Pydio StandardForm parameters
         */
        parameters:PropTypes.array.isRequired,
        /**
         * Object containing values for the parameters
         */
        values:PropTypes.object,
        /**
         * Trigger unitary function when one form input changes.
         */
        onParameterChange:PropTypes.func,
        /**
         * Send all form values onchange, including eventually the removed ones (for dynamic panels)
         */
        onChange:PropTypes.func,
        /**
         * Triggered when the form globabally switches between valid and invalid state
         * Triggered once at form construction
         */
        onValidStatusChange:PropTypes.func,
        /**
         * Disable the whole form at once
         */
        disabled:PropTypes.bool,
        /**
         * String added to the image inputs for upload/download operations
         */
        binary_context:PropTypes.string,
        /**
         * 0 by default, subforms will have their zDepth value increased by one
         */
        depth:PropTypes.number,

        /**
         * Add an additional header component (added inside first subpanel)
         */
        header:PropTypes.object,
        /**
         * Add an additional footer component (added inside last subpanel)
         */
        footer:PropTypes.object,
        /**
         * Add other arbitrary panels, either at the top or the bottom
         */
        additionalPanes:PropTypes.shape({
            top:PropTypes.array,
            bottom:PropTypes.array
        }),
        /**
         * An array of tabs containing groupNames. Groups will be splitted
         * accross those tabs
         */
        tabs:PropTypes.array,
        /**
         * Fired when a the active tab changes
         */
        onTabChange:PropTypes.func,
        /**
         * A bit like tabs, but using accordion-like layout
         */
        accordionizeIfGroupsMoreThan:PropTypes.number,
        /**
         * Forward an event when scrolling the form
         */
        onScrollCallback:PropTypes.func,
        /**
         * Restrict to a subset of field groups
         */
        limitToGroups:PropTypes.array,
        /**
         * Ignore some specific fields types
         */
        skipFieldsTypes:PropTypes.array,

        /* Helper Options */
        /**
         * Pass pointers to the Pydio Companion container
         */
        setHelperData:PropTypes.func,
        /**
         * Function to check if the companion is active or none and if a parameter
         * has helper data
         */
        checkHasHelper:PropTypes.func,
        /**
         * Test for parameter
         */
        helperTestFor:PropTypes.string

    },

    externallySelectTab(index){
        this.setState({tabSelectedIndex: index});
    },

    getInitialState(){
        if(this.props.onTabChange) {
            return {tabSelectedIndex:0};
        }
        return {};
    },

    getDefaultProps(){
        return { depth:0, values:{} };
    },

    componentWillReceiveProps(newProps){

        if(!this._internalParameters || JSON.stringify(newProps.parameters) !== this._internalParameters){
            this._internalValid = null;
            this._hiddenValues = {};
            this._parametersMetadata = {};
            this._internalParameters = JSON.stringify(newProps.parameters);
        }
        if(newProps.values && !deepEqual(newProps.values, this.props.values)){
            this.checkValidStatus(newProps.values);
        }
    },

    getValues(){
        return this.props.values;
    },

    onParameterChange(paramName, newValue, oldValue, additionalFormData=null){
        // Update writeValues
        var newValues = LangUtils.deepCopy(this.getValues());
        if(this.props.onParameterChange) {
            this.props.onParameterChange(paramName, newValue, oldValue, additionalFormData);
        }
        if(additionalFormData){
            if(!this._parametersMetadata) {
                this._parametersMetadata = {};
            }
            this._parametersMetadata[paramName] = additionalFormData;
        }
        newValues[paramName] = newValue;
        var dirty = true;
        this.onChange(newValues, dirty);
    },

    onChange(newValues, dirty, removeValues){
        if(this.props.onChange) {
            //newValues = LangUtils.mergeObjectsRecursive(this._hiddenValues, newValues);
            for(var key in this._hiddenValues){
                if(this._hiddenValues.hasOwnProperty(key) && newValues[key] === undefined && (!removeValues || removeValues[key] === undefined)){
                    newValues[key] = this._hiddenValues[key];
                }
            }
            this.props.onChange(newValues, dirty, removeValues);
        }
        this.checkValidStatus(newValues);
    },

    onSubformChange(newValues, dirty, removeValues){
        var values = LangUtils.mergeObjectsRecursive(this.getValues(), newValues);
        if(removeValues){
            for(var k in removeValues){
                if(removeValues.hasOwnProperty(k) && values[k] !== undefined){
                    delete values[k];
                    if(this._hiddenValues[k] !== undefined){
                        delete this._hiddenValues[k];
                    }
                }
            }
        }
        this.onChange(values, dirty, removeValues);
    },

    onSubformValidStatusChange(newValidValue, failedMandatories){
        if((newValidValue !== this._internalValid || this.props.forceValidStatusCheck) && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newValidValue, failedMandatories);
        }
        this._internalValid = newValidValue;
    },

    applyButtonAction(parameters, callback){
        if(this.props.applyButtonAction){
            this.props.applyButtonAction(parameters, callback);
        }
    },

    getValuesForPOST(values, prefix='DRIVER_OPTION_'){
        return FormManager.getValuesForPOST(this.props.parameters, values, prefix, this._parametersMetadata);
    },

    checkValidStatus(values){
        const failedMandatories = [];
        const {parameters, replicationGroup, groupSwitchName, forceValidStatusCheck, onValidStatusChange} = this.props;
        if(groupSwitchName) {
            return ;
        }
        // Remove groupSwitchParameters not concerned
        parameters.filter(p => {
            if (p.group_switch_value) {
                const groupName = p.group_switch_name;
                return parameters.filter(p2 => p2.type === 'group_switch:' + groupName && values[p2.name] === p.group_switch_value).length === 1
            } else {
                return true
            }
        }).map((p) => {
            if (p.replicationGroup && p.replicationGroup !== replicationGroup /*&& p.replicationMandatory !== 'true'*/) {
                return
            }
            const checkName = p.group_switch_name ? p.group_switch_name+'/'+p.name : p.name
            if (['string', 'textarea', 'password', 'integer', 'integer-bytes'].indexOf(p.type) > -1 && (p.mandatory === "true" || p.mandatory === true)) {
                if (!values || !values.hasOwnProperty(checkName) || values[checkName] === undefined || values[checkName] === "") {
                    failedMandatories.push(p);
                }
            }
            if ((p.type === 'valid-password' || p.type === 'valid-login') && this.refs['form-element-' + p.name]) {
                if (!this.refs['form-element-' + p.name].isValid()) {
                    failedMandatories.push(p);
                }
            }
        });
        let previousValue, newValue;
        previousValue = this._internalValid;
        newValue = !failedMandatories.length;
        if((newValue !== this._internalValid || forceValidStatusCheck || replicationGroup) && onValidStatusChange) {
            onValidStatusChange(newValue, failedMandatories);
        }
        this._internalValid = newValue;
    },

    componentDidMount(){
        this.checkValidStatus(this.props.values);
    },

    renderGroupHeader(groupLabel, accordionize, index, active){

        var properties = { key: 'group-' + groupLabel };
        if(accordionize){
            var current = (this.state && this.state.currentActiveGroup) ? this.state.currentActiveGroup : null;
            properties['className'] = 'group-label-' + (active ? 'active' : 'inactive');
            properties['onClick'] = function(){
                this.setState({currentActiveGroup:(current !== index ? index : null)});
            }.bind(this);
            groupLabel = [<span key="toggler" className={"group-active-toggler mdi-mdi-chevron-" + (current === index ? 'down' : 'right') }></span>, groupLabel];
        }

        return React.createElement(
            'h' + (3 + this.props.depth),
            properties,
            groupLabel
        );
    },

    render(){
        let allGroups = [];
        let groupsOrdered = ['__DEFAULT__'];
        allGroups['__DEFAULT__'] = {FIELDS:[]};
        const replicationGroups = {};
        const {parameters, values, skipFieldsTypes, disabled, binary_context, variant, variantShowLegend, panelStyle} = this.props;
        const {altTextSwitchIcon, altTextSwitchTip, onAltTextSwitch, altTextSwitchTipOff = 'Disable Mode Template'} = this.props;

        parameters.map(function(attributes){

            const {type, name:paramName, replicationGroup: repGroup} = attributes;

            if(skipFieldsTypes && skipFieldsTypes.indexOf(type) > -1){
                return;
            }
            let field;
            if(attributes['group_switch_name']) {
                return;
            }

            const group = attributes['group'] || '__DEFAULT__';
            if(!allGroups[group]){
                groupsOrdered.push(group);
                allGroups[group] = {FIELDS:[], LABEL:group};
            }

            if(repGroup) {

                if (!replicationGroups[repGroup]) {
                    replicationGroups[repGroup] = {
                        PARAMS: [],
                        GROUP: group,
                        POSITION: allGroups[group].FIELDS.length
                    };
                    allGroups[group].FIELDS.push('REPLICATION:' + repGroup);
                }
                // Copy
                const repAttr = LangUtils.deepCopy(attributes);
                delete repAttr['replicationGroup'];
                delete repAttr['group'];
                replicationGroups[repGroup].PARAMS.push(repAttr);

            }else{

                if(type.indexOf("group_switch:") === 0){
                    field = (
                        <GroupSwitchPanel
                            {...this.props}
                            onChange={this.onSubformChange.bind(this)}
                            paramAttributes={attributes}
                            parameters={parameters}
                            values={values}
                            key={paramName}
                            onScrollCallback={null}
                            limitToGroups={null}
                            //onValidStatusChange={this.onSubformValidStatusChange.bind(this)}
                        />
                    );

                }else if(type !== 'hidden'){

                    let helperMark;
                    const {setHelperData, checkHasHelper, helperTestFor} = this.props;
                    if(setHelperData && checkHasHelper && checkHasHelper(attributes['name'], helperTestFor)){
                        const showHelper = function(){
                            setHelperData({
                                paramAttributes:attributes,
                                values:values,
                                postValues:this.getValuesForPOST(values),
                                applyButtonAction:this.applyButtonAction
                            }, helperTestFor);
                        }.bind(this);
                        helperMark = <span className="mdi mdi-comment-question-outline" onClick={showHelper}></span>;
                    }
                    let mandatoryMissing = false;
                    let classLegend = "form-legend";
                    const {errorText, warningText, mandatory} = attributes;
                    if(errorText) {
                        classLegend = "form-legend mandatory-missing";
                    }else if(warningText){
                        classLegend = "form-legend warning-message";
                    }else if( mandatory && (mandatory === "true" || mandatory === true)){
                        if(['string', 'textarea', 'image', 'integer', 'integer-bytes'].indexOf(type) !== -1 && !values[paramName]){
                            mandatoryMissing = true;
                            classLegend = "form-legend mandatory-missing";
                        }
                    }

                    const {description, readonly, multiple} = attributes;
                    const legendLabel = warningText?warningText:description;
                    const {label} = attributes;

                    const props = {
                        ref:"form-element-" + paramName,
                        attributes:{...attributes, label},
                        name:paramName,
                        value:values[paramName],
                        onChange: (newValue, oldValue, additionalFormData) => {
                            this.onParameterChange(paramName, newValue, oldValue, additionalFormData);
                        },
                        disabled:disabled || readonly,
                        multiple:multiple,
                        binary_context:binary_context,
                        displayContext:'form',
                        applyButtonAction:this.applyButtonAction,
                        variant,
                        variantShowLegend,
                        errorText:mandatoryMissing? Pydio.getInstance().MessageHash['621']:( errorText?errorText:null ),
                        onAltTextSwitch, altTextSwitchIcon, altTextSwitchTip
                    };

                    const v2Legend = {
                        padding: '6px 3px',
                        color: '#616161',
                        fontSize: 14
                    }

                    field = (
                        <div key={paramName} className={'form-entry-' + type}>
                            {variant !== 'v2' && <div className={classLegend}>{legendLabel} {helperMark}</div>}
                            {(variant === 'v2' && attributes.type === 'legend') && <div style={v2Legend}>{legendLabel} {helperMark}</div>}
                            {FormManager.createFormElement(props)}
                        </div>
                    );

                    if(variantShowLegend && legendLabel && attributes.type !== 'legend') {
                        field = (
                            <Tooltip
                                attributes={attributes}
                                label={label}
                                legendLabel={legendLabel}
                                onAltTextSwitch={onAltTextSwitch}
                                altTextSwitchTip={altTextSwitchTip}
                                altTextSwitchTipOff={altTextSwitchTipOff}
                                {...this.props}
                            >{field}</Tooltip>
                        )
                    }

                }else{

                    this._hiddenValues[paramName] = (values[paramName] === undefined ? attributes['default'] : values[paramName]);

                }

                if(field) {
                    allGroups[group].FIELDS.push(field);
                }

            }


        }.bind(this));

        Object.keys(replicationGroups).forEach(rGroup => {
            const rGroupData = replicationGroups[rGroup];
            allGroups[rGroupData.GROUP].FIELDS[rGroupData.POSITION] = (
                <ReplicationPanel
                    {...this.props}
                    key={"replication-group-" + rGroupData.PARAMS[0].name}
                    replicationGroup={rGroup}
                    onChange={this.onSubformChange}
                    onParameterChange={null}
                    values={this.getValues()}
                    depth={this.props.depth+1}
                    parameters={rGroupData.PARAMS}
                    applyButtonAction={this.applyButtonAction}
                    onScrollCallback={null}
                    onValidStatusChange={this.onSubformValidStatusChange.bind(this)}
                />
            );
        });

        let groupPanes = [];
        const accordionize = (this.props.accordionizeIfGroupsMoreThan && groupsOrdered.length > this.props.accordionizeIfGroupsMoreThan);
        const currentActiveGroup = (this.state && this.state.currentActiveGroup) ? this.state.currentActiveGroup : 0;
        groupsOrdered.map(function(g, gIndex) {
            if(this.props.limitToGroups && this.props.limitToGroups.indexOf(g) === -1){
                return;
            }
            var header, gData = allGroups[g];
            var className = 'pydio-form-group', active = false;
            if(accordionize){
                active = (currentActiveGroup === gIndex);
                if(gIndex === currentActiveGroup) {
                    className += ' form-group-active';
                } else {
                    className += ' form-group-inactive';
                }
            }
            if (!gData.FIELDS.length) {
                return;
            }
            if (gData.LABEL && !(this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf('GroupHeader') > -1)) {
                header = this.renderGroupHeader(gData.LABEL, accordionize, gIndex, active);
            }
            if(this.props.depth === 0){
                className += ' z-depth-1';
                groupPanes.push(
                    <Paper className={className} key={'pane-'+g}>
                        {gIndex===0 && this.props.header? this.props.header: null}
                        {header}
                        <div>
                            {gData.FIELDS}
                        </div>
                        {gIndex===groupsOrdered.length-1 && this.props.footer? this.props.footer: null}
                    </Paper>
                );
            }else{
                groupPanes.push(
                    <div className={className} key={'pane-'+g}>
                        {gIndex===0 && this.props.header? this.props.header: null}
                        {header}
                        <div>
                            {gData.FIELDS}
                        </div>
                        {gIndex===groupsOrdered.length-1 && this.props.footer? this.props.footer: null}
                    </div>
                );
            }
        }.bind(this));
        if(this.props.additionalPanes){
            let otherPanes = {top:[], bottom:[]};
            const depth = this.props.depth;
            let index = 0;
            ["top", "bottom"].forEach(k => {
                const additional = this.props.additionalPanes[k] || [];
                additional.map(function(p){
                    if(depth === 0){
                        otherPanes[k].push(
                            <Paper className="pydio-form-group additional" key={'other-pane-'+index}>{p}</Paper>
                        );
                    }else{
                        otherPanes[k].push(
                            <div className="pydio-form-group additional" key={'other-pane-'+index}>{p}</div>
                        );
                    }
                    index++;
                });
            });
            groupPanes = [...otherPanes.top, ...groupPanes, ...otherPanes.bottom];
        }

        if(this.props.tabs){
            const className = this.props.className;
            let initialSelectedIndex = 0;
            let i = 0;
            const tabs = this.props.tabs.map(function(tDef){
                const label = tDef['label'];
                const groups = tDef['groups'];
                if(tDef['selected']){
                    initialSelectedIndex = i;
                }
                const panes = groups.map(function(gId){
                    if(groupPanes[gId]){
                        return groupPanes[gId];
                    }else{
                        return null;
                    }
                });
                i++;
                return(
                    <Tab label={label}
                         key={label}
                         value={this.props.onTabChange ? i - 1  : undefined}>
                        <div className={(className?className+' ':' ') + 'pydio-form-panel' + (panes.length % 2 ? ' form-panel-odd':'')}>
                            {panes}
                        </div>
                    </Tab>
                );
            }.bind(this));
            if(this.state.tabSelectedIndex !== undefined){
                initialSelectedIndex = this.state.tabSelectedIndex;
            }
            return (
                <div className="layout-fill vertical-layout tab-vertical-layout">
                    <Tabs ref="tabs"
                          initialSelectedIndex={initialSelectedIndex}
                          value={this.props.onTabChange ? initialSelectedIndex : undefined}
                          onChange={this.props.onTabChange ? (i) => {this.setState({tabSelectedIndex:i});this.props.onTabChange(i)} : undefined}
                          style={{flex:1, display:'flex', flexDirection:'column'}}
                          contentContainerStyle={{flex:1, overflowY: 'auto'}}
                    >
                        {tabs}
                    </Tabs>
                </div>
            );

        }else{
            return (
                <div className={(this.props.className?this.props.className+' ':' ') + 'pydio-form-panel' + (groupPanes.length % 2 ? ' form-panel-odd':'')} onScroll={this.props.onScrollCallback} style={{...panelStyle}}>
                    {groupPanes}
                </div>
            );
        }


    },
});