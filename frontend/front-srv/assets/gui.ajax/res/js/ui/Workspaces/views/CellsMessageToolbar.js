/*
 * Copyright 2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio Cells.
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
import {muiThemeable} from 'material-ui/styles'

class CellsMessageToolbar extends React.Component{

    constructor(props){
        super(props);
        const {pydio} = props;
        const node = pydio.getContextHolder().getContextNode();
        if(node && (node.getMetadata().has("virtual_root") || node.getMetadata().has('local:renderListCustomMessage'))){
            this.state = {display:true}
        } else {
            this.state = {display:false}
        }
    }

    componentDidMount(){
        const {pydio} = this.props;
        this._observer = () => {
            const node = pydio.getContextHolder().getContextNode();
            if(node && (node.getMetadata().has("virtual_root") || node.getMetadata().has('local:renderListCustomMessage'))){
                this.setState({display:true});
            } else {
                this.setState({display:false});
            }
        };
        pydio.observe('context_changed', this._observer);
    }

    componentWillUnmount(){
        const {pydio} = this.props;
        pydio.stopObserving('context_changed', this._observer);
    }

    /**
     *
     * @return {*}
     */
    render() {
        const {display} = this.state;
        const {pydio, muiTheme} = this.props;
        if (!display) {
            return null;
        }
        let s = {padding: 16, color: '#9E9E9E', borderBottom: '1px solid #F5F5F5'};
        if(muiTheme.userTheme === 'mui3') {
            const mui3 = muiTheme.palette.mui3
            s = {padding: 16, borderBottom:'1px solid ' + mui3['outline-variant-50']}
        }
        const node = pydio.getContextHolder().getContextNode();
        if(node.getMetadata().has('local:renderListCustomMessage')){
            return node.getMetadata().get('local:renderListCustomMessage')(node, s);
        }
        return <div style={s}>{pydio.MessageHash['638']}</div>
    }

}

CellsMessageToolbar = muiThemeable()(CellsMessageToolbar)
export {CellsMessageToolbar as default}