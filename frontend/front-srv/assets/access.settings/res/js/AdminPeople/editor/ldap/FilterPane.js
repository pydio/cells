import React from 'react'
import {Paper, TextField, SelectField, MenuItem, Toggle} from 'material-ui'
import DNs from './DNs'

class FilterPane extends React.Component{

    render(){
        const {style, config, legendStyle, titleStyle, pydio} = this.props;

        let user = config.User;

        return (
            <div style={style}>
                <div style={titleStyle}>{pydio.MessageHash["ldap.9"]}</div>
                <div style={legendStyle}>{pydio.MessageHash["ldap.10"]}</div>
                <div>
                    <DNs dns={user.DNs || ['']} onChange={(val) => {user.DNs = val}} pydio={pydio}/>
                    <TextField
                        fullWidth={true}
                        floatingLabelText={pydio.MessageHash["ldap.7"]}
                        value={user.Filter} onChange={(e,v) => {user.Filter = v}}
                    />
                    <TextField
                        fullWidth={true}
                        floatingLabelText={pydio.MessageHash["ldap.8"]}
                        value={user.IDAttribute} onChange={(e,v) => {user.IDAttribute = v}}
                    />
                </div>
            </div>
        );
    }

}

FilterPane.propTypes = {
    style: React.PropTypes.object,
};

export {FilterPane as default}