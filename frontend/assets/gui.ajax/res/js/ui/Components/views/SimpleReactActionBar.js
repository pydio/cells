import React from 'react';

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
import {Node} from 'pydio/model/node'
import {PydioDataModel} from 'pydio/model/data-model'

/**
 * Get info from Pydio controller an build an
 * action bar with active actions.
 * TBC
 */
export default class SimpleReactActionBar extends React.Component{

    static propTypes = {
        dataModel:PropTypes.instanceOf(PydioDataModel).isRequired,
        node:PropTypes.instanceOf(Node).isRequired,
        actions:PropTypes.array
    }

    clickAction(event){
        const pydio = Pydio.getInstance();
        const actionName = event.currentTarget.getAttribute("data-action");
        const {dataModel, node} = this.props;
        dataModel.setSelectedNodes([node]);
        const a = pydio.Controller.getActionByName(actionName);
        a.fireContextChange(dataModel, true, pydio.user);
        a.apply([dataModel]);
        event.stopPropagation();
        event.preventDefault();
    }

    render(){
        const actions = this.props.actions.map(function(a){
            return(
                <div
                    key={a.options.name}
                    className={a.options.icon_class+' material-list-action-inline' || ''}
                    title={a.options.title}
                    data-action={a.options.name}
                    onClick={(e) => this.clickAction(e)}></div>
            );
        }.bind(this));
        return(
            <span>
                    {actions}
                </span>
        );

    }
}