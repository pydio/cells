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
import PropTypes from 'prop-types';
const {TextField, FlatButton, CardTitle} = require('material-ui')
import UsersList from './UsersList'
import Loaders from './Loaders'
import ActionsPanel from '../avatar/ActionsPanel'
import PydioApi from 'pydio/http/api';
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import {muiThemeable} from "material-ui/styles";

/**
 * Display info about a Team inside a popover-able card
 */
class TeamCard extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {label: this.props.item.label};
    }

    /**
     * Use loader to get team participants
     * @param item
     */
    loadMembers(item){
        this.setState({loading: true});
        Loaders.childrenAsPromise(item, false).then((children) => {
            Loaders.childrenAsPromise(item, true).then((children) => {
                this.setState({members:item.leafs, loading: false});
            });
        });
    }
    componentWillMount(){
        this.loadMembers(this.props.item);
    }
    componentWillReceiveProps(nextProps){
        this.loadMembers(nextProps.item);
        this.setState({label: nextProps.item.label});
    }
    onLabelChange(e, value){
        this.setState({label: value});
    }
    updateLabel(){
        if(this.state.label !== this.props.item.label){
            PydioApi.getRestClient().getIdmApi().updateTeamLabel(this.props.item.IdmRole.Uuid, this.state.label, () => {
                this.props.onUpdateAction(this.props.item);
            });
        }
        const {setEdit} = this.props;
        setEdit(false)
    }
    render(){
        const {model, item, onDeleteAction, getMessage, edit, setEdit, muiTheme} = this.props;

        const editProps = {
            team: item,
            userEditable: this.props.item.IdmRole.PoliciesContextEditable,
            onDeleteAction: () => {this.props.onDeleteAction(item._parent, [item])},
            onEditAction: () => {setEdit(true)},
            reloadAction: () => {this.props.onUpdateAction(item)}
        };

        let title;
        if(edit){
            title = (
                <div style={{display:'flex', alignItems:'center', padding: 12}}>
                    <TextField style={{flex: 1, fontSize: 24}} fullWidth={true} disabled={false} underlineShow={false} value={this.state.label} onChange={this.onLabelChange.bind(this)}/>
                    <FlatButton secondary={true} label={getMessage(48)} onClick={() => {this.updateLabel()}}/>
                </div>
            );
        }else{
            title = <CardTitle style={{padding:'12px 16px 4px'}} title={this.state.label} subtitle={(item.leafs && item.leafs.length ? getMessage(576).replace('%s', item.leafs.length) : getMessage(577))}/>;
        }
        const {style, ...otherProps} = this.props;
        let panelStyle = {}
        if(muiTheme.userTheme !== 'mui3') {
            panelStyle = {borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0'}
        }
        return (
            <div>
                <div style={{paddingBottom:4}}>
                    {title}
                    <ActionsPanel {...otherProps} {...editProps} style={{paddingLeft: 8, ...panelStyle}} />
                </div>
                <UsersList model={model} subHeader={getMessage(575)} onItemClicked={()=>{}} item={item} mode="inner" onDeleteAction={onDeleteAction}/>
            </div>
        )
    }

}

TeamCard.propTypes = {
    /**
     * Pydio instance
     */
    pydio: PropTypes.instanceOf(Pydio),
    /**
     * Team data object
     */
    item: PropTypes.object,
    /**
     * Applied to root container
     */
    style: PropTypes.object,
    /**
     * Called to dismiss the popover
     */
    onRequestClose: PropTypes.func,
    /**
     * Delete current team
     */
    onDeleteAction: PropTypes.func,
    /**
     * Update current team
     */
    onUpdateAction: PropTypes.func
};

TeamCard = PydioContextConsumer(muiThemeable()(TeamCard));

export {TeamCard as default}