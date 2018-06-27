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

const React = require('react')
const ReactMUI = require('material-ui-legacy')
const LangUtils = require('pydio/util/lang')
const PydioApi = require('pydio/http/api')
const {Tabs, Tab, Paper} = require('material-ui')
import GroupSwitchPanel from './GroupSwitchPanel'
import ReplicationPanel from './ReplicationPanel'
import FormManager from '../manager/Manager'


/**
 * Form Panel is a ready to use form builder inherited for Pydio's legacy parameters formats ('standard form').
 * It is very versatile and can basically take a set of parameters defined in the XML manifests (or defined manually
 * in JS) and display them as a user form.
 * It is a controlled component: it takes a {values} object and triggers back an onChange() function.
 *
 * See also Manager class to get some utilitary functions to parse parameters and extract values for the form.
 */
export default React.createClass({

    _hiddenValues:{},
    _internalValid:null,
    _parametersMetadata:null,

    propTypes:{
        /**
         * Array of Pydio StandardForm parameters
         */
        parameters:React.PropTypes.array.isRequired,
        /**
         * Object containing values for the parameters
         */
        values:React.PropTypes.object,
        /**
         * Trigger unitary function when one form input changes.
         */
        onParameterChange:React.PropTypes.func,
        /**
         * Send all form values onchange, including eventually the removed ones (for dynamic panels)
         */
        onChange:React.PropTypes.func,
        /**
         * Triggered when the form globabally switches between valid and invalid state
         * Triggered once at form construction
         */
        onValidStatusChange:React.PropTypes.func,
        /**
         * Disable the whole form at once
         */
        disabled:React.PropTypes.bool,
        /**
         * String added to the image inputs for upload/download operations
         */
        binary_context:React.PropTypes.string,
        /**
         * 0 by default, subforms will have their zDepth value increased by one
         */
        depth:React.PropTypes.number,

        /**
         * Add an additional header component (added inside first subpanel)
         */
        header:React.PropTypes.object,
        /**
         * Add an additional footer component (added inside last subpanel)
         */
        footer:React.PropTypes.object,
        /**
         * Add other arbitrary panels, either at the top or the bottom
         */
        additionalPanes:React.PropTypes.shape({
            top:React.PropTypes.array,
            bottom:React.PropTypes.array
        }),
        /**
         * An array of tabs containing groupNames. Groups will be splitted
         * accross those tabs
         */
        tabs:React.PropTypes.array,
        /**
         * Fired when a the active tab changes
         */
        onTabChange:React.PropTypes.func,
        /**
         * A bit like tabs, but using accordion-like layout
         */
        accordionizeIfGroupsMoreThan:React.PropTypes.number,
        /**
         * Forward an event when scrolling the form
         */
        onScrollCallback:React.PropTypes.func,
        /**
         * Restrict to a subset of field groups
         */
        limitToGroups:React.PropTypes.array,
        /**
         * Ignore some specific fields types
         */
        skipFieldsTypes:React.PropTypes.array,

        /* Helper Options */
        /**
         * Pass pointers to the Pydio Companion container
         */
        setHelperData:React.PropTypes.func,
        /**
         * Function to check if the companion is active or none and if a parameter
         * has helper data
         */
        checkHasHelper:React.PropTypes.func,
        /**
         * Test for parameter
         */
        helperTestFor:React.PropTypes.string

    },

    externallySelectTab:function(index){
        this.setState({tabSelectedIndex: index});
    },

    getInitialState: function(){
        if(this.props.onTabChange) return {tabSelectedIndex:0};
        return {};
    },

    getDefaultProps:function(){
        return { depth:0, values:{} };
    },

    componentWillReceiveProps: function(newProps){
        if(JSON.stringify(newProps.parameters) !== JSON.stringify(this.props.parameters)){
            this._internalValid = null;
            this._hiddenValues = {};
            this._parametersMetadata = {};
        }
        if(newProps.values && newProps.values !== this.props.values){
            this.checkValidStatus(newProps.values);
        }
    },

    getValues:function(){
        return this.props.values;//LangUtils.mergeObjectsRecursive(this._hiddenValues, this.props.values);
    },

    onParameterChange: function(paramName, newValue, oldValue, additionalFormData=null){
        // Update writeValues
        var newValues = LangUtils.deepCopy(this.getValues());
        if(this.props.onParameterChange) {
            this.props.onParameterChange(paramName, newValue, oldValue, additionalFormData);
        }
        if(additionalFormData){
            if(!this._parametersMetadata) this._parametersMetadata = {};
            this._parametersMetadata[paramName] = additionalFormData;
        }
        newValues[paramName] = newValue;
        var dirty = true;
        this.onChange(newValues, dirty);
    },

    onChange:function(newValues, dirty, removeValues){
        if(this.props.onChange) {
            //newValues = LangUtils.mergeObjectsRecursive(this._hiddenValues, newValues);
            for(var key in this._hiddenValues){
                if(this._hiddenValues.hasOwnProperty(key) && newValues[key] === undefined && (!removeValues || removeValues[key] == undefined)){
                    newValues[key] = this._hiddenValues[key];
                }
            }
            this.props.onChange(newValues, dirty, removeValues);
        }
        this.checkValidStatus(newValues);
    },

    onSubformChange:function(newValues, dirty, removeValues){
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

    onSubformValidStatusChange:function(newValidValue, failedMandatories){
        if((newValidValue !== this._internalValid || this.props.forceValidStatusCheck) && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newValidValue, failedMandatories);
        }
        this._internalValid = newValidValue;
    },

    applyButtonAction: function(parameters, callback){
        if(this.props.applyButtonAction){
            this.props.applyButtonAction(parameters, callback);
            return;
        }
        parameters = LangUtils.mergeObjectsRecursive(parameters, this.getValuesForPOST(this.getValues()));
        PydioApi.getClient().request(parameters, callback);
    },

    getValuesForPOST:function(values, prefix='DRIVER_OPTION_'){
        return FormManager.getValuesForPOST(this.props.parameters, values, prefix, this._parametersMetadata);
    },

    checkValidStatus:function(values){
        var failedMandatories = [];
        this.props.parameters.map(function(p){
            if (['string', 'textarea', 'password', 'integer'].indexOf(p.type) > -1 && (p.mandatory == "true" || p.mandatory === true)) {
                if(!values || !values.hasOwnProperty(p.name) || values[p.name] === undefined || values[p.name] === ""){
                    failedMandatories.push(p);
                }
            }
            if( ( p.type === 'valid-password' ) && this.refs['form-element-' + p.name]){
                if(!this.refs['form-element-' + p.name].isValid()){
                    failedMandatories.push(p);
                }
            }
        }.bind(this));
        var previousValue, newValue;
        previousValue = this._internalValid;//(this._internalValid !== undefined ? this._internalValid : true);
        newValue = failedMandatories.length ? false : true;
        if((newValue !== this._internalValid || this.props.forceValidStatusCheck) && this.props.onValidStatusChange) {
            this.props.onValidStatusChange(newValue, failedMandatories);
        }
        this._internalValid = newValue;
    },

    componentDidMount:function(){
        this.checkValidStatus(this.props.values);
    },

    renderGroupHeader:function(groupLabel, accordionize, index, active){

        var properties = { key: 'group-' + groupLabel };
        if(accordionize){
            var current = (this.state && this.state.currentActiveGroup) ? this.state.currentActiveGroup : null;
            properties['className'] = 'group-label-' + (active ? 'active' : 'inactive');
            properties['onClick'] = function(){
                this.setState({currentActiveGroup:(current != index ? index : null)});
            }.bind(this);
            groupLabel = [<span key="toggler" className={"group-active-toggler icon-angle-" + (current == index ? 'down' : 'right') }></span>, groupLabel];
        }

        return React.createElement(
            'h' + (3 + this.props.depth),
            properties,
            groupLabel
        );

    },

    render:function(){
        var allGroups = [];
        var values = this.getValues();
        var groupsOrdered = ['__DEFAULT__'];
        allGroups['__DEFAULT__'] = {FIELDS:[]};
        var replicationGroups = {};

        this.props.parameters.map(function(attributes){

            var type = attributes['type'];
            if(this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf(type) > -1){
                return;
            }
            var paramName = attributes['name'];
            var field;
            if(attributes['group_switch_name']) return;

            var group = attributes['group'] || '__DEFAULT__';
            if(!allGroups[group]){
                groupsOrdered.push(group);
                allGroups[group] = {FIELDS:[], LABEL:group};
            }

            var repGroup = attributes['replicationGroup'];
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
                var repAttr = LangUtils.deepCopy(attributes);
                delete repAttr['replicationGroup'];
                delete repAttr['group'];
                replicationGroups[repGroup].PARAMS.push(repAttr);

            }else{

                if(type.indexOf("group_switch:") === 0){

                    field = (
                        <GroupSwitchPanel
                            {...this.props}
                            onChange={this.onSubformChange}
                            paramAttributes={attributes}
                            parameters={this.props.parameters}
                            values={this.props.values}
                            key={paramName}
                            onScrollCallback={null}
                            limitToGroups={null}
                            onValidStatusChange={this.onSubformValidStatusChange}
                        />
                    );

                }else if(attributes['type'] !== 'hidden'){

                    var helperMark;
                    if(this.props.setHelperData && this.props.checkHasHelper && this.props.checkHasHelper(attributes['name'], this.props.helperTestFor)){
                        var showHelper = function(){
                            this.props.setHelperData({
                                paramAttributes:attributes,
                                values:values,
                                postValues:this.getValuesForPOST(values),
                                applyButtonAction:this.applyButtonAction
                            }, this.props.helperTestFor);
                        }.bind(this);
                        helperMark = <span className="icon-question-sign" onClick={showHelper}></span>;
                    }
                    var mandatoryMissing = false;
                    var classLegend = "form-legend";
                    if(attributes['errorText']) {
                        classLegend = "form-legend mandatory-missing";
                    }else if(attributes['warningText']){
                        classLegend = "form-legend warning-message";
                    }else if( attributes['mandatory'] && (attributes['mandatory'] === "true" || attributes['mandatory'] === true) ){
                        if(['string', 'textarea', 'image', 'integer'].indexOf(attributes['type']) !== -1 && !values[paramName]){
                            mandatoryMissing = true;
                            classLegend = "form-legend mandatory-missing";
                        }
                    }

                    var props = {
                        ref:"form-element-" + paramName,
                        attributes:attributes,
                        name:paramName,
                        value:values[paramName],
                        onChange:function(newValue, oldValue, additionalFormData){
                            this.onParameterChange(paramName, newValue, oldValue, additionalFormData);
                        }.bind(this),
                        disabled:this.props.disabled || attributes['readonly'],
                        multiple:attributes['multiple'],
                        binary_context:this.props.binary_context,
                        displayContext:'form',
                        applyButtonAction:this.applyButtonAction,
                        errorText:mandatoryMissing? pydio.MessageHash['621']:( attributes.errorText?attributes.errorText:null )
                    };

                    field = (
                        <div key={paramName} className={'form-entry-' + attributes['type']}>
                            {FormManager.createFormElement(props)}
                            <div className={classLegend}>{attributes['warningText'] ? attributes['warningText'] : attributes['description']} {helperMark}</div>
                        </div>
                    );
                }else{

                    this._hiddenValues[paramName] = (values[paramName] !== undefined ? values[paramName] : attributes['default']);

                }

                if(field) {
                    allGroups[group].FIELDS.push(field);
                }

            }


        }.bind(this));

        for(var rGroup in replicationGroups){
            if (!replicationGroups.hasOwnProperty(rGroup)) continue;
            var rGroupData = replicationGroups[rGroup];
            allGroups[rGroupData.GROUP].FIELDS[rGroupData.POSITION] = (
                <ReplicationPanel
                    {...this.props}
                    key={"replication-group-" + rGroupData.PARAMS[0].name}
                    onChange={this.onSubformChange}
                    onParameterChange={null}
                    values={this.getValues()}
                    depth={this.props.depth+1}
                    parameters={rGroupData.PARAMS}
                    applyButtonAction={this.applyButtonAction}
                    onScrollCallback={null}
                />
            );
        }

        var groupPanes = [];
        var accordionize = (this.props.accordionizeIfGroupsMoreThan && groupsOrdered.length > this.props.accordionizeIfGroupsMoreThan);
        var currentActiveGroup = (this.state && this.state.currentActiveGroup) ? this.state.currentActiveGroup : 0;
        groupsOrdered.map(function(g, gIndex) {
            if(this.props.limitToGroups && this.props.limitToGroups.indexOf(g) === -1){
                return;
            }
            var header, gData = allGroups[g];
            var className = 'pydio-form-group', active = false;
            if(accordionize){
                active = (currentActiveGroup == gIndex);
                if(gIndex == currentActiveGroup) className += ' form-group-active';
                else className += ' form-group-inactive';
            }
            if (!gData.FIELDS.length) return;
            if (gData.LABEL && !(this.props.skipFieldsTypes && this.props.skipFieldsTypes.indexOf('GroupHeader') > -1)) {
                header = this.renderGroupHeader(gData.LABEL, accordionize, gIndex, active);
            }
            if(this.props.depth == 0){
                className += ' z-depth-1';
                groupPanes.push(
                    <Paper className={className} key={'pane-'+g}>
                        {gIndex==0 && this.props.header? this.props.header: null}
                        {header}
                        <div>
                            {gData.FIELDS}
                        </div>
                        {gIndex==groupsOrdered.length-1 && this.props.footer? this.props.footer: null}
                    </Paper>
                );
            }else{
                groupPanes.push(
                    <div className={className} key={'pane-'+g}>
                        {gIndex==0 && this.props.header? this.props.header: null}
                        {header}
                        <div>
                            {gData.FIELDS}
                        </div>
                        {gIndex==groupsOrdered.length-1 && this.props.footer? this.props.footer: null}
                    </div>
                );
            }
        }.bind(this));
        if(this.props.additionalPanes){
            let otherPanes = {top:[], bottom:[]};
            const depth = this.props.depth;
            let index = 0;
            for(let k in otherPanes){
                if(!otherPanes.hasOwnProperty(k)) continue;
                if(this.props.additionalPanes[k]){
                    this.props.additionalPanes[k].map(function(p){
                        if(depth == 0){
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
                }
            }
            groupPanes = otherPanes['top'].concat(groupPanes).concat(otherPanes['bottom']);
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
                <div className={(this.props.className?this.props.className+' ':' ') + 'pydio-form-panel' + (groupPanes.length % 2 ? ' form-panel-odd':'')} onScroll={this.props.onScrollCallback}>
                    {groupPanes}
                </div>
            );
        }


    }

});