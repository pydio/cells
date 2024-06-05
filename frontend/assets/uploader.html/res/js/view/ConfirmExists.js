/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import Pydio from 'pydio'
import {Paper, Checkbox, RadioButtonGroup, RadioButton, RaisedButton, FlatButton} from 'material-ui'

class ConfirmExists extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            value: 'rename-folders',
            saveValue: false
        }
    }

    cancel(){
        this.props.onCancel();
    }

    submit(){
        const {value, saveValue} = this.state;
        this.props.onConfirm(value, saveValue);
    }

    checkChange(e, newValue){
        this.setState({saveValue: newValue});
    }

    radioChange(e, newValue) {
        this.setState({value: newValue});
    }

    render() {

        const pydio = Pydio.getInstance();
        const {value, saveValue} = this.state;

        return (
            <div style={{position:'absolute', padding: 16, fontSize:14, top: 49, left: 0, right: 0, bottom: 0, display: 'flex', alignItems:'center', backgroundColor:'rgba(0, 0, 0, 0.7)'}}>
                <Paper style={{width: 500, padding: 16, fontSize:14, margin:'0 auto'}} zDepth={2}>
                    <div>
                        <h5>{pydio.MessageHash[124]}</h5>
                        <RadioButtonGroup ref="group" name="shipSpeed" defaultSelected={value} onChange={this.radioChange.bind(this)}>
                            <RadioButton value="rename-folders" label={pydio.MessageHash['html_uploader.confirm.rename.all']} style={{paddingBottom: 8}}/>
                            <RadioButton value="rename" label={pydio.MessageHash['html_uploader.confirm.rename.merge']} style={{paddingBottom: 8}}/>
                            <RadioButton value="overwrite" label={pydio.MessageHash['html_uploader.confirm.overwrite']}/>
                        </RadioButtonGroup>
                    </div>
                    <div style={{display:'flex', marginTop: 30, alignItems: 'center'}}>
                        <Checkbox label={pydio.MessageHash['html_uploader.confirm.save.choice']} checked={saveValue} onCheck={this.checkChange.bind(this)}/>
                        <span style={{flex: 1}}/>
                        <FlatButton label={pydio.MessageHash[54]} onClick={this.cancel.bind(this)}/>
                        <RaisedButton primary={true} label={pydio.MessageHash[48]} onClick={this.submit.bind(this)}/>
                    </div>
                </Paper>
            </div>
        );
    }

}

export {ConfirmExists as default}