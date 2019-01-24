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

import GraphPanel from './GraphPanel'
import ActionsPanel from './ActionsPanel'
const debounce = require('lodash.debounce');
const React = require('react');
const Color = require('color');
const {FontIcon, Popover, Paper, Avatar, CardTitle, Divider} = require('material-ui');
const {muiThemeable} = require('material-ui/styles');
const MetaCacheService = require('pydio/http/meta-cache-service');
const {UsersApi} = require('pydio/http/users-api');
import PydioApi from "pydio/http/api";

/**
 * Generic component for display a user and her avatar (first letters or photo)
 */
class UserAvatar extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {
            user : null,
            avatar: null,
            graph : null,
            local: false
        };
    }

    componentDidMount(){
        this.loadPublicData(this.props.userId, this.props.idmUser);
    }

    componentWillReceiveProps(nextProps){
        if(!this.props.userId || this.props.userId !== nextProps.userId){
            this.setState({label: nextProps.userId});
            this.loadPublicData(nextProps.userId, nextProps.idmUser);
        }
    }

    componentWillUnmount(){
        if(this._userLoggedObs){
            this.props.pydio.stopObserving('user_logged', this._userLoggedObs);
        }
    }

    /**
     *
     * @param userId string
     * @param idmUser {IdmUser}
     */
    loadPublicData(userId, idmUser) {
        const {userType, richCard, pydio}  = this.props;
        if (userType === "group" || userType === "team") {
            return;
        }
        UsersApi.getUserPromise(userId, idmUser).then((userObject) => {
            if(userObject.isLocal()){
                this._userLoggedObs = (eventUser) => {
                    this._userLoggedObs = null;
                    if(eventUser !== null){
                        this.loadPublicData(userId);
                    }
                };
                pydio.observeOnce('user_logged', this._userLoggedObs);
            }
            this.setState({
                user:  userObject,
                avatar: userObject.getAvatar(),
                local: userObject.isLocal()
            });
            // Load graph
            if(richCard && !userObject.isNotFound()) {
                PydioApi.getRestClient().getIdmApi().loadUserGraph(userId).then(response => {
                    const graph = {cells:{}, teams:[]};
                    if(response.SharedCells){
                        response.SharedCells.forEach(workspace => {
                            graph.cells = response.SharedCells;
                        });
                    }
                    if(response.BelongsToTeams){
                        response.BelongsToTeams.forEach(role => {
                            graph.teams.push({
                                id: role.Uuid,
                                label: role.Label,
                                type: 'team',
                                IdmRole: role
                            });
                        });
                    }
                    this.setState({graph});
                });
            }

        }).catch(e => {
            // User may have been deleted
            this.setState({loadError: true});
        });
    }

    render(){

        const {user, avatar, graph, local, loadError} = this.state;
        let {pydio, userId, userType, icon, style, labelStyle, avatarLetters, avatarStyle, avatarSize, className,
            labelClassName, displayLabel, displayLocalLabel, displayLabelChevron, displayAvatar, useDefaultAvatar, richCard, cardSize, muiTheme, noActionsPanel} = this.props;

        let {label} = this.state;
        let userTypeLabel;
        let userNotFound = loadError;
        let userIsPublic = false;
        if(user) {
            label = user.getLabel();
            userNotFound = user.isNotFound();
            userIsPublic = user.isPublic();
        }else if(!label){
            label = this.props.userLabel || this.props.userId;
        }
        if(local && displayLocalLabel) {
            label = pydio.MessageHash['634'];
        }

        let avatarContent, avatarColor, avatarIcon;
        if(richCard){
            displayAvatar = true;
            useDefaultAvatar = true;
            displayLabel = true;
        }
        if(displayAvatar && !avatar && label && (!displayLabel || useDefaultAvatar) ){
            let avatarsColor = muiTheme.palette.avatarsColor;
            if(userType === 'group' || userType === 'team' || userId.indexOf('PYDIO_GRP_/') === 0 || userId.indexOf('/USER_TEAM/') === 0){
                avatarsColor = Color(avatarsColor).darken(0.2).toString();
            }
            let iconClassName;
            switch (userType){
                case 'group':
                    iconClassName = 'mdi mdi-account-multiple';
                    userTypeLabel = '289';
                    break;
                case 'team':
                    iconClassName = 'mdi mdi-account-multiple-outline';
                    userTypeLabel = '603';
                    break;
                case 'remote':
                    iconClassName = 'mdi mdi-account-network';
                    userTypeLabel = '604';
                    break;
                default:
                    iconClassName = 'mdi mdi-account';
                    if(user){
                        if(user.getExternal()){
                            userTypeLabel = '589';
                            if(user.isPublic()){
                                userTypeLabel = '589';
                                label = pydio.MessageHash["public_link_user"];
                                iconClassName = 'mdi mdi-link';
                            }
                        } else {
                            userTypeLabel = '590';
                        }
                    }else {
                        userTypeLabel = '288';
                    }
                    break;
            }
            if(icon) {
                iconClassName = icon;
            }
            if(userTypeLabel) {
                userTypeLabel = pydio.MessageHash[userTypeLabel];
            }
            if(richCard){
                avatarIcon  = <FontIcon className={iconClassName} style={{color:avatarsColor}} />;
                avatarColor = '#f5f5f5';
            }else{
                avatarColor     = avatarsColor;
                if(iconClassName && !avatarLetters){
                    avatarIcon = <FontIcon className={iconClassName}/>;
                }else{
                    avatarContent = label.split(' ').map((word)=>word[0]).join('').substring(0,2);
                    if(avatarContent.length < 2) {
                        avatarContent =  label.substring(0,2);
                    }
                }
            }
        }
        let reloadAction, onEditAction, onMouseOver, onMouseOut, onClick, popover;
        if(richCard){

            displayAvatar = true;
            style = {...style, flexDirection:'column'};
            //avatarSize = cardSize ? cardSize : '100%';
            //avatarStyle = {borderRadius: 0};
            avatarSize = 100;
            avatarStyle = {marginTop: 20};
            const localReload = () => {
                MetaCacheService.getInstance().deleteKey('user_public_data-graph', this.props.userId);
                this.loadPublicData(this.props.userId, this.props.idmUser);
            };
            reloadAction = () => {
                localReload();
                if(this.props.reloadAction) {
                    this.props.reloadAction();
                }
            };
            onEditAction = () => {
                localReload();
                if(this.props.onEditAction) {
                    this.props.onEditAction();
                }
            }
        } else if(!local && !userNotFound && !userIsPublic && this.props.richOnHover){

            onMouseOut = () => {
                if(!this.lockedBySubPopover){
                    this.setState({showPopover: false});
                }
            };
            onMouseOut = debounce(onMouseOut, 350);
            onMouseOver = (e) => {
                this.setState({showPopover: true, popoverAnchor: e.currentTarget});
                onMouseOut.cancel();
            };
            const onMouseOverInner = (e) =>{
                this.setState({showPopover: true});
                onMouseOut.cancel();
            };

            const lockOnSubPopoverOpen = (status) => {
                this.lockedBySubPopover = status;
                onMouseOverInner();
            };
            const {style, ...popoverProps} = this.props;
            popover = (
                <Popover
                    open={this.state.showPopover}
                    anchorEl={this.state.popoverAnchor}
                    onRequestClose={(reason) => {
                        if(reason !== 'clickAway' || !this.lockedBySubPopover){
                            this.setState({showPopover: false})
                        }
                    }}
                    anchorOrigin={{horizontal:"left",vertical:"center"}}
                    targetOrigin={{horizontal:"right",vertical:"center"}}
                    useLayerForClickAway={false}
                >
                    <Paper zDepth={2} style={{width: 220, height: 320, overflowY: 'auto'}} onMouseOver={onMouseOverInner}  onMouseOut={onMouseOut}>
                        <UserAvatar {...popoverProps} richCard={true} richOnHover={false} cardSize={220} lockOnSubPopoverOpen={lockOnSubPopoverOpen} />
                    </Paper>
                </Popover>
            );

        } else if(!local && !userNotFound && !userIsPublic && this.props.richOnClick){

            onMouseOut = () => {
                if(!this.lockedBySubPopover){
                    this.setState({showPopover: false});
                }
            };
            onMouseOut = debounce(onMouseOut, 350);
            onClick = (e) => {
                this.setState({showPopover: true, popoverAnchor: e.currentTarget});
                onMouseOut.cancel();
            };
            const onMouseOverInner = (e) =>{
                this.setState({showPopover: true});
                onMouseOut.cancel();
            };

            const lockOnSubPopoverOpen = (status) => {
                this.lockedBySubPopover = status;
                onMouseOverInner();
            };
            const {style, ...popoverProps} = this.props;
            popover = (
                <Popover
                    open={this.state.showPopover}
                    anchorEl={this.state.popoverAnchor}
                    onRequestClose={(reason) => {
                        if(reason !== 'clickAway' || !this.lockedBySubPopover){
                            this.setState({showPopover: false})
                        }
                    }}
                    anchorOrigin={{horizontal:"left",vertical:"bottom"}}
                    targetOrigin={{horizontal:"left",vertical:"top"}}
                    useLayerForClickAway={false}
                >
                    <Paper zDepth={2} style={{width: 220, height: 320, overflowY: 'auto'}} onMouseOver={onMouseOverInner}  onMouseOut={onMouseOut}>
                        <UserAvatar {...popoverProps} richCard={true} richOnHover={false} cardSize={220} lockOnSubPopoverOpen={lockOnSubPopoverOpen} />
                    </Paper>
                </Popover>
            );

        }

        if(avatar){
            avatarIcon = <FontIcon style={{
                backgroundImage:"url("+avatar+"?dim="+ avatarSize +")",
                backgroundSize:'cover',
                margin:0,
                width:'100%',
                height:'100%',
                borderRadius:'50%',
                backgroundPosition:'center'
            }} />
        }

        let avatarComponent = (
            <Avatar
                icon={avatarIcon}
                size={avatarSize}
                style={this.props.avatarOnly ? this.props.style : avatarStyle}
                backgroundColor={avatarColor}
            >{avatarContent}</Avatar>
        );

        if(this.props.avatarOnly){
            return avatarComponent;
        }

        if(richCard){
            avatarComponent = <div style={{textAlign:'center'}}>{avatarComponent}</div>
        } else if(userNotFound){
            labelStyle = {...labelStyle, textDecoration:'line-through'};
        }
        let labelChevron;
        if(displayLabel && displayLabelChevron){
            labelChevron = <span className={"mdi mdi-chevron-down"} style={{marginLeft: 4, fontSize:'0.8em'}}/>
        }

        return (
            <div className={className} style={style} onMouseOver={onMouseOver} onMouseOut={onMouseOut} onClick={onClick}>
                {displayAvatar && (avatar || avatarContent || avatarIcon) && avatarComponent}
                {displayLabel && !richCard && <div
                    className={labelClassName}
                    style={labelStyle}>{label}{labelChevron}</div>}
                {displayLabel && richCard && <CardTitle style={{textAlign:'center'}} title={label} subtitle={userTypeLabel}/>}
                {richCard && user && !noActionsPanel && <ActionsPanel {...this.state} {...this.props} reloadAction={reloadAction} onEditAction={onEditAction}/>}
                {richCard && graph && !noActionsPanel && <GraphPanel graph={graph} {...this.props} userLabel={label} reloadAction={reloadAction} onEditAction={onEditAction}/>}
                {this.props.children}
                {popover}
            </div>
        );

    }

}

UserAvatar.propTypes = {
    /**
     * Id of the user to be loaded
     */
    userId: React.PropTypes.string.isRequired,
    /**
     * Pydio instance
     */
    pydio : React.PropTypes.instanceOf(Pydio),
    /**
     * Label of the user, if we already have it (otherwise will be loaded)
     */
    userLabel:React.PropTypes.string,
    /**
     * Type of user
     */
    userType: React.PropTypes.oneOf(['user', 'group', 'remote', 'team']),
    /**
     * Icon to be displayed in avatar
     */
    icon:React.PropTypes.string,
    /**
     * Display a rich card or a simple avatar+label chip
     */
    richCard: React.PropTypes.bool,
    /**
     * If not rich, display a rich card as popover on mouseover
     */
    richOnHover: React.PropTypes.bool,
    /**
     * If not rich, display a rich card as popover on click
     */
    richOnClick: React.PropTypes.bool,

    /**
     * Add edit action to the card
     */
    userEditable: React.PropTypes.bool,
    /**
     * Triggered after successful edition
     */
    onEditAction: React.PropTypes.func,
    /**
     * Triggered after deletion
     */
    onDeleteAction: React.PropTypes.func,
    /**
     * Triggered if a reload is required
     */
    reloadAction: React.PropTypes.func,

    /**
     * Display label element or not
     */
    displayLabel: React.PropTypes.bool,
    /**
     * Display label element or not
     */
    displayLocalLabel: React.PropTypes.bool,
    /**
     * Display avatar element or not
     */
    displayAvatar: React.PropTypes.bool,
    /**
     * Display only avatar
     */
    avatarOnly: React.PropTypes.bool,
    /**
     * Use default avatar
     */
    useDefaultAvatar: React.PropTypes.bool,
    /**
     * Avatar size, 40px by default
     */
    avatarSize:React.PropTypes.number,
    /**
     * If only the default icon is available, will display
     * the first letters of the name instead
     */
    avatarLetters: React.PropTypes.bool,
    /**
     * Do not display ActionsPanel in RichCard mode
     */
    noActionsPanel: React.PropTypes.bool,

    /**
     * Add class name to root element
     */
    className: React.PropTypes.string,
    /**
     * Add class name to label element
     */
    labelClassName: React.PropTypes.string,
    /**
     * Add class name to avatar element
     */
    avatarClassName: React.PropTypes.string,
    /**
     * Add style to root element
     */
    style: React.PropTypes.object,
    /**
     * Add style to label element
     */
    labelStyle: React.PropTypes.object,
    /**
     * Add style to avatar element
     */
    avatarStyle: React.PropTypes.object
};

UserAvatar.defaultProps = {
    displayLabel: true,
    displayAvatar: true,
    avatarSize: 40,
    userType:'user',
    className: 'user-avatar-widget',
    avatarClassName:'user-avatar',
    labelClassName:'user-label'
};

UserAvatar = muiThemeable()(UserAvatar);

export {UserAvatar as default}