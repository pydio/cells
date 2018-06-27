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

import React from 'react'
import MetaList from '../meta/MetaList'
import Workspace from '../model/Workspace'

export default React.createClass({

    mixins:[AdminComponents.MessagesConsumerMixin],

    propTypes:{
        onSelectionChange:React.PropTypes.func.isRequired,
        metaSourceProvider:React.PropTypes.object.isRequired,
        driverLabel:React.PropTypes.string,
        driverDescription:React.PropTypes.string,
        currentSelection:React.PropTypes.string,
        model:React.PropTypes.instanceOf(Workspace),
        tplFieldsComponent:React.PropTypes.object
    },

    setEditState:function(key){
        this.props.onSelectionChange(key);
    },

    closeCurrent:function(event){
        event.stopPropagation();
        this.setEditState('activity');
    },

    render: function(){

        let firstSections = [];
        let driverTabLabel = this.context.getMessage('ws.9');
        return (
            <div>
                <PydioComponents.PaperEditorNavHeader key="parameters-k" label={this.context.getMessage('ws.29')}/>
                <PydioComponents.PaperEditorNavEntry keyName='general' key='general' selectedKey={this.props.currentSelection} label={this.context.getMessage('ws.30')} onClick={this.setEditState}/>
                <PydioComponents.PaperEditorNavEntry keyName='driver' key='driver' selectedKey={this.props.currentSelection} onClick={this.setEditState}>{driverTabLabel}</PydioComponents.PaperEditorNavEntry>
                {firstSections}
                {this.props.tplFieldsComponent}
            </div>
        );
    }

});
