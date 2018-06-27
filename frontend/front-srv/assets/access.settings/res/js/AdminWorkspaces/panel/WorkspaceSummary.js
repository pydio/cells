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

import WorkspaceSummaryCard from './WorkspaceSummaryCard'
import Workspace from '../model/Workspace'

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],


    propTypes:{
        model:React.PropTypes.instanceOf(Workspace).isRequired
    },

    getInitialState:function(){
        return {optionsLoaded:false, workspaceInfo:null};
    },

    loadInfo: function(model){
        var optionsLoadedFunc = function(){
            this.setState({optionsLoaded:true});
        }.bind(this);
        if(model.loaded) optionsLoadedFunc();
        else model.observe('loaded', optionsLoadedFunc);
    },

    componentDidMount:function(){
        this.loadInfo(this.props.model);
    },

    componentWillReceiveProps:function(newProps){
        this.loadInfo(newProps.model);
    },

    render:function(){
        var driverIcon = 'icon-hdd', driverName, driverDescription;
        var aclsTitle, aclsDescriptions;
        if(this.state.optionsLoaded){
            driverIcon = this.props.model.getDriverIconClass();
            driverName = this.props.model.getDriverLabel();
            driverDescription = this.props.model.getDescriptionFromDriverTemplate();
            if(!driverDescription) driverDescription = <span>&nbsp;</span>

            var totalUsers = this.props.model.getSingleNodeTextFromXML("admin_data/additional_info/users/@total");
            var sharedFolders = this.props.model.getSingleNodeTextFromXML("admin_data/additional_info/shares/@total");
            aclsTitle = <span>{this.context.getMessage('ws.35').replace('%i', totalUsers)}</span>;
            aclsDescriptions = <span>{this.context.getMessage('ws.36').replace('%i', sharedFolders)}</span>
        }

        return (
            <div className="workspace-cards-container">
                <WorkspaceSummaryCard icon={driverIcon}>
                    <h4>{driverName}</h4>
                    <h5>{driverDescription?driverDescription:"&nbsp;"}</h5>
                </WorkspaceSummaryCard>
                <WorkspaceSummaryCard icon="icon-group">
                    <h4>{aclsTitle}</h4>
                    <h5>{aclsDescriptions}</h5>
                </WorkspaceSummaryCard>
                <span style={{clear:'left'}}/>
            </div>
        );
    }

});
