import React from 'react'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
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
        }else if (paramName === 'roleType') {
            idmRole.IsTeam = newValue === 'team'
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

        let values = {applies: []};
        let roleTypeValue;
        const adminChoiceLabel = this.getPydioRoleMessage('roleType.admin.description').replace(',', '').replace('|', '')
        const teamChoiceLabel = this.getPydioRoleMessage('roleType.IsTeam.description').replace(',', '').replace('|', '')
        const roleTypeField = {
            name:"roleType",
            label:this.getPydioRoleMessage('roleType'),
            description:this.getPydioRoleMessage('roleType.description'),
            type:"select",
            choices:`admin|${adminChoiceLabel},team|${teamChoiceLabel}`
        };
        if(role) {
            const idmRole = role.getIdmRole()
            if (idmRole.GroupRole || idmRole.UserRole){
                roleTypeField.readonly = true;
                roleTypeField.type = 'string'
                roleTypeValue = this.getPydioRoleMessage('roleType.' + (idmRole.GroupRole ? PydioApi.RoleTypeGroup : PydioApi.RoleTypeUser) + '.description')
            } else {
                roleTypeValue = idmRole.IsTeam ? 'team' : 'admin'
            }

            let applies = idmRole.AutoApplies || [];
            values = {
                roleId:idmRole.Uuid,
                applies: applies.filter(v => !!v), // filter empty values
                roleLabel:idmRole.Label,
                roleType: roleTypeValue,
                roleForceOverride: idmRole.ForceOverride || false
            };
            parameters.map(p => {
                if(p.aclKey && role.getParameterValue(p.aclKey)){
                    values[p.name] = role.getParameterValue(p.aclKey);
                }
            });
        }

        // Build form parameters
        const params = [
            {"name":"roleId", label:this.getPydioRoleMessage('31'),"type":"string", readonly:true, description:this.getPydioRoleMessage('role.id.description')},
            roleTypeField,
            {"name":"roleLabel", label:this.getPydioRoleMessage('32'),"type":"string", description: this.getPydioRoleMessage('role.label.description')},
            {"name":"applies", label:this.getPydioRoleMessage('33'),"type":"select", multiple:true, choices:choices, description:this.getPydioRoleMessage('role.autoapply.description')},
            {"name":"roleForceOverride", label:this.getPydioRoleMessage('role.override.label'),"type":"boolean", description:this.getPydioRoleMessage('role.override.description')},
            ...parameters
        ];

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