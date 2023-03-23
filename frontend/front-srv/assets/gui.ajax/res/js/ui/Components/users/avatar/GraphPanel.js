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

import {IconButton} from "material-ui";

const {Component} = require('react');
import UsersList from '../addressbook/UsersList'
const {Divider, Subheader, List, ListItem, FontIcon, Avatar} = require('material-ui');
const PydioApi = require('pydio/http/api');
const {PydioContextConsumer} = require('pydio').requireLib('boot');
import ListStylesCompact from '../addressbook/ListStylesCompact'
import {muiThemeable} from "material-ui/styles";

/**
 * Display information about user or team relations
 */
class GraphPanel extends Component{

    render(){

        const {graph, pydio, getMessage, muiTheme} = this.props;
        const teamsEditable = pydio.getController().actions.has("user_team_create");

        let elements = [];
        if(graph.teams && graph.teams.length){
            let onDeleteAction = null;
            if (teamsEditable) {
                onDeleteAction = (parentItem, team) => {
                    PydioApi.getRestClient().getIdmApi().removeUserFromTeam(team[0].id, this.props.userId, (response) => {
                        if(response && response.message) {
                            pydio.UI.displayMessage('SUCCESS', response.message);
                        }
                        this.props.reloadAction();
                    });
                };
            }
            elements.push(
                <div key="teams">
                    <UsersList subHeader={getMessage(581).replace('%s', graph.teams.length)} onItemClicked={()=>{}} item={{leafs: graph.teams}} mode="inner" onDeleteAction={onDeleteAction}/>
                </div>
            )
        }
        if(graph.cells){
            const cells = Object.values(graph.cells).filter((cell) => {
                return cell.Scope === "ROOM";
            });
            const bgColor=muiTheme.userTheme==='mui3'?muiTheme.palette.mui3['tertiary']:'#009688'
            const fgColor=muiTheme.userTheme==='mui3'?muiTheme.palette.mui3['on-tertiary']:'#fff'
            if(cells.length){
                elements.push(
                    <div>
                        {elements.length ? <Divider/> : null}
                        <Subheader>{cells.length === 1 ? getMessage('601') : getMessage('602').replace('%1', cells.length)}</Subheader>
                        <List style={{paddingTop: 0}}>{cells.map((cell) => {
                            return <ListItem
                                disabled={true}
                                leftAvatar={<Avatar icon={<FontIcon className={'mdi mdi-share-variant'} style={{color:fgColor}}/>} backgroundColor={bgColor} size={ListStylesCompact.avatar.avatarSize} style={ListStylesCompact.avatar.style} />}
                                primaryText={cell.Label}
                                rightIconButton={<IconButton iconClassName={"mdi mdi-open-in-new"} tooltip={"Go to Cell"} tooltipPosition={"top-left"} onClick={()=>{pydio.triggerRepositoryChange(cell.UUID);}} {...ListStylesCompact.iconButton} />}
                                {...ListStylesCompact.listItem}
                            />
                        })}</List>
                    </div>
                );
            }
        }
        return <div>{elements}</div>;
    }

}

GraphPanel = PydioContextConsumer(muiThemeable()(GraphPanel));
export {GraphPanel as default}