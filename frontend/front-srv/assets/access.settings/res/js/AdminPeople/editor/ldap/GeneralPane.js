import React from 'react'
import {Paper, TextField, SelectField, MenuItem, TimePicker} from 'material-ui'
import {AuthLdapServerConfig} from 'pydio/http/rest-api'

class GeneralPane extends React.Component{

    constructor(props){
        super(props);
    }

    /**
     *
     * @param d {Date}
     */
    updateSyncDate(d){
        const {config} = this.props;
        config.SchedulerDetails = d.getHours() + ":" + d.getMinutes();
    }

    render(){
        const {style, config, titleStyle, legendStyle} = this.props;

        let hDate = new Date();
        if(config.Schedule === 'daily' || !config.Schedule){
            const detail = config.SchedulerDetails || '3:00';
            const [h, m] = detail.split(':');
            hDate.setHours(parseInt(h), parseInt(m));
        }

        return (
            <div style={style}>
                <div>
                    <div style={titleStyle}>External Directory</div>
                    <div style={legendStyle}>Define how this directory will appear to users and when it will be synchronized with Pydio internal directory.</div>
                    <TextField
                        fullWidth={true}
                        floatingLabelText={"Label"}
                        value={config.DomainName} onChange={(e,v) => {config.DomainName = v}}
                    />
                    <div style={{display:'flex', alignItems: 'flex-end'}}>
                        <div style={{flex: 1}}>
                        <SelectField
                            floatingLabelText="Synchronization"
                            value={config.Schedule || 'daily'}
                            onChange={(e,i,val) => {config.Schedule = val;}}
                            fullWidth={true}
                        >
                            <MenuItem value={'daily'} primaryText="Daily" />
                            <MenuItem value={'hourly'} primaryText="Hourly" />
                            <MenuItem value={'manual'} primaryText="Manual" />
                        </SelectField>
                        </div>
                        {(config.Schedule === 'daily' || !config.Schedule) &&
                            <div style={{height: 52, paddingLeft: 10}}>
                            <TimePicker
                                format="ampm"
                                minutesStep={5}
                                hintText={"Sync Time"}
                                textFieldStyle={{width:100, marginRight: 5}}
                                value={hDate} onChange={(e,v) => {this.updateSyncDate(v)}}
                            />
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }

}

GeneralPane.propTypes = {
    style: React.PropTypes.object,
    config: React.PropTypes.instanceOf(AuthLdapServerConfig)
};

export {GeneralPane as default}