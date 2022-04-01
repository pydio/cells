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
import React, {Fragment, Component} from 'react'
import Pydio from 'pydio'
import asMetaField from "../hoc/asMetaField";
import asMetaForm from "../hoc/asMetaForm";
import {DatePicker, TimePicker, MenuItem, FontIcon} from 'material-ui'
import MetaClient from "../MetaClient";
const {ModernTextField, ModernSelectField, ModernStyles} = Pydio.requireLib('hoc');
const {moment} = Pydio.requireLib('boot')

class DateTimeField extends Component {
    render() {
        const {getRealValue, configs, column} = this.props;

        let fieldConfig = configs.get(column.name);
        let format = 'date', display = 'normal';
        if(fieldConfig && fieldConfig.data){
            format = fieldConfig.data.format || format;
            display = fieldConfig.data.display || display;
        }
        const value = getRealValue();
        let mDate = new Date(parseFloat(value)*1000);
        if(isNaN(mDate.getTime())){
            return <Fragment>[Invalid Date]</Fragment>
        }
        const mom = new moment(mDate);
        if(display === 'relative') {
            return <Fragment>{mom.fromNow()}</Fragment>
        }
        switch (format){
            case 'date':
                return <Fragment>{mom.format('ll')}</Fragment>
            case 'date-time':
                return <Fragment>{mom.format('llll')}</Fragment>
            case 'time':
                return <Fragment>{mom.format('LT')}</Fragment>
            default:
                return <Fragment>{mom.format('llll')}</Fragment>
        }
    }
}

DateTimeField = asMetaField(DateTimeField)
export {DateTimeField}

class DateTimeForm extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    configAsState(configs, fieldname){
        if(configs.has(fieldname)){
            this.setState(configs.get(fieldname).data)
        }
    }

    componentDidMount() {
        const {fieldname, configs} = this.props;
        if(configs){
            this.configAsState(configs, fieldname)
        }else{
            MetaClient.getInstance().loadConfigs().then(metaConfigs => this.configAsState(metaConfigs, fieldname));
        }
    }

    getDate() {
        const {value} = this.props;
        let searchComp = '';
        if(!value) {
            return {vDate: null, searchComp}
        }
        let floatValue;
        if (value.indexOf && ['<','>'].indexOf(value.charAt(0))>-1){
            searchComp = value.charAt(0)
            if(value.charAt(1) === "=") {
                searchComp += "="
                floatValue = parseFloat(value.substr(2))
            } else {
                floatValue = parseFloat(value.substr(1))
            }
        } else {
            floatValue = parseFloat(value)
        }
        const mDate = new Date(parseFloat(floatValue)*1000);
        if (isNaN(mDate.getTime())) {
            return {vDate: new Date(0), searchComp};
        } else {
            return {vDate: mDate, searchComp};
        }
    }

    clear() {
        const {updateValue} = this.props;
        updateValue('');
    }

    updateDate(d, format) {
        const {updateValue, search} = this.props;
        let {vDate, searchComp} = this.getDate();
        if(!vDate){
            vDate = new Date(0)
        }
        if(format === 'date-time') {
            d.setHours(vDate.getHours());
            d.setMinutes(vDate.getMinutes());
            d.setSeconds(vDate.getSeconds());
        } else {
            // For date only, fix to 0:00
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
        }
        if(search) {
            updateValue(searchComp + '' + parseInt(d / 1000));
        } else {
            updateValue(parseInt(d / 1000));
        }
    }

    updateTime(d) {
        const {updateValue, search} = this.props;
        let {vDate, searchComp} = this.getDate();
        if(!vDate){
            vDate = new Date(0)
        }
        vDate.setHours(d.getHours());
        vDate.setMinutes(d.getMinutes());
        vDate.setSeconds(d.getSeconds());
        if(search) {
            updateValue(searchComp + '' + parseInt(vDate / 1000));
        } else {
            updateValue(parseInt(vDate / 1000));
        }
    }

    updateComp(searchComparator) {
        const {updateValue} = this.props;
        let {vDate} = this.getDate();
        if(!vDate){
            vDate = new Date()
        }
        updateValue(searchComparator + '' + parseInt(vDate / 1000));
    }

    render() {
        const {supportTemplates, search, updateValue, value, label} = this.props;
        if(supportTemplates) {
            return (
                <ModernTextField value={value} fullWidth={true} hintText={label} onChange={(event, value)=>{ updateValue(value);}}/>
            )
        }

        const {format = 'date'} = this.state;
        const {vDate, searchComp} = this.getDate();
        const parts = [];
        if (search) {
            parts.push(
                <div style={{width: 60, marginRight:8}}>
                    <ModernSelectField fullWidth={true} value={searchComp} onChange={(e,i,v)=>this.updateComp(v)}>
                        <MenuItem value={""} primaryText={"="}/>
                        <MenuItem value={">="} primaryText={">="}/>
                        <MenuItem value={"<="} primaryText={"<="}/>
                        <MenuItem value={">"} primaryText={">"}/>
                        <MenuItem value={"<"} primaryText={"<"}/>
                    </ModernSelectField>
                </div>
            )
        }
        const sProps = search ? {...ModernStyles.textField} : {...ModernStyles.textFieldV2, textFieldStyle:{height: 52}}
        if(format === 'date' || format === 'date-time') {
            parts.push(
                <div style={{flex: 3}}>
                    <DatePicker
                        floatingLabelText={search ? null : (label + ' (date)')}
                        hintText={search ? "Date" : null}
                        {...sProps}
                        container={"inline"}
                        fullWidth={true}
                        value={vDate}
                        onChange={(e,d) => this.updateDate(d, format)}
                        autoOk={format === 'date'}
                    />
                </div>
            )
        }
        if(format === 'date-time') {
            parts.push(<div style={{width: 8}}></div>)
        }
        if(format === 'time' || format === 'date-time') {
            parts.push(
                <div style={{flex: 2}}>
                    <TimePicker
                        floatingLabelText={search ? null : (label + ' (time)')}
                        hintText={search ? "Time" : null}
                        {...sProps}
                        dialogStyle={{zIndex: 5000}}
                        fullWidth={true}
                        value={vDate}
                        onChange={(e,d) => this.updateTime(d)}
                        autoOk={format === 'time'}
                    />
                </div>
            )
        }
        if(!search && vDate) {
            parts.push(
                <div style={{cursor: 'pointer', ...ModernStyles.fillBlockV2Right, paddingTop:22, paddingRight:8}} onClick={() => this.clear()}>
                    <FontIcon className={"mdi mdi-close"} color={'rgba(0,0,0,.5)'}/>
                </div>
            );
        }
        return <div style={{display:'flex', alignItems:'center', marginBottom:search?null:6}}>{parts}</div>
    }

}

DateTimeForm = asMetaForm(DateTimeForm)
export {DateTimeForm}