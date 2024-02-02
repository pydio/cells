import React from 'react'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import Role from '../model/Role'
const {FormPanel} = Pydio.requireLib('form');

class RoleInfo extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,\'role\')]|//param[contains(@scope,\'role\')]').then(params => {
            this.setState({parameters: params});
        })

    }

    getPydioRoleMessage(messageId){
        const {pydio} = this.props;
        return pydio.MessageHash['role_editor.' + messageId] || messageId;
    }

    onParameterChange(paramName, newValue, oldValue){
        const {role} = this.props;
        const idmRole = role.getIdmRole();
        if(paramName === "applies") {
            idmRole.AutoApplies = newValue.split(',');
        } else if(paramName === "roleLabel") {
            idmRole.Label = newValue;
        }else if (paramName === "roleForceOverride") {
            idmRole.ForceOverride = newValue
        }else{
            const param = this.getParameterByName(paramName);
            if(param.aclKey){
                role.setParameter(param.aclKey, newValue);
            }
        }
    }

    getParameterByName(paramName){
        const {parameters} = this.state;
        return parameters.filter(p => p.name === paramName)[0];
    }

    render(){

        const {role, pydio} = this.props;
        const {parameters} = this.state;

        if(!parameters){
            return <div>{pydio.MessageHash['ajxp_admin.loading']}</div>;
        }

        const profiles = {'admin':'157', 'standard': '156', 'shared':'158', 'anon': '159'}
        const choices = Object.keys(profiles).map(k => k+'|'+pydio.MessageHash['settings.'+profiles[k]]).join(',')

        // Load role parameters
        const params = [
            {"name":"roleId", label:this.getPydioRoleMessage('31'),"type":"string", readonly:true, description:this.getPydioRoleMessage('role.id.description')},
            {"name":"roleLabel", label:this.getPydioRoleMessage('32'),"type":"string", description: this.getPydioRoleMessage('role.label.description')},
            {"name":"applies", label:this.getPydioRoleMessage('33'),"type":"select", multiple:true, choices:choices, description:this.getPydioRoleMessage('role.autoapply.description')},
            {"name":"roleForceOverride", label:this.getPydioRoleMessage('role.override.label'),"type":"boolean", description:this.getPydioRoleMessage('role.override.description')},
            ...parameters
        ];

        let values = {applies: []};
        if(role){
            const idmRole = role.getIdmRole();
            let applies = idmRole.AutoApplies || [];
            values = {
                roleId:idmRole.Uuid,
                applies: applies.filter(v => !!v), // filter empty values
                roleLabel:idmRole.Label,
                roleForceOverride: idmRole.ForceOverride || false
            };
            parameters.map(p => {
                if(p.aclKey && role.getParameterValue(p.aclKey)){
                    values[p.name] = role.getParameterValue(p.aclKey);
                }
            });
        }
        //console.log(values);

        return (
            <div className={"paper-right-block"}>
                <FormPanel
                    parameters={params}
                    onParameterChange={this.onParameterChange.bind(this)}
                    values={values}
                    depth={-2}
                    variant={'v2'}
                    variantShowLegend={true}
                />
            </div>
        );

    }

}

RoleInfo.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    pluginsRegistry: PropTypes.instanceOf(XMLDocument),
    role: PropTypes.instanceOf(Role),
};

export {RoleInfo as default}