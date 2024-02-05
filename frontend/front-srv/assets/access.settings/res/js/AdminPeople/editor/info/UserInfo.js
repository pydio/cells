import React from 'react'
import PropTypes from 'prop-types';
import Pydio from 'pydio'
import User from '../model/User'
import {IconMenu, IconButton, MenuItem} from 'material-ui';
const {FormPanel} = Pydio.requireLib('form');
import UserRolesPicker from '../user/UserRolesPicker'

class UserInfo extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            parameters: []
        };
        AdminComponents.PluginsLoader.getInstance(props.pydio).formParameters('//global_param[contains(@scope,"user")]|//param[contains(@scope,"user")]').then(params => {
            this.setState({parameters: params});
        })

    }

    getBinaryContext(){
        const {user} = this.props;
        return "user_id="+user.getIdmUser().Login + (user.getIdmUser().Attributes && user.getIdmUser().Attributes['avatar'] ? '?'+user.getIdmUser().Attributes['avatar'] : '');
    }

    getPydioRoleMessage(messageId){
        const {pydio} = this.props;
        return pydio.MessageHash['role_editor.' + messageId] || messageId;
    }

    onParameterChange(paramName, newValue, oldValue){
        const {user} = this.props;
        const {parameters} = this.state;
        const params = parameters.filter(p => p.name === paramName);
        const idmUser = user.getIdmUser();
        const role = user.getRole();
        // do something
        if(paramName === 'displayName' || paramName === 'email' || paramName === 'profile' || paramName === 'avatar'){
            idmUser.Attributes[paramName] = newValue;
        } else if (params.length && params[0].aclKey) {
            role.setParameter(params[0].aclKey, newValue);
        }
    }

    buttonCallback(action){
        const {user} = this.props;
        if(action === "update_user_pwd"){
            this.props.pydio.UI.openComponentInModal('AdminPeople', 'Editor.User.UserPasswordDialog', {user: user});
        }else{
            const idmUser = user.getIdmUser();
            const lockName = action === 'user_set_lock-lock' ? 'logout' : 'pass_change';
            let currentLocks = [];
            if(idmUser.Attributes['locks']){
                const test = JSON.parse(idmUser.Attributes['locks']);
                if(test && typeof test === "object"){
                    currentLocks = test;
                }
            }
            if(currentLocks.indexOf(lockName) > - 1){
                currentLocks = currentLocks.filter(l => l !== lockName);
                if(action === 'user_set_lock-lock'){
                    // Reset also the failedConnections attempts
                    delete idmUser.Attributes["failedConnections"];
                }
            } else {
                currentLocks.push(lockName);
            }
            idmUser.Attributes['locks'] = JSON.stringify(currentLocks);
            user.save();
        }
    }

    render(){

        const {user, pydio} = this.props;
        const {parameters} = this.state;
        if(!parameters){
            return <div>Loading...</div>;
        }

        let values = {profiles:[]};
        let locks = [];
        let rolesPicker;

        if(user){
            // Compute values
            const idmUser = user.getIdmUser();
            const role = user.getRole();
            if(idmUser.Attributes['locks']){
                locks = JSON.parse(idmUser.Attributes['locks']) || [];
                if (typeof locks === 'object' && locks.length === undefined){ // Backward compat issue
                    let arrL = [];
                    Object.keys(locks).forEach(k => {
                        if(locks[k] === true) {
                            arrL.push(k);
                        }
                    });
                    locks = arrL;
                }
            }
            rolesPicker = (
                <UserRolesPicker
                    profile={idmUser.Attributes?idmUser.Attributes['profile']:''}
                    roles={idmUser.Roles}
                    addRole={(r) => user.addRole(r)}
                    removeRole={(r) => user.removeRole(r)}
                    switchRoles={(r1,r2) => user.switchRoles(r1,r2)}
                />
            );

            const attributes = idmUser.Attributes || {};
            values = {
                ...values,
                avatar: attributes['avatar'],
                displayName: attributes['displayName'],
                email: attributes['email'],
                profile: attributes['profile'],
                login: idmUser.Login
            };
            parameters.map(p => {
                if(p.aclKey && role.getParameterValue(p.aclKey)){
                    values[p.name] = role.getParameterValue(p.aclKey);
                }
            });

        }
        const params = [
            {name:"login", label:this.getPydioRoleMessage('21'),description:pydio.MessageHash['pydio_role.31'],"type":"string", readonly:true},
            {name:"profile", label:this.getPydioRoleMessage('22'), description:pydio.MessageHash['pydio_role.32'],"type":"select", choices:'admin|Administrator,standard|Standard,shared|Shared'},
            ...parameters
        ];

        const secuActionsDisabled = (user.getIdmUser().Login === pydio.user.id)

        return (
            <div>
                <h3 className={"paper-right-title"} style={{display:'flex', alignItems: 'center'}}>
                    <div style={{flex:1}}>
                        {pydio.MessageHash['pydio_role.24']}
                        <div className={"section-legend"}>{pydio.MessageHash['pydio_role.54']}</div>
                    </div>
                    <div style={{lineHeight:'24px', padding: '0 10px'}}>
                    <IconMenu
                        iconButtonElement={
                        <IconButton
                            primary={true}
                            tooltip={this.getPydioRoleMessage('button.info.menu.security')}
                            tooltipPosition={'bottom-left'}
                            iconClassName={"mdi mdi-lock"+(locks.indexOf('logout')>-1?'-open':'')}
                            iconStyle={{color:locks.indexOf('logout')>-1?'#e53935':''}}/>
                    }
                        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                        targetOrigin={{horizontal: 'right', vertical: 'top'}}
                        desktop={true}
                    >
                        <MenuItem disabled={secuActionsDisabled} primaryText={this.getPydioRoleMessage('25')} onClick={() => this.buttonCallback('update_user_pwd')}/>
                        <MenuItem disabled={secuActionsDisabled} primaryText={this.getPydioRoleMessage((locks.indexOf('logout') > -1?'27':'26'))} onClick={() => this.buttonCallback('user_set_lock-lock')}/>
                        <MenuItem disabled={secuActionsDisabled} primaryText={this.getPydioRoleMessage((locks.indexOf('pass_change') > -1?'28b':'28'))} onClick={() => this.buttonCallback('user_set_lock-pass_change')}/>
                    </IconMenu>
                    </div>
                </h3>
                <div className={"paper-right-block"} style={{padding: '0 6px'}}>
                    <div style={{fontSize: 16, padding: '16px 10px 10px'}}>{this.getPydioRoleMessage('user.info.main')}</div>
                    <FormPanel
                        parameters={params}
                        onParameterChange={this.onParameterChange.bind(this)}
                        values={values}
                        depth={-2}
                        variant={'v2'}
                        variantShowLegend={true}
                        binary_context={this.getBinaryContext()}
                    />
                </div>
                {rolesPicker}
            </div>
        );


    }

}

UserInfo.PropTypes = {
    pydio: PropTypes.instanceOf(Pydio).isRequired,
    pluginsRegistry: PropTypes.instanceOf(XMLDocument),
    user: PropTypes.instanceOf(User),
};

export {UserInfo as default}