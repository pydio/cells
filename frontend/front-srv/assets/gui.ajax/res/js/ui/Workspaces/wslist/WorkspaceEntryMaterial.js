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

const React = require('react')
const Pydio = require('pydio')

const {ListItem, Avatar, FontIcon, Style} = require('material-ui')
const {muiThemeable} = require('material-ui/styles')
const PropTypes = require('prop-types');
const Repository = require('pydio/model/repository')

class WorkspaceEntryMaterial extends React.Component{

    onClick(){
        if(this.props.onWorkspaceTouchTap){
            this.props.onWorkspaceTouchTap(this.props.workspace.getId());
            return;
        }
        if(this.props.workspace.getId() === this.props.pydio.user.activeRepository && this.props.showFoldersTree){
            this.props.pydio.goTo('/');
        }else{
            this.props.pydio.triggerRepositoryChange(this.props.workspace.getId());
        }
    }

    render(){

        const {workspace, muiTheme} = this.props;
        let leftAvatar, leftIcon;
        let color = muiTheme.palette.primary1Color;
        //let backgroundColor = new Color(muiTheme.palette.primary1Color).lightness(96).rgb().toString();
        let backgroundColor = '#ECEFF1';
        if(workspace.getOwner() || workspace.getAccessType() === 'inbox'){
            color = Style.colors.teal500;
            let icon = workspace.getAccessType() === 'inbox' ? 'file-multiple' : 'folder-outline';
            if(workspace.getRepositoryType() === 'remote') icon = 'cloud-outline';
            leftAvatar =  <Avatar backgroundColor={backgroundColor} color={color} icon={<FontIcon className={'mdi mdi-' + icon}/>}/>
        }else{
            leftAvatar = <Avatar style={{fontSize:18}} backgroundColor={backgroundColor} color={color}>{workspace.getLettersBadge()}</Avatar>;
        }
        return (
            <ListItem
                leftAvatar={leftAvatar}
                leftIcon={leftIcon}
                primaryText={workspace.getLabel()}
                secondaryText={workspace.getDescription()}
                onClick={this.onClick.bind(this)}
            />
        );

    }

}

WorkspaceEntryMaterial.propTypes = {
    pydio    : PropTypes.instanceOf(Pydio).isRequired,
    workspace: PropTypes.instanceOf(Repository).isRequired,
    muiTheme : PropTypes.object
};

WorkspaceEntryMaterial = muiThemeable()(WorkspaceEntryMaterial);
export {WorkspaceEntryMaterial as default}