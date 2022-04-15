import React from 'react'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import User from '../model/User'
const {FormPanel} = Pydio.requireLib('form');

class GroupInfo extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"group")]|//param[contains(@scope,"group")]').then(params => {
            this.setState({parameters: params});
        })

    }

    getPydioRoleMessage(messageId){
        const {pydio} = this.props;
        return pydio.MessageHash['role_editor.' + messageId] || messageId;
    }

    onParameterChange(paramName, newValue, oldValue){
        const {group} = this.props;
        const {parameters} = this.state;
        const params = parameters.filter(p => p.name === paramName);
        const idmUser = group.getIdmUser();
        const role = group.getRole();
        if(paramName === 'displayName' || paramName === 'email' || paramName === 'profile'){
            idmUser.Attributes[paramName] = newValue;
        } else if (params.length && params[0].aclKey) {
            role.setParameter(params[0].aclKey, newValue);
        }
    }

    render(){

        const {group, pydio} = this.props;
        const {parameters} = this.state;
        if(!parameters){
            return <div>Loading...</div>;
        }

        // Load group-scope parameters
        let values = {}, locks = '';
        if(group){
            // Compute values
            const idmUser = group.getIdmUser();
            const role = group.getRole();
            let label = idmUser.GroupLabel;
            if(idmUser.Attributes && idmUser.Attributes['displayName']){
                label = idmUser.Attributes['displayName'];
            }
            values = {
                groupPath: LangUtils.trimRight(idmUser.GroupPath, '/') + '/' + idmUser.GroupLabel,
                displayName: label
            };
            parameters.map(p => {
                if(p.aclKey && role.getParameterValue(p.aclKey)){
                    values[p.name] = role.getParameterValue(p.aclKey);
                }
            });
        }
        const params = [
            {"name":"groupPath",label:this.getPydioRoleMessage('34'),"type":"string", readonly:true},
            {"name":"displayName",label:this.getPydioRoleMessage('35'),"type":"string", },
            ...parameters
        ];

        return (
            <div>
                <FormPanel
                    parameters={params}
                    onParameterChange={this.onParameterChange.bind(this)}
                    values={values}
                    variant={"v2"}
                    depth={-2}
                />
            </div>
        );


    }

}

GroupInfo.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    pluginsRegistry: PropTypes.instanceOf(XMLDocument),
    group: PropTypes.instanceOf(User),
};

export {GroupInfo as default}