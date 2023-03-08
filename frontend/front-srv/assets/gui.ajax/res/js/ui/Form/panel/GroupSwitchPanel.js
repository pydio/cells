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
import FormPanel from './FormPanel'
import SelectBox from '../fields/InputSelectBox'
const PropTypes = require('prop-types');
const LangUtils = require('pydio/util/lang')

/**
 * Sub form with a selector, switching its fields depending
 * on the selector value.
 */
export default class extends React.Component {
    static propTypes = {
        paramAttributes:PropTypes.object.isRequired,
        parameters:PropTypes.array.isRequired,
        values:PropTypes.object.isRequired,
        onChange:PropTypes.func.isRequired
    };

    computeSubPanelParameters = () => {

        // CREATE SUB FORM PANEL
        // Get all values
        const switchName = this.props.paramAttributes['type'].split(":").pop();
        const parentName = this.props.paramAttributes['name'];
        let switchValues = {}, potentialSubSwitches = [];

        this.props.parameters.map(function(p){
            "use strict";
            if(!p['group_switch_name']) return;
            if(p['group_switch_name'] != switchName){
                potentialSubSwitches.push(p);
                return;
            }
            const crtSwitch = p['group_switch_value'];
            if(!switchValues[crtSwitch]){
                switchValues[crtSwitch] = {
                    label :p['group_switch_label'],
                    fields : [],
                    values : {},
                    fieldsKeys:{}
                };
            }
            p = LangUtils.deepCopy(p);
            delete p['group_switch_name'];
            p['name'] =  parentName + '/' + p['name'];
            const vKey = p['name'];
            const paramName = vKey;
            if(switchValues[crtSwitch].fieldsKeys[paramName]){
                return;
            }
            switchValues[crtSwitch].fields.push(p);
            switchValues[crtSwitch].fieldsKeys[paramName] = paramName;
            if(this.props.values && this.props.values[vKey]){
                switchValues[crtSwitch].values[paramName] = this.props.values[vKey];
            }
        }.bind(this));
        // Remerge potentialSubSwitches to each parameters set
        for(let k in switchValues){
            if(switchValues.hasOwnProperty(k)){
                let sv = switchValues[k];
                sv.fields = sv.fields.concat(potentialSubSwitches);
            }
        }

        return switchValues;

    };

    clearSubParametersValues = (parentName, newValue, newFields) => {
        let vals = LangUtils.deepCopy(this.props.values);
        let toRemove = {};
        for(let key in vals){
            if(vals.hasOwnProperty(key) && key.indexOf(parentName+'/') === 0){
                toRemove[key] = '';
            }
        }
        vals[parentName] = newValue;

        newFields.map(function(p){
            if(p.type == 'hidden' && p['default'] && !p['group_switch_name'] || p['group_switch_name'] == parentName) {
                vals[p['name']] = p['default'];
                if(toRemove[p['name']] !== undefined) delete toRemove[p['name']];
            }else if(p['name'].indexOf(parentName+'/') === 0 && p['default']){
                if(p['type'] && p['type'].startsWith('group_switch:')){
                    //vals[p['name']] = {group_switch_value:p['default']};
                    vals[p['name']] = p['default'];
                }else{
                    vals[p['name']] = p['default'];
                }
            }
        });
        this.props.onChange(vals, true, toRemove);
        //this.onParameterChange(parentName, newValue);
    };

    onChange = (newValues, dirty, removeValues) => {
        this.props.onChange(newValues, true, removeValues);
    };

    render() {
        const {variant, variantShowLegend} = this.props;

        const attributes = this.props.paramAttributes;
        const values = this.props.values;

        const paramName = attributes['name'];
        const switchValues = this.computeSubPanelParameters(attributes);
        let selectorValues = new Map();
        Object.keys(switchValues).map(function(k) {
            selectorValues.set(k, switchValues[k].label);
        });
        const selectorChanger = function(newValue){
            this.clearSubParametersValues(paramName, newValue, switchValues[newValue]?switchValues[newValue].fields:[]);
        }.bind(this);
        let subForm, selectorLegend;
        const selector = (
            <SelectBox
                key={paramName}
                name={paramName}
                className="group-switch-selector"
                attributes={{
                    name:paramName,
                    choices:selectorValues,
                    label:attributes['label'] +  (variantShowLegend ? (' - ' + attributes['description']) : ''),
                    mandatory:attributes['mandatory']
                }}
                value={values[paramName]}
                onChange={selectorChanger}
                displayContext='form'
                disabled={this.props.disabled}
                ref="subFormSelector"
                variant={this.props.variant}
            />
        );

        let helperMark;
        if(this.props.setHelperData && this.props.checkHasHelper && this.props.checkHasHelper(attributes['name'], this.props.helperTestFor)){
            const showHelper = function(){
                this.props.setHelperData({paramAttributes:attributes, values:values});
            }.bind(this);
            helperMark = <span className="mdi mdi-comment-question-outline" onClick={showHelper}></span>;
        }

        if(values[paramName] && switchValues[values[paramName]]){
            const {onAltTextSwitch, altTextSwitchIcon, altTextSwitchTip} = this.props;
            subForm = (
                <FormPanel
                    onParameterChange={this.props.onParameterChange}
                    applyButtonAction={this.props.applyButtonAction}
                    disabled={this.props.disabled}
                    ref={paramName + '-SUB'}
                    key={paramName + '-SUB'}
                    className="sub-form"
                    parameters={switchValues[values[paramName]].fields}
                    values={values}
                    depth={this.props.depth+1}
                    onChange={this.onChange}
                    checkHasHelper={this.props.checkHasHelper}
                    setHelperData={this.props.setHelperData}
                    helperTestFor={values[paramName]}
                    accordionizeIfGroupsMoreThan={5}
                    onAltTextSwitch={onAltTextSwitch}
                    altTextSwitchIcon={altTextSwitchIcon}
                    altTextSwitchTip={altTextSwitchTip}
                    variant={this.props.variant}
                    variantShowLegend={this.props.variantShowLegend}
                />
            );
        }
        return (
            <div className="sub-form-group">
                {variant !== 'v2' && <div className="form-legend">{attributes['description']} {helperMark}</div>}
                {selector}
                {subForm}
            </div>
        );
    }
}