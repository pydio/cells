const React = require('react');
const Repository = require('pydio/model/repository');

const {List, Subheader, Divider} = require('material-ui')

import WorkspaceEntryMaterial from './WorkspaceEntryMaterial'

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

import Pydio from 'pydio'

class WorkspacesListMaterial extends React.Component{

    render(){
        const {workspaces,showTreeForWorkspace, filterByType} = this.props;
        let inboxEntry, entries = [], sharedEntries = [], remoteShares = [];

        workspaces.forEach(function(object, key){

            if (Repository.isInternal(object.getId())) return;
            if (object.getAccessStatus() === 'declined') return;

            const entry = (
                <WorkspaceEntryMaterial
                    {...this.props}
                    key={key}
                    workspace={object}
                    showFoldersTree={showTreeForWorkspace && showTreeForWorkspace===key}
                />
            );
            if (object.getAccessType() == "inbox") {
                inboxEntry = entry;
            } else if(object.getOwner()) {
                if(object.getRepositoryType() === 'remote'){
                    remoteShares.push(entry);
                }else{
                    sharedEntries.push(entry);
                }
            } else {
                entries.push(entry);
            }
        }.bind(this));
        
        const messages = pydio.MessageHash;

        let allEntries;
        if(sharedEntries.length){
            sharedEntries.unshift(<Subheader>{messages[626]}</Subheader>);
        }
        if(inboxEntry){
            if(sharedEntries.length){
                sharedEntries.unshift(<Divider/>);
            }
            sharedEntries.unshift(inboxEntry);
            sharedEntries.unshift(<Subheader>{messages[630]}</Subheader>);
        }
        if(remoteShares.length){
            remoteShares.unshift(<Subheader>{messages[627]}</Subheader>)
            remoteShares.unshift(<Divider/>)
            sharedEntries = sharedEntries.concat(remoteShares);
        }
        if(filterByType === 'entries'){
            entries.unshift(<Subheader>{messages[468]}</Subheader>);
        }
        if(filterByType){
            allEntries = filterByType === 'shared' ? sharedEntries : entries
        }else{
            allEntries = entries.concat(sharedEntries);
        }

        return (
            <List style={this.props.style}>
                {allEntries}
            </List>
        );


    }

}

WorkspacesListMaterial.propTypes = {
    pydio                   : PropTypes.instanceOf(Pydio),
    workspaces              : PropTypes.instanceOf(Map),
    filterByType            : PropTypes.oneOf(['shared', 'entries', 'create']),

    sectionTitleStyle       : PropTypes.object,
    showTreeForWorkspace    : PropTypes.string,
    onHoverLink             : PropTypes.func,
    onOutLink               : PropTypes.func,
    className               : PropTypes.string,
    style                   : PropTypes.object
}



export {WorkspacesListMaterial as default}
