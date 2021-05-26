const PropTypes = require('prop-types');
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
import TeamCard from './TeamCard'
import UserCard from './UserCard'
const {Paper, IconButton} = require('material-ui')

/**
 * Container for UserCard or TeamCard
 */
class RightPanelCard extends React.Component{

    render(){

        let content;
        const item = this.props.item || {};
        if(item.type === 'user'){
            content = <UserCard {...this.props}/>
        }else if(item.IdmRole && item.IdmRole.IsTeam){
            content = <TeamCard {...this.props}/>
        }

        return (
            <Paper zDepth={2} style={{position:'relative', borderRadius: 6, ...this.props.style}}>
                <IconButton iconClassName={"mdi mdi-close"} style={{position:'absolute', top: 0, right: 0, zIndex: 2}} iconStyle={{color: '#e0e0e0'}} onClick={this.props.onRequestClose}/>
                {content}
            </Paper>
        );
    }

}

RightPanelCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: PropTypes.instanceOf(Pydio),
    /**
     * Selected item
     */
    item: PropTypes.object,
    /**
     * Applies to root container
     */
    style: PropTypes.object,
    /**
     * Forwarded to child
     */
    onRequestClose: PropTypes.func,
    /**
     * Forwarded to child
     */
    onDeleteAction: PropTypes.func,
    /**
     * Forwarded to child
     */
    onUpdateAction: PropTypes.func
};

export {RightPanelCard as default}