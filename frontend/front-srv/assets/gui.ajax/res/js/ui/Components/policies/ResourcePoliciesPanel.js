/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react'
import {Divider, IconButton, Checkbox, FlatButton} from 'material-ui'
import {muiThemeable} from 'material-ui/styles'
import Policies from 'pydio/http/policies'
import {UsersApi} from 'pydio/http/users-api'
import {ServiceResourcePolicy} from 'pydio/http/rest-api'
import Pydio from 'pydio';
import PydioApi from 'pydio/http/api'
import UsersCompleter from '../users/UsersCompleter'

class ResourcePoliciesPanel extends React.Component{

    constructor(props){
        if(!props.subjectsDisabled){
            props.subjectsDisabled = {'READ':{}, 'WRITE':{}}
        }
        if(props.cellAcls){
            Object.keys(props.cellAcls).map(k => {
                if(props.cellAcls[k].RoleId){
                    props.subjectsDisabled['READ']["role:" + props.cellAcls[k].RoleId] = true;
                }
            });
        }
        super(props);
        this.state = {
            loading: true,
            policies: [],
            diffPolicies:{add:{},remove:{}}
        };
    }

    componentDidMount(){
        this.setState({loading: true});
        this.reload();
    }

    reload(){
        const {resourceType, resourceId} = this.props;
        const {user} = pydio;
        let proms = [
            Policies.loadPolicies(resourceType, resourceId),
            user.getIdmUser()
        ];
        if(resourceType !== 'team') {
            proms.push(PydioApi.getRestClient().getIdmApi().listTeams());
        }
        Promise.all(proms).then(result => {
            const policies = result[0];
            const resourceUuid = policies[0].Resource;
            const idmUser = result[1];
            let teams = [];
            if(resourceType !== 'team' && result[2]){
                teams = result[2].Teams;

            }
            this.setState({
                policies: policies,
                idmUser: idmUser,
                userTeams: teams,
                loading: false,
                resourceUuid: resourceUuid
            });
        }).catch(error => {
            this.setState({error:error.message, loading: false});
        });
    }

    revert(){
        this.setState({dirtyPolicies: null, diffPolicies: {add:{},remove:{}}});
    }

    save(){
        const {dirtyPolicies, diffPolicies} = this.state;
        const {resourceType, resourceId, onSavePolicies} = this.props;
        Policies.savePolicies(resourceType, resourceId, dirtyPolicies).then(result => {
            this.setState({policies: result, dirtyPolicies:null, diffPolicies: {add:{},remove:{}}});
            if(onSavePolicies) {
                onSavePolicies(diffPolicies);
            }
        }).catch(reason => {
            this.setState({error: reason.message});
        });
        //console.log(dirtyPolicies, diffPolicies);
    }

    removePolicy(action, subject){
        let {policies, dirtyPolicies, diffPolicies} = this.state;
        if(dirtyPolicies) {
            policies = dirtyPolicies;
        }
        let newPolicies = [];
        policies.map(p => {
            if (p.Action !== action || p.Subject !== subject){
                newPolicies.push(p);
            }
        });
        diffPolicies.remove[action + '///' + subject] = true;
        if(diffPolicies.add[action + '///' + subject]){
            delete diffPolicies.add[action + '///' + subject];
        }
        this.setState({dirtyPolicies: newPolicies, diffPolicies:diffPolicies});
    }

    addPolicy(action, subject, isPickedUser = false){
        const {policies, dirtyPolicies, resourceUuid, diffPolicies} = this.state;
        let newPolicies = dirtyPolicies?[ ...dirtyPolicies]: [...policies];
        let newPol = new ServiceResourcePolicy();
        newPol.Resource = resourceUuid;
        newPol.Effect = 'allow';
        newPol.Subject = subject;
        newPol.Action = action;
        newPolicies.push(newPol);

        diffPolicies.add[action + '///' + subject] = true;
        if(diffPolicies.remove[action + '///' + subject]){
            delete diffPolicies.remove[action + '///' + subject];
        }
        if(isPickedUser){
            this.setState({dirtyPolicies: newPolicies, diffPolicies:diffPolicies, pickedUser: null, pickedLabel: null});
        } else {
            this.setState({dirtyPolicies: newPolicies, diffPolicies:diffPolicies});
        }
    }

    /**
     *
     * @param userSubjects
     * @param policies
     * @return {boolean}
     */
    hasOneWrite(userSubjects, policies){
        for(let i=0; i<userSubjects.length; i++){
            for(let j=0; j < policies.length; j++){
                if(policies[j].Subject === userSubjects[i] && policies[j].Action === 'WRITE'){
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @param idmUser
     * @param policies
     * @return {{groupBlocks: Array, hasWrite: boolean}}
     */
    listUserRoles(idmUser, policies){
        const crtUserSubject = 'user:' + idmUser.Login;
        let values = {};
        idmUser.Roles.map(role => {
            if (!role.GroupRole) {
                return;
            }
            values['role:' + role.Uuid] = role.Label;
        });
        values[crtUserSubject] = 'You';
        const hasWrite = this.hasOneWrite(Object.keys(values), policies);
        // Add other subjects
        values = {...this.listOtherUsersSubjects(policies, crtUserSubject), ...values};
        const keys = Object.keys(values);
        // Build Lines
        let groupBlocks = [];
        for (let i = keys.length - 1 ; i >= 0; i --) {
            const newKey = keys[i];
            const newVal = values[newKey];
            groupBlocks.push(this.renderLine(newKey, newVal, policies, (!hasWrite || newKey === crtUserSubject)));
        }
        return {groupBlocks, hasWrite};
    }

    /**
     *
     * @param userTeams
     * @param policies
     * @param disabled
     * @return {XML}[]
     */
    listUserTeams(userTeams, policies, disabled) {
        return userTeams.map(role => {
            return this.renderLine('role:' + role.Uuid, role.Label, policies, disabled);
        });
    }

    listOtherUsersSubjects(policies, currentUserSubject){
        const {resourceId, cellAcls} = this.props;
        let subs = {};
        policies.map(p=>{
            if(p.Subject.indexOf('user:') === 0 && p.Subject !== currentUserSubject && p.Subject !== 'user:' + resourceId){
                subs[p.Subject] = p.Subject.substr('user:'.length);
            }
            if(cellAcls && p.Subject.indexOf('role:') === 0 && cellAcls[p.Subject.substr('role:'.length)]){
                const roleId = p.Subject.substr('role:'.length);
                if (cellAcls[roleId].User) {
                    const usr = cellAcls[roleId].User;
                    if(currentUserSubject !== 'user:' + usr.Login){
                        subs[p.Subject] = usr.Attributes && usr.Attributes['displayName'] ? usr.Attributes['displayName'] : usr.Login;
                    }
                } else if(cellAcls[roleId].Group) {
                    const grp = cellAcls[roleId].Group;
                    subs[p.Subject] = grp.Attributes && grp.Attributes['displayName'] ? grp.Attributes['displayName'] : grp.GroupLabel;
                }
            }
        });
        return subs;
    }

    /**
     *
     * @param userOrRole {{IdmUser,IdmRole}}
     */
    pickUser(userOrRole){
        let subject, label;
        if(userOrRole.IdmUser){
            const {IdmUser} = userOrRole;
            const attributes = IdmUser.Attributes || {};
            if(IdmUser.IsGroup){
                subject = 'role:' + IdmUser.Uuid;
                label = attributes['displayName'] || IdmUser.GroupLabel;
            } else {
                subject = 'user:' + IdmUser.Login;
                label = attributes['displayName'] || IdmUser.Login;
            }
        } else {
            const {IdmRole} = userOrRole;
            subject = 'role:' + IdmRole.Uuid;
            label = IdmRole.Label;
        }
        this.setState({pickedUser: subject, pickedLabel: label});
    }

    /**
     *
     * @param subject
     * @param label
     * @param policies
     * @param disabled
     * @param isPickedUser
     * @return {XML}
     */
    renderLine(subject, label, policies, disabled, isPickedUser = false) {
        const {subjectsDisabled, subjectsHidden, readonly} = this.props;
        if(subjectsHidden && subjectsHidden[subject]){
            return null;
        }

        let read = false, write = false;
        let readChange = () => {
            this.addPolicy('READ', subject, isPickedUser);
        };
        let writeChange = () => {
            this.addPolicy('WRITE', subject, isPickedUser);
        };
        policies.map(p => {
            if (p.Subject !== subject ){
                return;
            }
            if (p.Action === 'WRITE') {
                write = (p.Action === 'WRITE');
                writeChange = () => {this.removePolicy('WRITE', subject);}
            } else if(p.Action === 'READ'){
                read = (p.Action === 'READ');
                readChange = () => {this.removePolicy('READ', subject);}
            }
        });
        let disableWrite = disabled;
        let disableRead = disabled;
        if(readonly){
            disableRead = true;
            disableWrite = true;
        } else {
            if(subjectsDisabled && subjectsDisabled['READ'] && subjectsDisabled['READ'][subject]){
                disableRead = true;
            }
            if(subjectsDisabled && subjectsDisabled['WRITE'] && subjectsDisabled['WRITE'][subject]){
                disableWrite = true;
            }
        }
        return(
            <div style={{display: 'flex', margin:10, marginRight: 0}}>
                <div style={{flex:1}}>{label}</div>
                <Checkbox checked={read} disabled={disableRead} style={{width:40}} onCheck={readChange}/>
                <Checkbox checked={write} disabled={disableWrite} style={{width:40}} onCheck={writeChange}/>
            </div>
        );
    }


    render(){
        const {appBar} = this.props.muiTheme;

        const styles = {
            title: {
                paddingLeft: 10,
                backgroundColor: appBar.color,
                display: 'flex',
                alignItems: 'center',
                fontSize: 16,
                color: appBar.textColor
            },
            subheader: {
                margin: 10,
                fontWeight: 500,
                color: '#9E9E9E',
                display:'flex'
            },
            subject : {
                margin: 10
            },
            head: {
                display:'inline-block',
                width: 40,
                textAlign:'center',
                fontSize: 10
            }
        };
        const {policies, dirtyPolicies, error, idmUser, userTeams, loading, pickedUser, pickedLabel} = this.state;
        const {onDismiss, style, skipTitle, resourceId, pydio, userListExcludes, readonly} = this.props;
        let blocks = [];
        if(!loading && !error) {
            const {groupBlocks, hasWrite} = this.listUserRoles(idmUser, dirtyPolicies?dirtyPolicies:policies);
            const teamBlocks = this.listUserTeams(userTeams, dirtyPolicies?dirtyPolicies:policies, !hasWrite);
            let heads = <div><span style={styles.head}>View</span><span style={styles.head}>Edit</span></div>;
            if (groupBlocks.length){
                blocks.push(<div style={styles.subheader}><span style={{flex:1}}>Users</span>{heads}</div>);
                blocks.push(groupBlocks);
                blocks.push(<Divider/>);
            }
            if (teamBlocks.length){
                blocks.push(<div style={styles.subheader}><span style={{flex:1}}>Your Teams</span>{heads}</div>);
                blocks.push(teamBlocks);
                blocks.push(<Divider/>);
            }
            if(pickedUser) {
                blocks.push(<div style={styles.subheader}>Set visible to...</div>);
                blocks.push(this.renderLine(pickedUser, pickedLabel, policies, false, true));
                blocks.push(<div style={{textAlign:'right'}}><FlatButton label={"Cancel"} onTouchTap={()=>{this.setState({pickedUser:null, pickedLabel: null});}}/></div>);
                blocks.push(<Divider/>);
            } else if(!readonly) {
                const crtUserSubject = 'user:' + idmUser.Login;
                const userSubjects = this.listOtherUsersSubjects(dirtyPolicies?dirtyPolicies:policies, crtUserSubject);
                let exludes = [];
                Object.keys(userSubjects).map(k=>{exludes.push(userSubjects[k])});

                // select an arbitrary resource
                blocks.push(<div style={styles.subheader}>Set visible to ...</div>);
                blocks.push(
                    <div style={{margin:'-30px 10px 0'}}>
                        <UsersCompleter
                            className="share-form-users"
                            fieldLabel="Select user"
                            renderSuggestion={userObject => <div style={{fontSize:13}}>{userObject.getExtendedLabel()}</div>}
                            onValueSelected={this.pickUser.bind(this)}
                            usersOnly={true}
                            existingOnly={true}
                            excludes={[resourceId, ...userListExcludes, ...exludes]}
                            pydio={pydio}
                            showAddressBook={false}
                            usersFrom="local"
                        />
                    </div>
                );
                blocks.push(<Divider/>);
            }

            blocks.pop();

        }

        return (
            <div style={style}>
                <div style={styles.title}>
                    <span style={{flex:1}}>{skipTitle? '' : 'Visibility'}</span>
                    {dirtyPolicies &&
                        <IconButton iconClassName={"mdi mdi-undo-variant"} tooltip={"Revert changes"} onTouchTap={this.revert.bind(this)} iconStyle={{color:appBar.textColor}} />
                    }
                    {dirtyPolicies &&
                        <IconButton iconClassName={"mdi mdi-content-save"} tooltip={"Save changes"} onTouchTap={this.save.bind(this)} iconStyle={{color:appBar.textColor}} />
                    }
                    {!dirtyPolicies && onDismiss &&
                        <IconButton iconClassName={"mdi mdi-close"} onTouchTap={onDismiss} iconStyle={{color:appBar.textColor}} />
                    }
                </div>
                {error &&
                    <div>Error: {error}</div>
                }
                <div>{blocks}</div>
            </div>
        );
    }

}

ResourcePoliciesPanel.PropTypes = {
    pydio: React.PropTypes.instanceOf(Pydio),
    resourceType: React.PropTypes.string.isRequired,
    resourceId: React.PropTypes.string.isRequired,
    onSavePolicies: React.PropTypes.func,
    userListExcludes:React.PropTypes.array,
    subjectsDisabled:React.PropTypes.array,
    subjectsHidden:React.PropTypes.object,
    readonly:React.PropTypes.bool,
    cellAcls:React.PropTypes.object,

    onDismiss:React.PropTypes.func,
    style: React.PropTypes.object,
    skipTitle: React.PropTypes.bool,

};

ResourcePoliciesPanel = muiThemeable()(ResourcePoliciesPanel);

export {ResourcePoliciesPanel as default}