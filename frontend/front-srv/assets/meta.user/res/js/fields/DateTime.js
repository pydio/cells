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
import {DatePicker, TimePicker} from 'material-ui'
import MetaClient from "../MetaClient";
const {ModernTextField, ModernStyles} = Pydio.requireLib('hoc');
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

    componentDidMount() {
        const {fieldname} = this.props;
        MetaClient.getInstance().loadConfigs().then(metaConfigs => {
            let configs = metaConfigs.get(fieldname);
            this.setState(configs.data);
        });
    }

    getDate() {
        const {value} = this.props;
        if(!value) {
            return null
        }
        const mDate = new Date(parseFloat(value)*1000);
        if (isNaN(mDate.getTime())) {
            return new Date(0);
        } else {
            return mDate;
        }
    }

    updateDate(d) {
        const {updateValue} = this.props;
        const mDate = this.getDate() || new Date();
        d.setHours(mDate.getHours());
        d.setMinutes(mDate.getMinutes());
        d.setSeconds(mDate.getSeconds());
        updateValue(parseInt(d / 1000));
    }

    updateTime(d) {
        const {updateValue} = this.props;
        const date = this.getDate() || new Date();
        date.setHours(d.getHours());
        date.setMinutes(d.getMinutes());
        date.setSeconds(d.getSeconds());
        updateValue(parseInt(date / 1000));
    }

    render() {
        const {supportTemplates, updateValue, value, label} = this.props;
        if(supportTemplates) {
            return (
                <ModernTextField value={value} fullWidth={true} hintText={label} onChange={(event, value)=>{ updateValue(value);}}/>
            )
        }

        const {format = 'date'} = this.state;
        const vDate = this.getDate();
        const parts = [];
        if(format === 'date' || format === 'date-time') {
            parts.push(
                <div style={{flex: 3}}>
                    <DatePicker hintText={"Date"} {...ModernStyles.textField} fullWidth={true} value={vDate} onChange={(e,d) => this.updateDate(d)}/>
                </div>
            )
        }
        if(format === 'date-time') {
            parts.push(<div style={{width: 8}}></div>)
        }
        if(format === 'time' || format === 'date-time') {
            parts.push(
                <div style={{flex: 2}}>
                    <TimePicker hintText={"Time"} {...ModernStyles.textField} fullWidth={true} value={vDate} onChange={(e,d) => this.updateTime(d)}/>
                </div>
            )
        }
        return <div style={{display:'flex', alignItems:'center'}}>{parts}</div>
    }

}

DateTimeForm = asMetaForm(DateTimeForm)
export {DateTimeForm}