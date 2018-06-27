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

/**
 * Get info from Pydio controller an build an
 * action bar with active actions.
 * TBC
 */
export default React.createClass({

    propTypes:{
        dataModel:React.PropTypes.instanceOf(PydioDataModel).isRequired,
        node:React.PropTypes.instanceOf(AjxpNode).isRequired,
        actions:React.PropTypes.array
    },

    clickAction: function(event){
        var actionName = event.currentTarget.getAttribute("data-action");
        this.props.dataModel.setSelectedNodes([this.props.node]);
        var a = window.pydio.Controller.getActionByName(actionName);
        a.fireContextChange(this.props.dataModel, true, window.pydio.user);
        //a.fireSelectionChange(this.props.dataModel);
        a.apply([this.props.dataModel]);
        event.stopPropagation();
        event.preventDefault();
    },

    render: function(){
        var actions = this.props.actions.map(function(a){
            return(
                <div
                    key={a.options.name}
                    className={a.options.icon_class+' material-list-action-inline' || ''}
                    title={a.options.title}
                    data-action={a.options.name}
                    onClick={this.clickAction}></div>
            );
        }.bind(this));
        return(
            <span>
                    {actions}
                </span>
        );

    }
});

