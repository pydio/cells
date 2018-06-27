import React from 'react'
import {Paper, TextField, SelectField, MenuItem, Toggle, IconButton} from 'material-ui'
import {AuthLdapServerConfig} from 'pydio/http/rest-api'

class ConnectionPane extends React.Component{

    constructor(props){
        super(props);
        this.state = {advanced: false};
    }

    render(){
        const {style, config, titleStyle, legendStyle, divider, pydio} = this.props;
        const {advanced} = this.state;

        return (
            <div style={style}>
                <div>
                    <div style={titleStyle}>Connection</div>
                    <div style={legendStyle}>Required parameters to connect to your external directory (LDAP or ActiveDirectory)</div>
                    <TextField
                        fullWidth={true}
                        floatingLabelText={"Host"}
                        value={config.Host} onChange={(e,v) => {config.Host = v}}
                    />
                    <SelectField
                        floatingLabelText={pydio.MessageHash["ldap.12"]}
                        value={config.Connection || 'normal'}
                        onChange={(e,i,val) => {config.Connection = val}}
                        fullWidth={true}
                    >
                        <MenuItem value={'normal'} primaryText={pydio.MessageHash["ldap.15"]} />
                        <MenuItem value={'ssl'} primaryText={pydio.MessageHash["ldap.16"]} />
                        <MenuItem value={'starttls'} primaryText={pydio.MessageHash["ldap.17"]} />
                    </SelectField>
                    <TextField
                        fullWidth={true}
                        floatingLabelText={pydio.MessageHash["ldap.18"]}
                        value={config.BindDN} onChange={(e,v) => {config.BindDN = v}}
                    />
                    <TextField
                        fullWidth={true}
                        floatingLabelText={pydio.MessageHash["ldap.19"]}
                        value={config.BindPW || ''} onChange={(e,v) => {config.BindPW = v}}
                        type={"password"}
                        autoComplete={false}
                    />
                </div>
                {divider}
                <div>
                    <div style={{...titleStyle, display:'flex', alignItems: 'center', marginTop: 10, paddingBottom: 0}}>
                        <span style={{flex: 1}}>Advanced Settings</span>
                        <IconButton iconClassName={"mdi mdi-chevron-" + (advanced? 'up':'down')} onTouchTap={()=>{this.setState({advanced:!advanced})}}/>
                    </div>
                    {advanced &&
                        <div>
                            <div style={{height: 50, display:'flex', alignItems:'flex-end'}}>
                                <Toggle
                                    toggled={config.SkipVerifyCertificate}
                                    onToggle={(e, val) => {config.SkipVerifyCertificate = val}}
                                    labelPosition={"right"}
                                    label={pydio.MessageHash["ldap.20"]}
                                />
                            </div>
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.21"]}
                                value={config.RootCA} onChange={(e,v) => {config.RootCA = v}}
                            />
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.22"]}
                                multiLine={true}
                                value={config.RootCAData} onChange={(e,v) => {config.RootCAData = v}}
                            />
                            <TextField
                                fullWidth={true}
                                floatingLabelText={pydio.MessageHash["ldap.23"]}
                                value={config.PageSize || 500} onChange={(e,v) => {config.PageSize = parseInt(v)}}
                                type={"number"}
                            />
                        </div>
                    }
                </div>
            </div>
        );
    }

}

ConnectionPane.propTypes = {
    style: React.PropTypes.object,
    config: React.PropTypes.instanceOf(AuthLdapServerConfig)
};

export {ConnectionPane as default}