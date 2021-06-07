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

const {
    Component
} = require('react')
import PropTypes from 'prop-types'
const {Toggle, Subheader, MenuItem, SelectField, TextField, TimePicker} = require('material-ui')

class EmailPanel extends Component{

    onChange(partialValues){
        const {values, onChange} = this.props;
        onChange({...values, ...partialValues}, true);
    }

    onFrequencyChange(value){
        let partial = {NOTIFICATIONS_EMAIL_FREQUENCY:value};
        let newUserValue;
        switch(value){
            case 'M':
                newUserValue = '5'
                break;
            case 'H':
                newUserValue = '2'
                break;
            case 'D1':
                newUserValue = '03'
                break;
            case 'D2':
                newUserValue = '09,14'
                break;
            case 'W1':
                newUserValue = 'Monday'
                break;
        }
        partial.NOTIFICATIONS_EMAIL_FREQUENCY_USER = newUserValue;
        this.onChange(partial);
    }

    onPickDate(position, event, date){
        const {NOTIFICATIONS_EMAIL_FREQUENCY_USER} = this.props.values;
        const hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER.split(',');
        let newHours = [];
        if(position === 'first') newHours = [date.getHours(), hours[1] ? hours[1] : '00'];
        if(position === 'last') newHours = [hours[0] ? hours[0] : '00', date.getHours()];
        this.onChange({NOTIFICATIONS_EMAIL_FREQUENCY_USER:newHours.join(',')});
    }

    render(){

        const {definitions, values, pydio} = this.props;
        const message = (id) => {return pydio.MessageHash['user_dash.' + id]};
        const {NOTIFICATIONS_EMAIL_GET, NOTIFICATIONS_EMAIL_FREQUENCY, NOTIFICATIONS_EMAIL_FREQUENCY_USER, NOTIFICATIONS_EMAIL, NOTIFICATIONS_EMAIL_SEND_HTML} = values;

        const mailActive = (NOTIFICATIONS_EMAIL_GET === 'true');
        let frequencyTypes = new Map();
        let frequencyMenus = [];
        definitions[1]['choices'].split(',').map((e)=>{
            const d = e.split('|');
            frequencyTypes.set(d[0], d[1]);
            frequencyMenus.push(<MenuItem primaryText={d[1]} value={d[0]}/>);
        });
        let userFrequencyComponent;
        if(mailActive){
            switch (NOTIFICATIONS_EMAIL_FREQUENCY){
                case 'M':
                case 'H':
                    userFrequencyComponent = (
                        <TextField
                            fullWidth={true}
                            floatingLabelText={NOTIFICATIONS_EMAIL_FREQUENCY === 'M' ? message(62) : message(63)}
                            value={NOTIFICATIONS_EMAIL_FREQUENCY_USER}
                            onChange={(e,v) => {this.onChange({NOTIFICATIONS_EMAIL_FREQUENCY_USER:v})}}
                        />
                    );
                    break;
                case 'D1':
                    let d = new Date();
                    d.setHours(NOTIFICATIONS_EMAIL_FREQUENCY_USER);d.setMinutes(0);
                    userFrequencyComponent = (
                        <TimePicker
                            format="ampm"
                            hintText={message(64)}
                            value={d}
                            onChange={(e,date) => {this.onChange({NOTIFICATIONS_EMAIL_FREQUENCY_USER:date.getHours()})}}
                            autoOk={true}
                            textFieldStyle={{width: '100%'}}
                        />
                    )
                    break;
                case 'D2':
                    let hours = NOTIFICATIONS_EMAIL_FREQUENCY_USER + '';
                    if(!hours) hours = '09,14';
                    hours = hours.split(',');
                    let d1 = new Date();
                    let d2 = new Date(); d2.setMinutes(0);
                    d1.setHours(hours[0]); d1.setMinutes(0);
                    if(hours[1]){
                        d2.setHours(hours[1]);
                    }
                    userFrequencyComponent = (
                        <div style={{display:'flex'}}>
                            <TimePicker
                                format="ampm"
                                hintText={message(65)}
                                value={d1}
                                onChange={this.onPickDate.bind(this, 'first')}
                                textFieldStyle={{width:100, marginRight: 5}}
                            />
                            <TimePicker
                                format="ampm"
                                hintText={message(66)}
                                value={d2}
                                onChange={this.onPickDate.bind(this, 'last')}
                                textFieldStyle={{width:100, marginLeft: 5}}
                            />
                        </div>
                    )
                    break;
                case 'W1':
                    userFrequencyComponent = (
                        <SelectField
                            floatingLabelText={message(67)}
                            fullWidth={true}
                            value={NOTIFICATIONS_EMAIL_FREQUENCY_USER}
                            onChange={(e,i,v) => {this.onChange({NOTIFICATIONS_EMAIL_FREQUENCY_USER: v})}}
                        >
                            <MenuItem primaryText={message(68)} value="Monday"/>
                            <MenuItem primaryText={message(69)} value="Tuesday"/>
                            <MenuItem primaryText={message(70)} value="Wednesday"/>
                            <MenuItem primaryText={message(71)} value="Thursday"/>
                            <MenuItem primaryText={message(72)} value="Friday"/>
                            <MenuItem primaryText={message(73)} value="Saturday"/>
                            <MenuItem primaryText={message(74)} value="Sunday"/>
                        </SelectField>
                    )
                    break;
            }
        }


        return (
            <div>
                <Subheader style={{paddingLeft: 20}}>{message(61)}</Subheader>
                <div style={{padding: '0 20px 20px'}}>
                    <Toggle
                        label={definitions[0]['label']}
                        toggled={NOTIFICATIONS_EMAIL_GET === 'true'}
                        onToggle={(e,v)=>{this.onChange({NOTIFICATIONS_EMAIL_GET:v?'true':'false'})}}
                    />
                    {mailActive &&
                        <div style={{paddingBottom: 16}}>
                            <div style={{padding:'16px 0'}}>
                                <Toggle
                                    label={definitions[4]['label']}
                                    toggled={NOTIFICATIONS_EMAIL_SEND_HTML === 'true'}
                                    onToggle={(e,v)=>{this.onChange({NOTIFICATIONS_EMAIL_SEND_HTML:v?'true':'false'})}}
                                />
                            </div>
                            <SelectField
                                fullWidth={true}
                                floatingLabelText={definitions[1]['label']}
                                value={NOTIFICATIONS_EMAIL_FREQUENCY}
                                onChange={(e,k,p) => {this.onFrequencyChange(p)}}
                            >{frequencyMenus}</SelectField>
                            {userFrequencyComponent}
                        </div>
                    }
                </div>
            </div>
        );

    }

}

EmailPanel.propTypes = {

    definitions:PropTypes.object,
    values: PropTypes.object,
    onChange: PropTypes.func

}

export {EmailPanel as default}