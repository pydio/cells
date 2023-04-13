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
const {FlatButton, Divider} = require('material-ui')
const Pydio = require('pydio')
const {ThemedContainers:{Popover}} = Pydio.requireLib('hoc')
import PasswordForm from './PasswordForm'

class PasswordPopover extends React.Component{

    constructor(props, context){
        super(props, context);
        this.state = {passOpen: false, passValid: false, passAnchor: null};
    }

    passOpenPopover(event){
        this.setState({passOpen: true, passAnchor:event.currentTarget});
    }

    passClosePopover(){
        this.setState({passOpen: false});
    }

    passValidStatusChange(status){
        this.setState({passValid: status});
    }

    passSubmit(){
        this.refs.passwordForm.post(function(value){
            if(value) this.passClosePopover();
        }.bind(this));
    }

    render(){
        let pydio = this.props.pydio;
        let {passOpen, passAnchor, passValid} = this.state;
        return (
            <div style={{marginLeft: 8}}>
                <FlatButton
                    onClick={this.passOpenPopover.bind(this)}
                    label={pydio.MessageHash[194]}
                    secondary={true}
                />
                <Popover
                    open={passOpen}
                    anchorEl={passAnchor}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    onRequestClose={this.passClosePopover.bind(this)}
                    zDepth={4}
                >
                    <div>
                        <div style={{padding: '15px 15px 0', fontSize: 15}}>{pydio.MessageHash[194]}</div>
                        <PasswordForm
                            style={{width:386, padding:10, paddingBottom: 30}}
                            pydio={pydio}
                            ref="passwordForm"
                            onValidStatusChange={this.passValidStatusChange.bind(this)}
                        />
                        <Divider/>
                        <div style={{textAlign:'right', padding: '8px 0'}}>
                            <FlatButton label={pydio.MessageHash[54]} onClick={this.passClosePopover.bind(this)}/>
                            <FlatButton disabled={!passValid} label="Ok" onClick={this.passSubmit.bind(this)}/>
                        </div>
                    </div>
                </Popover>
            </div>
        );

    }

}

export {PasswordPopover as default}