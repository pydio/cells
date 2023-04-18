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
const {IconButton} = require('material-ui')
import ReplicatedGroup from './ReplicatedGroup'
const PropTypes = require('prop-types');
const LangUtils = require('pydio/util/lang')

/**
 * Sub form replicating itself (+/-)
 */
export default class extends React.Component {
    static propTypes = {
        parameters:PropTypes.array.isRequired,
        values:PropTypes.object,
        onChange:PropTypes.func,
        disabled:PropTypes.bool,
        binary_context:PropTypes.string,
        depth:PropTypes.number
    };

    buildSubValue = (values, index=0) => {
        let subVal;
        const suffix = index==0?'':'_'+index;
        this.props.parameters.map(function(p){
            const pName = p['name'];
            if(values[pName+suffix] !== undefined){
                if(!subVal) subVal = {};
                subVal[pName] = values[pName+suffix];
            }
        });
        return subVal || false;
    };

    indexedValues = (rowsArray) => {
        let values = {};
        const {parameters} = this.props;
        rowsArray.map(function(row, index){
            const suffix = index===0?'':'_'+index;
            parameters.forEach(param => {
                const colName = param.name
                let value = row[colName]
                if(value === undefined) {
                    if(param["default"]) {
                        value = param["default"]
                    } else {
                        switch (param["type"]) {
                            case "string":
                            case "select":
                                value = ""
                                break;
                            case "number":
                                value = 0
                                break;
                            case "boolean":
                                value = false
                                break;
                            default:
                                value = null
                        }
                    }
                }
                values[colName+suffix] = value
            })
        });
        return values;
    };

    indexValues = (rowsArray, removeLastRow) => {
        const indexed = this.indexedValues(rowsArray);
        if(this.props.onChange){
            if(removeLastRow){
                let lastRow = {}, nextIndex = rowsArray.length-1;
                this.props.parameters.map(function(p){
                    lastRow[p['name'] + (nextIndex > 0 ? '_' + nextIndex : '')] = '';
                });
                this.props.onChange(indexed, true, lastRow);
            }else{
                this.props.onChange(indexed, true);
            }
        }
    };

    instances = () => {
        // Analyze current value to grab number of rows.
        let rows = [], subVal, index = 0;
        while(subVal = this.buildSubValue(this.props.values, index)){
            index ++;
            rows.push(subVal);
        }
        const firstParam = this.props.parameters[0];
        if(!rows.length && firstParam['replicationMandatory'] === 'true'){
            let emptyValue={};
            this.props.parameters.map(function(p) {
                emptyValue[p['name']] = p['default'] || '';
            });
            rows.push(emptyValue);
        }
        return rows;
    };

    addRow = () => {
        let newValue={}, currentValues = this.instances();
        this.props.parameters.map(function(p) {
            newValue[p['name']] = p['default'] || '';
        });
        currentValues.push(newValue);
        this.indexValues(currentValues);
    };

    removeRow = (index) => {
        let instances = this.instances();
        const removeInst = instances[index];
        instances = LangUtils.arrayWithout(this.instances(), index);
        instances.push(removeInst);
        this.indexValues(instances, true);
    };

    swapRows = (i, j) => {
        let instances = this.instances();
        let tmp = instances[j];
        instances[j] = instances[i];
        instances[i] = tmp;
        this.indexValues(instances);
    };

    onChange = (index, newValues, dirty) => {
        let instances = this.instances();
        instances[index] = newValues;
        this.indexValues(instances);
    };

    onParameterChange = (index, paramName, newValue, oldValue) => {
        let instances = this.instances();
        instances[index][paramName] = newValue;
        this.indexValues(instances);
    };

    render() {
        const {parameters, disabled, variant} = this.props;
        let firstParam = parameters[0];
        const replicationTitle = firstParam['replicationTitle'] || firstParam['label'];
        const replicationMandatory = firstParam['replicationMandatory'] === 'true';

        const instances = this.instances();
        const multipleRows = instances.length > 1;
        const rows = instances.map((subValues, index) => {
            let onSwapUp, onSwapDown, onRemove;
            const onParameterChange = (paramName, newValue, oldValue) => {
                this.onParameterChange(index, paramName, newValue, oldValue);
            };
            if(multipleRows && index > 0){
                onSwapUp = () => { this.swapRows(index, index-1) };
            }
            if(multipleRows && index < instances.length - 1){
                onSwapDown = () => { this.swapRows(index, index+1) };
            }
            if( multipleRows || !replicationMandatory ) {
                onRemove = () => { this.removeRow(index); };
            }
            const props = {onSwapUp, onSwapDown, onRemove, onParameterChange};
            if(replicationMandatory && index === 0){
                props.onAddValue = ()=> this.addRow() ;
            }
            return ( <ReplicatedGroup key={index} {...this.props} {...props} subValues={subValues} /> );
        });

        if(replicationMandatory){
            return <div className="replicable-field" style={{marginBottom: 14}}>{rows}</div>
        }

        let tStyle = rows.length?{}:{backgroundColor:'whitesmoke', borderRadius:4};
        let contStyle = {marginBottom: 14}
        if(variant==='v2'){
            tStyle = {...tStyle, height: 52, backgroundColor: '#f6f6f8', marginTop: 8, borderRadius: '4px 4px 0 0'}
            if (!rows.length) {
                tStyle = {...tStyle, borderBottom:'1px solid rgba(158,158,158,.3)'};
                contStyle = {height: 58};
            }
        }
        return (
            <div className="replicable-field" style={contStyle}>
                <div style={{display:'flex', alignItems:'center', ...tStyle}}>
                    <div className="title" style={{fontSize: 16, flex: 1, paddingLeft: 8}}>{replicationTitle}</div>
                    <IconButton key="add" iconClassName="mdi mdi-plus-box" tooltipPosition={"bottom-left"} style={{padding: 14}} iconStyle={{fontSize:20, color:'#9e9e9e'}} tooltip="Add value" onClick={()=>this.addRow()} disabled={disabled}/>
                </div>
                {rows}
            </div>

        );
    }
}