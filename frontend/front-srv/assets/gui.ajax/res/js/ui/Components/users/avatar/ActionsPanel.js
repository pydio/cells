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

import PropTypes from 'prop-types';
import Pydio from 'pydio';
const React = require('react');
import AddressBook from '../addressbook/AddressBook'
import ResourcePoliciesPanel from '../../policies/ResourcePoliciesPanel'
const PydioApi = require('pydio/http/api');
const ResourcesManager = require('pydio/http/resources-manager');
const {IconButton} = require('material-ui');
const {muiThemeable} = require('material-ui/styles');
const {PydioContextConsumer, AsyncComponent} = require('pydio').requireLib('boot');
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc')

class ActionsPanel extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {
            showPicker : false, pickerAnchor: null,
            showMailer: false, mailerAnchor: null,
            showPolicies: false, policiesAnchor: null,
        };
    }

    onTeamSelected(item){
        const {userId, reloadAction} = this.props;
        this.setState({showPicker: false});
        if(item.IdmRole && item.IdmRole.IsTeam){
            PydioApi.getRestClient().getIdmApi().addUserToTeam(item.IdmRole.Uuid, userId, reloadAction);
        }
    }
    
    onUserSelected(item){
        const {team, reloadAction} = this.props;
        PydioApi.getRestClient().getIdmApi().addUserToTeam(team.id, item.IdmUser.Login, reloadAction);
    }

    openPicker(event){
        this.setState({showPicker: true, pickerAnchor: event.currentTarget});
    }

    openPolicies(event){
        this.setState({showPolicies: true, policiesAnchor: event.currentTarget});
    }

    openMailer(event){

        const target = event.currentTarget;
        ResourcesManager.loadClassesAndApply(['PydioMailer'], () => {
            this.setState({mailerLibLoaded: true}, () => {
                this.setState({showMailer: true, mailerAnchor: target});
            });
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(!this.props.lockOnSubPopoverOpen) {
            return;
        }
        if( (this.state.showPicker || this.state.showMailer) && !(prevState.showPicker || prevState.showMailer)){
            this.props.lockOnSubPopoverOpen(true);
        }else if( !(this.state.showPicker || this.state.showMailer) && (prevState.showPicker || prevState.showMailer) ){
            this.props.lockOnSubPopoverOpen(false);
        }
    }
    
    render(){

        const {pydio, getMessage, muiTheme, userEditable, userId, style, otherPopoverMouseOver,
            team, user, onEditAction, onDeleteAction} = this.props;
        const teamsEditable = pydio.getController().actions.has("user_team_create");

        const accentColor = muiTheme.userTheme==='mui3'?muiTheme.palette.mui3['primary'] : muiTheme.palette.accent2Color;
        const styles = {
            button: {
                border: '0px solid ' + accentColor,
                borderRadius: '50%',
                margin: '0 4px',
                width: 30,
                height: 30,
                padding: 4
            },
            icon : {
                fontSize: 20,
                color: accentColor
            }
        };
        let usermails = {};
        let actions = [];
        let resourceType, resourceId;
        if(user && user.IdmUser && user.IdmUser.Attributes && (user.IdmUser.Attributes['hasEmail'] || user.IdmUser.Attributes['email'] )){
            actions.push({key:'message', label:getMessage(598), icon:'email', callback: this.openMailer.bind(this)});
            usermails[user.IdmUser.Login] = user.IdmUser;
        }
        if(team){
            resourceType = 'team';
            resourceId = team.id;
            if (teamsEditable){
                actions.push({key:'users', label:getMessage(599), icon:'account-multiple-plus', callback:this.openPicker.bind(this)});
            }
        }else{
            resourceType = 'user';
            resourceId = userId;
            if(teamsEditable){
                actions.push({key:'teams', label:getMessage(573), icon:'account-multiple-plus', callback:this.openPicker.bind(this)});
            }
        }
        if(userEditable && !(team && !teamsEditable)){
            if (onEditAction) {
                actions.push({key:'edit', label:team?getMessage(580):getMessage(600), icon:'pencil', callback:onEditAction});
            }
            actions.push({key:'policies', label:'Visibility', icon:'security', callback:this.openPolicies.bind(this)});
            if(onDeleteAction){
                actions.push({key:'delete', label:team?getMessage(570):getMessage(582), icon:'delete', callback:onDeleteAction});
            }
        }
        if (actions.length === 0) {
            return null;
        }

        return (
            <div style={{...style}}>
                {actions.map(function(a){
                    return <IconButton
                        key={a.key}
                        style={styles.button}
                        iconStyle={styles.icon}
                        tooltip={a.label}
                        iconClassName={"mdi mdi-" + a.icon}
                        onClick={a.callback}
                    />
                })}
                <Popover
                    open={this.state.showPicker}
                    anchorEl={this.state.pickerAnchor}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    onRequestClose={() => {this.setState({showPicker: false})}}
                    useLayerForClickAway={false}
                    style={{zIndex:2200}}
                >
                    <div style={{width: 256, height: 320}}>
                        <AddressBook
                            mode="selector"
                            pydio={pydio}
                            loaderStyle={{width: 320, height: 320}}
                            onItemSelected={team ? this.onUserSelected.bind(this) : this.onTeamSelected.bind(this)}
                            teamsOnly={!team}
                            usersOnly={!!team}
                        />
                    </div>
                </Popover>
                <Popover
                    open={this.state.showMailer}
                    anchorEl={this.state.mailerAnchor}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    useLayerForClickAway={false}
                    style={{zIndex:2200}}
                >
                    <div style={{width: 256, height: 320}}>
                        {this.state.mailerLibLoaded &&
                        <AsyncComponent
                            namespace="PydioMailer"
                            componentName="Pane"
                            pydio={pydio}
                            zDepth={0}
                            panelTitle={getMessage(598)}
                            uniqueUserStyle={true}
                            users={usermails}
                            templateId={"DM"}
                            templateData={{"From": pydio.user.getPreference('displayName') || pydio.user.id}}
                            onDismiss={() => {this.setState({showMailer: false})}}
                            onFieldFocus={otherPopoverMouseOver}
                        />}
                    </div>
                </Popover>
                <Popover
                    open={this.state.showPolicies}
                    anchorEl={this.state.policiesAnchor}
                    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
                    targetOrigin={{horizontal: 'right', vertical: 'top'}}
                    useLayerForClickAway={false}
                    style={{zIndex:2000}}
                >
                    <div style={{width: 256, height: 320}}>
                        <ResourcePoliciesPanel
                            description={pydio.MessageHash['visibility.users.advanced']}
                            pydio={pydio}
                            resourceType={resourceType}
                            resourceId={resourceId}
                            onDismiss={()=>{this.setState({showPolicies: false})}}
                        />
                    </div>
                </Popover>
            </div>
        );

    }

}

ActionsPanel.propTypes = {

    /**
     * User data, props must pass at least one of 'user' or 'team'
     */
    user: PropTypes.object,
    /**
     * Team data, props must pass at least one of 'user' or 'team'
     */
    team: PropTypes.object,
    /**
     * For users, whether it is editable or not
     */
    userEditable: PropTypes.bool,

    pydio: PropTypes.object,
    getMessage: PropTypes.func,
    userId: PropTypes.string,
    style:PropTypes.object,
    onEditAction:PropTypes.func,
    onDeleteAction:PropTypes.func,
    reloadAction:PropTypes.func

};

ActionsPanel = PydioContextConsumer(ActionsPanel);
ActionsPanel = muiThemeable()(ActionsPanel);

export {ActionsPanel as default}